import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Advertisement, AdvertisementStats, AdPlacement, AdStatus, AdTargetAudience } from '../types/index.js';
import { AdvertisementCard } from '../components/ui/AdvertisementCard.js';
import { StatCard } from '../components/ui/StatCard.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { SearchBar } from '../components/ui/SearchBar.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import {
  Megaphone,
  PlusCircle,
  Eye,
  MousePointerClick,
  TrendingUp,
  Layers,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  X,
  ChevronRight,
} from 'lucide-react';

interface AdminAdvertisementsProps {
  navigate?: (path: string) => void;
}

interface AdFormData {
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  placement: AdPlacement;
  status: AdStatus;
  startDate: string;
  endDate: string;
  priority: number;
  targetAudience: AdTargetAudience;
}

const defaultFormData: AdFormData = {
  title: '',
  description: '',
  imageUrl: '',
  buttonText: 'Learn More',
  buttonUrl: '',
  placement: 'all',
  status: 'active',
  startDate: '',
  endDate: '',
  priority: 5,
  targetAudience: 'all',
};

export const AdminAdvertisements: React.FC<AdminAdvertisementsProps> = ({ navigate }) => {
  const { token, user } = useAuth();
  const { success, error } = useToast();

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [stats, setStats] = useState<AdvertisementStats>({
    totalAds: 0,
    activeAds: 0,
    inactiveAds: 0,
    scheduledAds: 0,
    totalImpressions: 0,
    totalClicks: 0,
    ctr: 0,
    placementDistribution: {},
  });

  const [isLoading, setIsLoading] = useState(true);
  const [placementFilter, setPlacementFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState<AdFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Delete Confirm Dialog
  const [deleteItem, setDeleteItem] = useState<Advertisement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview Dialog
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);

  const fetchAdvertisements = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [adsRes, statsRes] = await Promise.all([
        fetch(
          `/api/advertisements?placement=${placementFilter}&status=${statusFilter}&search=${encodeURIComponent(
            searchQuery
          )}&page=${page}&limit=12`,
          { headers }
        ),
        fetch('/api/advertisements/stats', { headers }),
      ]);

      if (adsRes.ok) {
        const data = await adsRes.json();
        setAds(data.items || []);
        setTotalPages(data.pages || 1);
      }

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData);
      }
    } catch (err: any) {
      console.error('Error fetching advertisements:', err);
      error('Failed to load advertisements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAdvertisements();
  }, [token, placementFilter, statusFilter, searchQuery, page]);

  const handleOpenCreate = () => {
    setEditingAd(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || '',
      description: ad.description || '',
      imageUrl: ad.imageUrl || '',
      buttonText: ad.buttonText || 'Learn More',
      buttonUrl: ad.buttonUrl || '',
      placement: ad.placement || 'all',
      status: ad.status || 'active',
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().slice(0, 10) : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 10) : '',
      priority: ad.priority || 1,
      targetAudience: ad.targetAudience || 'all',
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error('Please select an image file (JPG, PNG, or WEBP)');
      return;
    }

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image upload failed');

      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      success('Image uploaded successfully');
    } catch (err: any) {
      error(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.imageUrl.trim() || !formData.buttonUrl.trim()) {
      error('Title, Image URL, and Destination Link are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        priority: Number(formData.priority) || 1,
      };

      const url = editingAd ? `/api/advertisements/${editingAd._id}` : '/api/advertisements';
      const method = editingAd ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save advertisement');

      success(editingAd ? 'Campaign updated successfully' : 'New campaign created successfully');
      setIsModalOpen(false);
      fetchAdvertisements();
    } catch (err: any) {
      error(err.message || 'Failed to submit campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (ad: Advertisement) => {
    const nextStatus: AdStatus = ad.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/advertisements/${ad._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      success(`Campaign status set to ${nextStatus}`);
      setAds((prev) => prev.map((item) => (item._id === ad._id ? { ...item, status: nextStatus } : item)));
      fetchAdvertisements();
    } catch (err: any) {
      error(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/advertisements/${deleteItem._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete advertisement');

      success('Advertisement deleted permanently');
      setDeleteItem(null);
      fetchAdvertisements();
    } catch (err: any) {
      error(err.message || 'Failed to delete advertisement');
    } finally {
      setIsDeleting(false);
    }
  };

  // Mock object for live preview
  const livePreviewAd: Advertisement = {
    _id: 'preview-sample',
    title: formData.title || 'Your Campaign Headline Appears Here',
    description: formData.description || 'Describe your educational program, scholarship, hackathon, or sponsor offer in concise detail.',
    imageUrl:
      formData.imageUrl ||
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
    buttonText: formData.buttonText || 'Learn More',
    buttonUrl: formData.buttonUrl || '#',
    placement: formData.placement,
    status: formData.status,
    priority: formData.priority,
    impressions: 1240,
    clicks: 145,
    targetAudience: formData.targetAudience,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Megaphone className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Advertisement & Sponsor Hub
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Centrally manage academic sponsorships, career fairs, partner announcements, and placement campaigns across Hamro BCA.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdvertisements}
            className="flex items-center gap-1.5"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Campaign</span>
          </Button>
        </div>
      </div>

      {/* Performance Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Campaigns"
          value={stats.totalAds}
          icon={<Layers className="w-5 h-5 text-blue-600" />}
          description={`${stats.activeAds} Active`}
          color="blue"
        />
        <StatCard
          label="Active Live"
          value={stats.activeAds}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          description={`${stats.scheduledAds} Scheduled`}
          color="emerald"
        />
        <StatCard
          label="Total Impressions"
          value={stats.totalImpressions.toLocaleString()}
          icon={<Eye className="w-5 h-5 text-purple-600" />}
          description="Across all views"
          color="purple"
        />
        <StatCard
          label="Total Clicks"
          value={stats.totalClicks.toLocaleString()}
          icon={<MousePointerClick className="w-5 h-5 text-amber-600" />}
          description="User engagements"
          color="amber"
        />
        <StatCard
          label="Click-Through (CTR)"
          value={`${stats.ctr}%`}
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          description="Conversion rate"
          color="blue"
        />
      </div>

      {/* Controls & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search campaigns by title, copy, or link..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Placement:</span>
            <select
              value={placementFilter}
              onChange={(e) => {
                setPlacementFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="all">All Placements</option>
              <option value="homepage">Homepage</option>
              <option value="student_dashboard">Student Dashboard</option>
              <option value="course_pages">Course Pages</option>
              <option value="resource_vault">Resource Vault</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns Table / Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-500">Loading campaign inventory...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No advertisements found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              {searchQuery || placementFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Get started by creating your first partner banner or academic campaign.'}
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Create First Campaign
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Campaign & Creative</th>
                  <th className="px-4 py-3.5">Placement</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Performance</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Schedule</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ads.map((ad) => {
                  const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';
                  return (
                    <tr
                      key={ad._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Campaign & Creative */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5 max-w-sm">
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                              {ad.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {ad.description || 'No description'}
                            </p>
                            <a
                              href={ad.buttonUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline mt-1"
                            >
                              <span className="truncate max-w-[180px]">{ad.buttonUrl}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Placement */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            ad.placement === 'homepage'
                              ? 'blue'
                              : ad.placement === 'student_dashboard'
                              ? 'purple'
                              : ad.placement === 'course_pages'
                              ? 'amber'
                              : ad.placement === 'resource_vault'
                              ? 'emerald'
                              : 'slate'
                          }
                          size="sm"
                        >
                          {ad.placement.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <div className="text-[10px] text-slate-400 mt-1 capitalize">
                          Audience: {ad.targetAudience}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(ad)}
                          title="Click to toggle status"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border"
                          style={{
                            backgroundColor:
                              ad.status === 'active'
                                ? 'rgba(16, 185, 129, 0.1)'
                                : ad.status === 'scheduled'
                                ? 'rgba(245, 158, 11, 0.1)'
                                : 'rgba(100, 116, 139, 0.1)',
                            borderColor:
                              ad.status === 'active'
                                ? 'rgba(16, 185, 129, 0.3)'
                                : ad.status === 'scheduled'
                                ? 'rgba(245, 158, 11, 0.3)'
                                : 'rgba(100, 116, 139, 0.3)',
                            color:
                              ad.status === 'active'
                                ? '#10b981'
                                : ad.status === 'scheduled'
                                ? '#f59e0b'
                                : '#64748b',
                          }}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              ad.status === 'active'
                                ? 'bg-emerald-500 animate-pulse'
                                : ad.status === 'scheduled'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span className="capitalize">{ad.status}</span>
                        </button>
                      </td>

                      {/* Performance */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {ad.clicks.toLocaleString()} clicks / {ad.impressions.toLocaleString()} views
                          </div>
                          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {ctr}% CTR
                          </div>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Priority {ad.priority}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {ad.startDate ? new Date(ad.startDate).toLocaleDateString() : 'Immediate'}
                            {' - '}
                            {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'Evergreen'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewAd(ad)}
                            title="Live Preview"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(ad)}
                            title="Edit Campaign"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteItem(ad)}
                            title="Delete Campaign"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL WITH LIVE PREVIEW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {editingAd ? 'Edit Campaign Details' : 'Create New Sponsor Campaign'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure creative copy, landing URLs, placement targets, and schedule timing.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Form Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Campaign Headline *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Nepal IT Career Fair & Internship Summit 2026"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Description / Body Copy
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Provide a compelling hook explaining why BCA students should click..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden resize-none"
                    />
                  </div>

                  {/* Image Upload & URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Promotional Creative (Image) *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        required
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                      <label className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors border border-slate-200 dark:border-slate-700">
                        <UploadCloud className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
                        <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Button Text & Destination URL */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        CTA Button Label *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        placeholder="e.g., Register Now"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Target Link URL *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.buttonUrl}
                        onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                        placeholder="https://... or /resources"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Placement & Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Display Placement
                      </label>
                      <select
                        value={formData.placement}
                        onChange={(e) => setFormData({ ...formData, placement: e.target.value as AdPlacement })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                      >
                        <option value="all">Everywhere (All Views)</option>
                        <option value="homepage">Homepage Banner</option>
                        <option value="student_dashboard">Student Dashboard</option>
                        <option value="course_pages">Course Pages</option>
                        <option value="resource_vault">Resource Vault</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Campaign Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as AdStatus })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                      >
                        <option value="active">Active (Immediate)</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="inactive">Inactive (Draft)</option>
                      </select>
                    </div>
                  </div>

                  {/* Scheduling Dates & Priority */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Priority (1-100)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Interactive Live Preview */}
                <div className="space-y-4 flex flex-col justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        Live Creative Preview
                      </span>
                      <span className="text-[10px] text-slate-400">Updates in Real-Time</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Standard Bento Card Layout:
                        </span>
                        <AdvertisementCard
                          placement={formData.placement}
                          variant="card"
                          ad={livePreviewAd}
                          navigate={navigate}
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Compact Strip Layout:
                        </span>
                        <AdvertisementCard
                          placement={formData.placement}
                          variant="compact"
                          ad={livePreviewAd}
                          navigate={navigate}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300">
                    💡 <strong>Smart Rotation:</strong> Advertisements with higher priority ratings will take visual precedence within their respective placement containers.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving Campaign...' : editingAd ? 'Update Campaign' : 'Launch Campaign'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE PREVIEW DIALOG */}
      {previewAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Live View: {previewAd.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewAd(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Full Banner Format (Homepage / Vault Top)
                </span>
                <AdvertisementCard placement={previewAd.placement} variant="banner" ad={previewAd} navigate={navigate} />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Grid Card Format (Student Dashboard / Courses)
                </span>
                <div className="max-w-md">
                  <AdvertisementCard placement={previewAd.placement} variant="card" ad={previewAd} navigate={navigate} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setPreviewAd(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        title="Delete Advertisement Campaign"
        message={`Are you sure you want to delete "${deleteItem?.title}"? All click and impression analytics for this campaign will be purged.`}
        confirmText="Yes, Delete Campaign"
        cancelText="Cancel"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteItem(null)}
      />
    </div>
  );
};
