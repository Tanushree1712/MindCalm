import React, { useState } from 'react';
import { X, Phone, MessageSquare, Globe, Search, Shield, HeartHandshake } from 'lucide-react';

interface EmergencyDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HelplineItem {
  id: string;
  name: string;
  country: 'USA' | 'Canada' | 'UK' | 'Australia' | 'International';
  category: 'General Crisis' | 'Youth & LGBTQ+' | 'Veterans' | 'Domestic Violence' | 'Specialty';
  phone?: string;
  textInstructions?: string;
  website: string;
  description: string;
  availability: string;
}

const HELPLINES: HelplineItem[] = [
  {
    id: 'us-988',
    name: '988 Suicide & Crisis Lifeline',
    country: 'USA',
    category: 'General Crisis',
    phone: '988',
    textInstructions: 'Text 988',
    website: 'https://988lifeline.org',
    description: 'Free, confidential support for anyone in emotional distress or suicidal crisis. Spanish and deaf/hard-of-hearing available.',
    availability: '24/7 / 365 Days'
  },
  {
    id: 'us-ctl',
    name: 'Crisis Text Line',
    country: 'USA',
    category: 'General Crisis',
    textInstructions: 'Text HOME to 741741',
    website: 'https://www.crisistextline.org',
    description: 'Connect with a crisis counselor over SMS text for support during anxiety, panic attacks, depression, or distress.',
    availability: '24/7'
  },
  {
    id: 'trevor-project',
    name: 'The Trevor Project (LGBTQ+ Youth)',
    country: 'USA',
    category: 'Youth & LGBTQ+',
    phone: '1-866-488-7386',
    textInstructions: 'Text START to 678-678',
    website: 'https://www.thetrevorproject.org',
    description: 'Crisis intervention and suicide prevention services for lesbian, gay, bisexual, transgender, queer, and questioning young people.',
    availability: '24/7'
  },
  {
    id: 'veterans-crisis',
    name: 'Veterans Crisis Line',
    country: 'USA',
    category: 'Veterans',
    phone: '988 (Press 1)',
    textInstructions: 'Text 838255',
    website: 'https://www.veteranscrisisline.net',
    description: 'Caring, qualified responders for Veterans, Service members, National Guard and Reserve, and their families.',
    availability: '24/7'
  },
  {
    id: 'ca-988',
    name: '988 Suicide Crisis Helpline Canada',
    country: 'Canada',
    category: 'General Crisis',
    phone: '988',
    textInstructions: 'Text 988',
    website: 'https://988.ca',
    description: 'Bilingual (English and French) mental health crisis support across all Canadian provinces and territories.',
    availability: '24/7'
  },
  {
    id: 'uk-samaritans',
    name: 'Samaritans UK',
    country: 'UK',
    category: 'General Crisis',
    phone: '116 123',
    website: 'https://www.samaritans.org',
    description: 'Whatever you’re going through, a Samaritan will face it with you. Free from any phone in the UK.',
    availability: '24/7'
  },
  {
    id: 'uk-shout',
    name: 'Shout Crisis Text Line UK',
    country: 'UK',
    category: 'General Crisis',
    textInstructions: 'Text SHOUT to 85258',
    website: 'https://giveusashout.org',
    description: 'Free, confidential, 24/7 text support service for anyone in the UK struggling to cope.',
    availability: '24/7'
  },
  {
    id: 'au-lifeline',
    name: 'Lifeline Australia',
    country: 'Australia',
    category: 'General Crisis',
    phone: '13 11 14',
    textInstructions: 'Text 0477 13 11 14',
    website: 'https://www.lifeline.org.au',
    description: 'National charity providing all Australians experiencing emotional distress with access to 24-hour crisis support.',
    availability: '24/7'
  },
  {
    id: 'au-beyond-blue',
    name: 'Beyond Blue Australia',
    country: 'Australia',
    category: 'General Crisis',
    phone: '1300 22 4636',
    website: 'https://www.beyondblue.org.au',
    description: 'Mental health information and support for anxiety, depression, and well-being.',
    availability: '24/7'
  },
  {
    id: 'intl-befrienders',
    name: 'Befrienders Worldwide',
    country: 'International',
    category: 'General Crisis',
    website: 'https://www.befrienders.org',
    description: 'Global directory of emotional support hotlines in over 30 countries worldwide. Find help in your local language.',
    availability: 'Global Network'
  },
  {
    id: 'intl-iasp',
    name: 'International Association for Suicide Prevention (IASP)',
    country: 'International',
    category: 'General Crisis',
    website: 'https://www.iasp.info/resources/Crisis_Centres',
    description: 'Official crisis center finder across Europe, Asia, South America, Africa, and Oceania.',
    availability: 'Directory'
  },
  {
    id: 'us-the-hotline',
    name: 'National Domestic Violence Hotline',
    country: 'USA',
    category: 'Domestic Violence',
    phone: '1-800-799-SAFE (7233)',
    textInstructions: 'Text "START" to 88788',
    website: 'https://www.thehotline.org',
    description: 'Highly confidential support, safety planning, and resources for survivors of domestic abuse.',
    availability: '24/7'
  }
];

