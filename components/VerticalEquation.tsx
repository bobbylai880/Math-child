
import React from 'react';

interface VerticalEquationProps {
  num1: number;
  num2: number;
  userOnes: string;
  userTens: string;
  carry: boolean; // Is the carry logic currently active/displayed?
  activeField: 'ones' | 'tens' | 'complete';
  isError: boolean;
  showCarryInput?: boolean; // Do we need to explicitly calculate the carry? For simplicity in this UI, we visualize it automatically.
}

export const VerticalEquation: React.FC<VerticalEquationProps> = ({ 
  num1, 
  num2, 
  userOnes, 
  userTens, 
  carry, 
  activeField,
  isError
}) => {
  const d1_tens = Math.floor(num1 / 10);
  const d1_ones = num1 % 10;
  const d2_tens = Math.floor(num2 / 10);
  const d2_ones = num2 % 10;

  // Determine which column is being highlighted
  const onesHighlight = activeField === 'ones' ? 'bg-yellow-100/50 rounded-lg' : '';
  const tensHighlight = activeField === 'tens' ? 'bg-yellow-100/50 rounded-lg' : '';

  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-xl border-4 border-cute-blue w-72 select-none">
      
      {/* Carry Bubble - Animated */}
      <div className={`absolute top-6 left-[38%] transition-all duration-700 ease-out z-10
        ${carry ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-0'}
      `}>
         <div className="w-8 h-8 rounded-full bg-cute-pink flex items-center justify-center text-white font-bold shadow-md animate-bounce">
           1
         </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-3 gap-x-2 text-6xl font-comic text-gray-700 font-bold leading-tight w-full">
        
        {/* Header Row (hidden labels for spacing) */}
        <div></div>
        <div className="text-center text-sm text-gray-300 font-normal mb-2">十位</div>
        <div className="text-center text-sm text-gray-300 font-normal mb-2">个位</div>

        {/* Number 1 */}
        <div></div>
        <div className={`text-center ${tensHighlight} transition-colors`}>{d1_tens > 0 ? d1_tens : ''}</div>
        <div className={`text-center text-cute-blue ${onesHighlight} transition-colors`}>{d1_ones}</div>

        {/* Number 2 */}
        <div className="text-right flex items-center justify-end text-gray-400">+</div>
        <div className={`text-center ${tensHighlight} transition-colors`}>{d2_tens > 0 ? d2_tens : ''}</div>
        <div className={`text-center text-cute-blue ${onesHighlight} transition-colors`}>{d2_ones}</div>

        {/* Divider Line */}
        <div className="col-span-3 px-2">
           <div className="h-1.5 bg-gray-700 rounded-full my-2 w-full"></div>
        </div>

        {/* Result Row */}
        <div></div>
        
        {/* Tens Input/Display */}
        <div className={`flex items-center justify-center h-20 w-16 rounded-lg transition-all duration-300 mx-auto
          ${activeField === 'tens' ? 'bg-cute-yellow ring-4 ring-cute-orange scale-105 shadow-inner' : 'bg-transparent'}
        `}>
          <span className="text-gray-800">{userTens}</span>
        </div>

        {/* Ones Input/Display */}
        <div className={`flex items-center justify-center h-20 w-16 rounded-lg transition-all duration-300 mx-auto
          ${activeField === 'ones' ? 'bg-cute-yellow ring-4 ring-cute-orange scale-105 shadow-inner' : 'bg-transparent'}
          ${isError && activeField === 'ones' ? 'animate-pulse bg-red-100 ring-red-400' : ''}
        `}>
          <span className="text-gray-800">{userOnes}</span>
        </div>
      </div>
    </div>
  );
};
