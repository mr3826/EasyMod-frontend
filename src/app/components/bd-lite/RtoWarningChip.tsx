import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface RtoWarningChipProps {
  score: number; // 0 to 100, where higher is riskier
  phoneMatches?: number;
  deliverySuccessRate?: number;
}

const RtoWarningChip: React.FC<RtoWarningChipProps> = ({ score, phoneMatches = 0, deliverySuccessRate = 100 }) => {
  // Determine risk level based on the mock score
  const isHighRisk = score > 60;
  const isMediumRisk = score > 30 && score <= 60;
  
  if (!isHighRisk && !isMediumRisk) return null; // Don't show if safe

  return (
    <div className={`
      flex flex-col border rounded-xl overflow-hidden shadow-sm w-full my-2
      ${isHighRisk ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}
    `}>
      <div className={`p-2.5 flex items-start gap-2 ${isHighRisk ? 'bg-red-100/50' : 'bg-orange-100/50'}`}>
        {isHighRisk ? (
          <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 shrink-0" strokeWidth={2.5}/>
        ) : (
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" strokeWidth={2.5}/>
        )}
        
        <div className="flex-1">
          <h4 className={`text-xs font-black uppercase tracking-wide ${isHighRisk ? 'text-red-900' : 'text-orange-900'}`}>
            {isHighRisk ? 'High RTO Risk Detected' : 'Medium Return Risk'}
          </h4>
          <p className={`text-[11px] font-medium mt-1 leading-snug ${isHighRisk ? 'text-red-800' : 'text-orange-800'}`}>
            {isHighRisk 
              ? `This number has ${phoneMatches} failed delivery records in recent network checks. Advance payment recommended.`
              : 'Buyer address lacks detail. Verify phone number during routing.'}
          </p>
        </div>
      </div>

      {isHighRisk && (
        <div className="px-3 pb-3 flex justify-end gap-2 mt-2">
          <button className="text-[11px] bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-700 transition">
            Request Partial Advance
          </button>
          <button className="text-[11px] bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-lg font-bold hover:bg-red-50 transition">
            Call Buyer
          </button>
        </div>
      )}
    </div>
  );
};

export default RtoWarningChip;