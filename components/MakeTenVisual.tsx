
import React from 'react';

interface MakeTenVisualProps {
  num1: number;
  num2: number;
}

export const MakeTenVisual: React.FC<MakeTenVisualProps> = ({ num1, num2 }) => {
  // Logic: Use dots. Move dots from num2 to num1 to make 10.
  const neededForTen = 10 - num1;
  const remaining = num2 - neededForTen;

  return (
    <div className="bg-white/90 p-4 rounded-xl border-2 border-dashed border-cute-orange mt-2 animate-bounce-short">
      <div className="text-center text-sm text-gray-500 mb-2 font-bold">凑十法小助手</div>
      
      {/* Container for the 10-frame concept */}
      <div className="flex items-center justify-center gap-4">
        
        {/* The first number (trying to become 10) */}
        <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 w-32 relative">
          <div className="text-xs text-center text-gray-400 mb-1">先凑满10</div>
          <div className="grid grid-cols-5 gap-1">
            {/* Original dots of num1 */}
            {Array.from({ length: num1 }).map((_, i) => (
              <div key={`n1-${i}`} className="w-4 h-4 rounded-full bg-cute-blue" />
            ))}
            {/* Ghost dots filling the rest (from num2) */}
            {Array.from({ length: neededForTen }).map((_, i) => (
              <div key={`fill-${i}`} className="w-4 h-4 rounded-full bg-cute-pink animate-pulse border-2 border-white" />
            ))}
          </div>
        </div>

        <div className="text-xl font-bold text-gray-400">+</div>

        {/* The remaining of second number */}
        <div className="bg-pink-50 p-2 rounded-lg border border-pink-200 min-w-[3rem]">
           <div className="text-xs text-center text-gray-400 mb-1">剩下</div>
           <div className="grid grid-cols-3 gap-1 justify-center">
             {Array.from({ length: remaining }).map((_, i) => (
                <div key={`rem-${i}`} className="w-4 h-4 rounded-full bg-cute-pink/50" />
             ))}
           </div>
           <div className="text-center font-bold text-cute-pink mt-1">{remaining}</div>
        </div>
      </div>
      
      <div className="text-center mt-2 text-sm text-gray-600">
        <span className="text-cute-blue font-bold">{num1}</span> 需要 <span className="text-cute-pink font-bold">{neededForTen}</span> 变成10，
        <span className="text-cute-pink font-bold">{num2}</span> 分成 <span className="font-bold">{neededForTen}</span> 和 <span className="font-bold">{remaining}</span>
      </div>
    </div>
  );
};
