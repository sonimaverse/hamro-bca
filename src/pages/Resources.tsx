import React, { useEffect, useState } from 'react';
import { Resource, ResourceType } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { ResourceCard } from '../components/ui/ResourceCard.js';
import { SearchBar } from '../components/ui/SearchBar.js';
import { Pagination } from '../components/ui/Pagination.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { Modal } from '../components/ui/Modal.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { FileUploader } from '../components/ui/FileUploader.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import { AdvertisementCard } from '../components/ui/AdvertisementCard.js';
import { FolderDown, Plus, Filter } from 'lucide-react';

interface ResourcesProps {
  navigate: (path: string) => void;
  presetType?: ResourceType;
}

export const Resources: React.FC<ResourcesProps> = ({ navigate, presetType }) => {
  const { user, token } = useAuth();
  const { success, error } = useToast();

  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedType, setSelectedType] = useState<string>(presetType || 'all');
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'official' | 'community'>('official');

  // Community Notes State
  const [communityNotes, setCommunityNotes] = useState<Resource[]>([]);
  const [communityPage, setCommunityPage] = useState(1);
  const [communityTotalPages, setCommunityTotalPages] = useState(1);
  const [isCommunityLoading, setIsCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState<string | null>(null);

  // Upload Modal State (for Teachers & Admins)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState(1);
  const [type, setType] = useState<ResourceType>('Notes');
  const [description, setDescription] = useState('');
  const [fileData, setFileData] = useState<{ url: string; fileName: string; fileSize: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contribute Modal State (for Students)
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [contributeTitle, setContributeTitle] = useState('');
  const [contributeSubject, setContributeSubject] = useState('');
  const [contributeSemester, setContributeSemester] = useState(1);
  const [contributeType, setContributeType] = useState<ResourceType>('Notes');
  const [contributeDescription, setContributeDescription] = useState('');
  const [contributeFileData, setContributeFileData] = useState<{ url: string; fileName: string; fileSize: string } | null>(null);
  const [isContributeSubmitting, setIsContributeSubmitting] = useState(false);

  // Delete Dialog State
  const [deleteResourceItem, setDeleteResourceItem] = useState<Resource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Premium Access Request State
  const [isRequestingPremium, setIsRequestingPremium] = useState(false);
  const [premiumRequested, setPremiumRequested] = useState(false);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedSemester) params.append('semester', selectedSemester.toString());
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('page', page.toString());
      params.append('limit', '12');

      const res = await fetch(`/api/resources?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResources(data.items || []);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedType, selectedSemester, searchQuery, page]);

  const fetchCommunityNotes = async () => {
    setIsCommunityLoading(true);
    setCommunityError(null);
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedSemester) params.append('semester', selectedSemester.toString());
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('page', communityPage.toString());
      params.append('limit', '12');

      const res = await fetch(`/api/resources/community?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCommunityNotes(data.items || []);
        setCommunityTotalPages(data.pages || 1);
      } else {
        const data = await res.json();
        setCommunityError(data.error || 'Failed to load community notes');
      }
    } catch (err) {
      console.error('Failed to load community notes', err);
      setCommunityError('Failed to load community notes');
    } finally {
      setIsCommunityLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'community') {
      fetchCommunityNotes();
    }
  }, [viewMode, selectedType, selectedSemester, searchQuery, communityPage]);

  // Reflect an existing pending/rejected request so cards do not offer a duplicate request.
  useEffect(() => {
    if (!token) {
      setPremiumRequested(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/subscriptions/my-request', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const requests: any[] = Array.isArray(data.requests) ? data.requests : [];
        if (cancelled) return;
        // The API returns the newest request first.
        setPremiumRequested(requests[0]?.status === 'pending');
      } catch {
        // Leave the default state; the backend still rejects duplicates with 409.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleDownload = async (res: Resource) => {
    if (!res.fileUrl) {
      error('Premium subscription required to download this material.');
      return;
    }
    try {
      await fetch(`/api/resources/${res._id}/download`, { method: 'POST' });
      // Optimistically increment download count
      setResources((prev) =>
        prev.map((r) => (r._id === res._id ? { ...r, downloads: (r.downloads || 0) + 1 } : r))
      );
      window.open(res.fileUrl, '_blank');
    } catch (e) {
      window.open(res.fileUrl, '_blank');
    }
  };

  const handleRequestPremium = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isRequestingPremium) return;
    setIsRequestingPremium(true);
    try {
      const res = await fetch('/api/subscriptions/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: user.name,
          email: user.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'Failed to submit premium access request');
        if (res.status === 409) {
          setPremiumRequested(true);
        }
      } else {
        success('Premium access request submitted for review.');
        setPremiumRequested(true);
      }
    } catch (err: any) {
      error(err.message || 'Request failed');
    } finally {
      setIsRequestingPremium(false);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData) {
      error('Please select or upload a document file first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          subject,
          semester: Number(semester),
          type,
          fileUrl: fileData.url,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'Failed to upload resource');
      } else {
        success('Resource published successfully!');
        setIsUploadModalOpen(false);
        setTitle('');
        setSubject('');
        setDescription('');
        setFileData(null);
        fetchResources();
      }
    } catch (err: any) {
      error(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeFileData) {
      error('Please select or upload a document file first.');
      return;
    }
    if (!contributeTitle.trim()) {
      error('Note title is required.');
      return;
    }
    if (!contributeSubject.trim()) {
      error('Subject is required.');
      return;
    }
    if (contributeSemester < 1 || contributeSemester > 8) {
      error('Semester must be between 1 and 8.');
      return;
    }

    setIsContributeSubmitting(true);
    try {
      const res = await fetch('/api/resources/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: contributeTitle,
          description: contributeDescription,
          subject: contributeSubject,
          semester: Number(contributeSemester),
          type: contributeType,
          fileUrl: contributeFileData.url,
          fileName: contributeFileData.fileName,
          fileSize: contributeFileData.fileSize,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'Failed to submit contribution');
      } else {
        success('Your note has been published to the community!');
        setIsContributeModalOpen(false);
        setContributeTitle('');
        setContributeSubject('');
        setContributeDescription('');
        setContributeFileData(null);
        fetchCommunityNotes();
      }
    } catch (err: any) {
      error(err.message || 'Submission error');
    } finally {
      setIsContributeSubmitting(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!deleteResourceItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/resources/${deleteResourceItem._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        success('Resource removed successfully');
        setDeleteResourceItem(null);
        fetchResources();
      } else {
        const data = await res.json();
        error(data.error || 'Failed to delete');
      }
    } catch (err: any) {
      error(err.message || 'Deletion error');
    } finally {
      setIsDeleting(false);
    }
  };

  const types = ['all', 'PDF', 'Notes', 'Past Questions', 'Assignments', 'Slides'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const canManage = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-outfit">
            Academic Resource Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Download verified lecture handouts, previous TU board exams, and laboratory codes
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Upload Material
          </Button>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        <button
          onClick={() => setViewMode('official')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'official'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Official Resources
        </button>
        <button
          onClick={() => setViewMode('community')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'community'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Community Notes
        </button>
      </div>

      {/* Verified Exam & Partner Resource Spotlight */}
      <AdvertisementCard placement="resource_vault" variant="banner" navigate={navigate} />

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={(q) => {
                setSearchQuery(q);
                setPage(1);
              }}
              placeholder="Search by topic title or subject (e.g., C Programming, Discrete Math)..."
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedType(t);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedType === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Semester Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            Semester:
          </span>
          <button
            onClick={() => {
              setSelectedSemester(null);
              setPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
              selectedSemester === null
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            All
          </button>
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => {
                setSelectedSemester(sem);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                selectedSemester === sem
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Sem {sem}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      {viewMode === 'official' ? (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            </div>
          ) : resources.length === 0 ? (
            <EmptyState
              icon={<FolderDown className="w-8 h-8 text-blue-500" />}
              title="No Resources Found"
              description="There are currently no uploaded documents matching your filters."
              actionText="Clear Filters"
              onAction={() => {
                setSelectedType('all');
                setSelectedSemester(null);
                setSearchQuery('');
                setPage(1);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res) => (
                <ResourceCard
                  key={res._id}
                  resource={res}
                  onDownload={handleDownload}
                  onDelete={(r) => setDeleteResourceItem(r)}
                  canManage={canManage}
                  isPremiumViewer={user?.isPremium === true || canManage}
                  isAuthenticated={!!user}
                  isPremiumRequestPending={premiumRequested || isRequestingPremium}
                  onRequestPremium={handleRequestPremium}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      ) : (
        <>
          {isCommunityLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            </div>
          ) : communityError ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 text-sm mb-4">{communityError}</p>
              <Button variant="outline" size="sm" onClick={fetchCommunityNotes}>
                Retry
              </Button>
            </div>
          ) : communityNotes.length === 0 ? (
            <EmptyState
              icon={<FolderDown className="w-8 h-8 text-blue-500" />}
              title="No Community Notes Found"
              description="No student contributions match your filters yet. Be the first to share your notes!"
              actionText="Clear Filters"
              onAction={() => {
                setSelectedType('all');
                setSelectedSemester(null);
                setSearchQuery('');
                setCommunityPage(1);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityNotes.map((res) => (
                <ResourceCard
                  key={res._id}
                  resource={res}
                  onDownload={handleDownload}
                  canManage={false}
                  showUploader={true}
                  isPremiumViewer={user?.isPremium === true}
                  isAuthenticated={!!user}
                  isPremiumRequestPending={premiumRequested || isRequestingPremium}
                  onRequestPremium={handleRequestPremium}
                />
              ))}
            </div>
          )}

          {/* Contribute Button - only for students in community view */}
          {user?.role === 'student' && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setIsContributeModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                variant="primary"
              >
                Contribute a Note
              </Button>
            </div>
          )}

          {/* Community Pagination */}
          <Pagination
            currentPage={communityPage}
            totalPages={communityTotalPages}
            onPageChange={(p) => setCommunityPage(p)}
          />
        </>
      )}

      {/* Upload Material Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Academic Material"
        description="Share official syllabus notes, past question papers, or slides with BCA scholars."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateResource} className="space-y-4">
          <Input
            label="Resource Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Unit 3 Trees & Graphs Comprehensive Handout"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Subject Name / Code"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Data Structures (CACS201)"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Document Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ResourceType)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Notes">Lecture Notes</option>
              <option value="Past Questions">Past Board Questions</option>
              <option value="Slides">Presentation Slides</option>
              <option value="Assignments">Assignments & Lab Manual</option>
              <option value="PDF">Syllabus PDF / Reference</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Summary / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what's covered in this file..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Uploader */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Attach File
            </label>
            <FileUploader
              onUploadSuccess={(info) => setFileData(info)}
              maxSizeMB={15}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Publish Resource
            </Button>
          </div>
        </form>
      </Modal>

      {/* Contribute Note Modal (Students only) */}
      <Modal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        title="Contribute a Community Note"
        description="Share your study notes, solved papers, or reference materials with fellow BCA students. Your contribution will be immediately public."
        maxWidth="xl"
      >
        <form onSubmit={handleContribute} className="space-y-4">
          <Input
            label="Note Title"
            value={contributeTitle}
            onChange={(e) => setContributeTitle(e.target.value)}
            placeholder="e.g. Unit 3 Trees & Graphs - My Comprehensive Notes"
            required
            error={!contributeTitle.trim() && isContributeSubmitting ? 'Note title is required.' : undefined}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Subject Name / Code"
              value={contributeSubject}
              onChange={(e) => setContributeSubject(e.target.value)}
              placeholder="e.g. Data Structures (CACS201)"
              required
              error={!contributeSubject.trim() && isContributeSubmitting ? 'Subject is required.' : undefined}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Semester
              </label>
              <select
                value={contributeSemester}
                onChange={(e) => setContributeSemester(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
              {isContributeSubmitting && (contributeSemester < 1 || contributeSemester > 8) && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">Semester must be between 1 and 8.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Document Category
            </label>
            <select
              value={contributeType}
              onChange={(e) => setContributeType(e.target.value as ResourceType)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Notes">Lecture Notes</option>
              <option value="Past Questions">Past Board Questions</option>
              <option value="Slides">Presentation Slides</option>
              <option value="Assignments">Assignments & Lab Manual</option>
              <option value="PDF">Syllabus PDF / Reference</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Summary / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={contributeDescription}
              onChange={(e) => setContributeDescription(e.target.value)}
              placeholder="Brief summary of what's covered in this file..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Uploader */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Attach File
            </label>
            <FileUploader
              onUploadSuccess={(info) => setContributeFileData(info)}
              maxSizeMB={15}
            />
            {!contributeFileData && isContributeSubmitting && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">Please select or upload a document file first.</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsContributeModalOpen(false)}
              disabled={isContributeSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isContributeSubmitting}>
              Publish Note
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteResourceItem}
        onClose={() => setDeleteResourceItem(null)}
        onConfirm={handleDeleteResource}
        title="Delete Resource Material"
        message={`Are you sure you want to permanently delete "${deleteResourceItem?.title}"? This cannot be undone.`}
        confirmText="Delete Document"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