export const EmergencyDirectoryModal: React.FC<EmergencyDirectoryModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const filtered = HELPLINES.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.country.toLowerCase().includes(search.toLowerCase());
    
    const matchesCountry = selectedCountry === 'All' || item.country === selectedCountry;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCountry && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#35463A]/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FBF9F3] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-diffused-organic border border-[#DEDCCF] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#EDE9DF]/70 border-b border-[#DEDCCF] flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#EDE9DF] text-[#A75D43] flex items-center justify-center shrink-0 shadow-2xs border border-[#A75D43]/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#3A5A40] tracking-[-0.01em]">Emergency & Crisis Helpline Directory</h2>
              <p className="text-xs sm:text-sm text-[#6C786B] mt-1">
                Free, confidential, and compassionate crisis support services available right now.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6C786B] hover:text-[#35463A] rounded-xl hover:bg-[#DEDCCF]/50 transition"
            aria-label="Close directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-[#DEDCCF] bg-[#F4EFE6] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6C786B] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by country, keyword, or organization..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F3] border border-[#DEDCCF] rounded-2xl text-xs sm:text-sm text-[#35463A] focus:outline-none focus:ring-2 focus:ring-[#588157]/20 focus:border-[#588157] transition min-h-[44px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#6C786B] font-medium mr-1">Region:</span>
            {['All', 'USA', 'Canada', 'UK', 'Australia', 'International'].map(c => (
              <button
                key={c}
                onClick={() => setSelectedCountry(c)}
                className={`min-h-[36px] px-3 py-1 rounded-xl transition ${
                  selectedCountry === c
                    ? 'bg-[#588157] text-[#FBF9F3] font-semibold shadow-xs'
                    : 'bg-[#EDE9DF] text-[#35463A] border border-[#DEDCCF] hover:bg-[#E2E8D7]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Helpline List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#6C786B] text-sm">
              No matching helplines found. Please reach out to <a href="tel:988" className="text-[#A75D43] underline font-medium">988</a> or visit <a href="https://www.befrienders.org" target="_blank" rel="noreferrer" className="text-[#588157] underline font-medium">Befrienders Worldwide</a>.
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl border border-[#DEDCCF] bg-[#FBF9F3] hover:border-[#A3B18A] transition hover:shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-semibold px-2 py-0.5 rounded-md bg-[#EDE9DF] text-[#3A5A40]">
                      {item.country}
                    </span>
                    <span className="text-[#588157] font-medium">
                      {item.category}
                    </span>
                    <span className="text-[#6C786B]">· {item.availability}</span>
                  </div>

                  <h3 className="font-semibold text-[#3A5A40] text-base">{item.name}</h3>
                  <p className="text-xs text-[#35463A]/80 leading-relaxed max-w-xl">{item.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {item.phone && (
                    <a
                      href={`tel:${item.phone.replace(/[^0-9]/g, '')}`}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#A75D43] hover:bg-[#8F4E37] text-[#FBF9F3] text-xs font-semibold flex items-center space-x-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{item.phone}</span>
                    </a>
                  )}

                  {item.textInstructions && (
                    <span className="min-h-[44px] px-3 py-2 rounded-xl bg-[#EDE9DF] text-[#35463A] border border-[#DEDCCF] text-xs font-medium flex items-center space-x-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#588157]" />
                      <span>{item.textInstructions}</span>
                    </span>
                  )}

                  <a
                    href={item.website}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[44px] px-3 py-2 rounded-xl border border-[#DEDCCF] hover:bg-[#EDE9DF] text-[#6C786B] hover:text-[#35463A] text-xs font-medium flex items-center space-x-1 transition"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Website</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
