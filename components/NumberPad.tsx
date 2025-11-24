import React from 'react';

interface NumberPadProps {
  onPress: (num: number) => void;
  onClear: () => void;
  onConfirm: () => void;
  disabled?: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({ onPress, onClear, onConfirm, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-6 max-w-xs mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          onClick={() => onPress(num)}
          disabled={disabled}
          className="bg-white hover:bg-cute-green text-gray-700 font-bold text-3xl py-4 rounded-xl shadow-md active:scale-95 transition-all border-b-4 border-gray-200 active:border-b-0 disabled:opacity-50"
        >
          {num}
        </button>
      ))}
      <button
        onClick={onClear}
        disabled={disabled}
        className="bg-cute-pink hover:bg-red-300 text-white font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-all border-b-4 border-red-200 active:border-b-0 disabled:opacity-50"
      >
        清除
      </button>
      <button
        onClick={() => onPress(0)}
        disabled={disabled}
        className="bg-white hover:bg-cute-green text-gray-700 font-bold text-3xl py-4 rounded-xl shadow-md active:scale-95 transition-all border-b-4 border-gray-200 active:border-b-0 disabled:opacity-50"
      >
        0
      </button>
      <button
        onClick={onConfirm}
        disabled={disabled}
        className="bg-cute-blue hover:bg-blue-300 text-white font-bold text-xl py-4 rounded-xl shadow-md active:scale-95 transition-all border-b-4 border-blue-200 active:border-b-0 disabled:opacity-50"
      >
        确定
      </button>
    </div>
  );
};