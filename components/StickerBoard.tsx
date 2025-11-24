
import React from 'react';

interface StickerBoardProps {
  stickers: string[];
  onBack: () => void;
}

export const StickerBoard: React.FC<StickerBoardProps> = ({ stickers, onBack }) => {
  return (
    <div className="min-h-screen bg-cute-yellow flex flex-col items-center justify-center p-4 font-comic">
      <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-cute-orange max-w-2xl w-full">
        <h2 className="text-4xl font-bold text-center text-cute-pink mb-2">我的贴纸册</h2>
        <p className="text-center text-gray-500 mb-8">收集到的宝贝都在这里啦！</p>
        
        {stickers.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
            还没有贴纸哦，快去闯关吧！
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
            {stickers.map((sticker, idx) => (
              <div key={idx} className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-5xl shadow-sm hover:scale-110 transition-transform cursor-pointer border border-gray-100">
                {sticker}
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={onBack}
          className="w-full mt-8 bg-cute-blue hover:bg-blue-300 text-white text-xl font-bold py-3 rounded-xl shadow-lg"
        >
          返回主菜单
        </button>
      </div>
    </div>
  );
};
