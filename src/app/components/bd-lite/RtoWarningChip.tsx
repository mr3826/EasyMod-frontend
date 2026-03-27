import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RtoEntry {
  id?: string;
  reason?: string;
  is_global?: boolean;
  created_at?: string;
  risk_score?: number;
}

interface RtoWarningChipProps {
  score: number; // 0 to 100, where higher is riskier
  phoneMatches?: number;
  deliverySuccessRate?: number;
  rtoEntry?: RtoEntry | null;
  onWhitelist?: (entryId: string) => void;
}

const RtoWarningChip: React.FC<RtoWarningChipProps> = ({
  score,
  phoneMatches = 0,
  deliverySuccessRate = 100,
  rtoEntry,
  onWhitelist,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [whitelisted, setWhitelisted] = useState(false);

  const isHighRisk = score > 60;
  const isMediumRisk = score > 30 && score <= 60;

  if (!isHighRisk && !isMediumRisk) return null;

  const handleWhitelist = () => {
    if (rtoEntry?.id && onWhitelist) {
      onWhitelist(rtoEntry.id);
    }
    setWhitelisted(true);
  };

  if (whitelisted) {
    return (
      <div className="flex items-center gap-2 my-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-medium">
        <CheckCircle className="w-4 h-4" />
        Customer whitelist এ যোগ করা হয়েছে।
      </div>
    );
  }

  return (
    <div className={`
      flex flex-col border rounded-xl overflow-hidden shadow-sm w-full my-2
      ${isHighRisk ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}
    `}>
      <div
        className={`p-2.5 flex items-start gap-2 cursor-pointer ${isHighRisk ? 'bg-red-100/50' : 'bg-orange-100/50'}`}
        onClick={() => setExpanded(v => !v)}
      >
        {isHighRisk ? (
          <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 shrink-0" strokeWidth={2.5}/>
        ) : (
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" strokeWidth={2.5}/>
        )}

        <div className="flex-1">
          <h4 className={`text-xs font-black uppercase tracking-wide ${isHighRisk ? 'text-red-900' : 'text-orange-900'}`}>
            {isHighRisk ? t('rto.highRisk') : t('rto.mediumRisk')}
          </h4>
          <p className={`text-[11px] font-medium mt-1 leading-snug ${isHighRisk ? 'text-red-800' : 'text-orange-800'}`}>
            {isHighRisk
              ? t('rto.highRiskDetail', { count: phoneMatches })
              : t('rto.mediumRiskDetail')}
          </p>
        </div>

        <button className={`ml-1 mt-0.5 shrink-0 ${isHighRisk ? 'text-red-500' : 'text-orange-500'}`}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Transparent data panel */}
      {expanded && (
        <div className={`px-3 py-3 border-t text-xs space-y-1.5 ${isHighRisk ? 'border-red-200 bg-red-50/60' : 'border-orange-200 bg-orange-50/60'}`}>
          {rtoEntry?.reason && (
            <div className="flex gap-2">
              <span className="text-gray-500 shrink-0">কারণ:</span>
              <span className={`font-medium ${isHighRisk ? 'text-red-800' : 'text-orange-800'}`}>{rtoEntry.reason}</span>
            </div>
          )}
          {rtoEntry?.created_at && (
            <div className="flex gap-2">
              <span className="text-gray-500 shrink-0">প্রথম flag:</span>
              <span className="text-gray-700">{new Date(rtoEntry.created_at).toLocaleDateString('bn-BD')}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="text-gray-500 shrink-0">Risk score:</span>
            <span className={`font-bold ${isHighRisk ? 'text-red-700' : 'text-orange-700'}`}>{score}/100</span>
          </div>
          {rtoEntry?.is_global && (
            <p className="text-gray-400 text-[10px]">
              এই তথ্য একাধিক শপের delivery record থেকে সংগ্রহ করা হয়েছে।
            </p>
          )}

          {/* Whitelist button */}
          {!rtoEntry?.is_global && (
            <button
              onClick={handleWhitelist}
              className="mt-2 w-full text-[11px] bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              ✅ এই customer কে safe mark করুন (Whitelist)
            </button>
          )}
        </div>
      )}

      {isHighRisk && (
        <div className="px-3 pb-3 flex justify-end gap-2 mt-2">
          <button className="text-[11px] bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-700 transition">
            {t('rto.requestAdvance')}
          </button>
          <button className="text-[11px] bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-lg font-bold hover:bg-red-50 transition">
            {t('rto.callBuyer')}
          </button>
        </div>
      )}
    </div>
  );
};

export default RtoWarningChip;