import React from 'react';
import { Reveal } from './Reveal.js';
import { AdvertisementCard } from '../ui/AdvertisementCard.js';

interface SponsorSectionProps {
  navigate: (path: string) => void;
}

export const SponsorSection: React.FC<SponsorSectionProps> = ({ navigate }) => {
  return (
    <section className="relative bg-navy-900/40 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Sponsors &amp; Partners</p>
          <h2 className="mt-2 font-outfit text-lg font-extrabold text-white sm:text-xl">
            Backed by organisations that care about BCA education
          </h2>
        </Reveal>

        <div className="mt-8">
          <AdvertisementCard placement="homepage" variant="compact" navigate={navigate} />
        </div>
      </div>
    </section>
  );
};
