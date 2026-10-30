import React from 'react';
import { PhoneCall, MessageSquare, AlertCircle, HeartHandshake, ExternalLink, X } from 'lucide-react';

interface CrisisSafetyBannerProps {
  onOpenFullDirectory: () => void;
  onDismiss?: () => void;
}

export const CrisisSafetyBanner: React.FC<CrisisSafetyBannerProps> = ({
  onOpenFullDirectory,
  onDismiss
}) => {
  return (
    <div className="bg-[#FBF9F3] border-2 border-[#A75D43]/60 rounded-3xl p-5 sm:p-6 shadow-diffused-organic relative overflow-hidden transition-all duration-300">
      <div className="flex items-start space-x-3.5">
        <div className="w-11 h-11 rounded-2xl bg-[#EDE9DF] flex items-center justify-center text-[#A75D43] shrink-0 mt-0.5 shadow-2xs">
          <HeartHandshake className="w-6 h-6" />
        </div>

        <div className="flex-1 pr-10">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#A75D43]">
            <span>Immediate Support Available</span>
            <span aria-hidden="true" className="text-[#DEDCCF]">·</span>
            <span className="text-[#6C786B] font-medium">Free, Confidential, 24/7</span>
          </div>

          <h3 className="text-base sm:text-lg font-serif font-bold text-[#3A5A40] mt-1 tracking-[-0.01em]">
            You do not have to carry this alone. Help is right here.
          </h3>
          <p className="text-xs sm:text-sm text-[#35463A]/90 mt-1 leading-relaxed">
            If you or someone you care about is experiencing overwhelming pain, acute despair, or thoughts of self-harm, compassionate professionals are ready to listen without judgment right now.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <a
              href="tel:988"
              className="min-h-[44px] inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#A75D43] hover:bg-[#8F4E37] text-[#FBF9F3] font-semibold text-xs sm:text-sm shadow-xs transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 988 Lifeline</span>
            </a>

            <a
              href="sms:741741?&body=HOME"
              className="min-h-[44px] inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#EDE9DF] hover:bg-[#E2E8D7] text-[#3A5A40] border border-[#DEDCCF] font-semibold text-xs sm:text-sm transition"
            >
              <MessageSquare className="w-4 h-4 text-[#A75D43]" />
              <span>Text HOME to 741741</span>
            </a>

            <button
              onClick={onOpenFullDirectory}
              className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-[#3A5A40] hover:text-[#588157] text-xs sm:text-sm font-semibold transition underline underline-offset-4"
            >
              <span>International & Specialty Directory</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 text-[#6C786B] hover:text-[#35463A] p-2 rounded-xl hover:bg-[#EDE9DF] transition min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
