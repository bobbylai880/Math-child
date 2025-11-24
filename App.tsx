
import React, { useState, useCallback, useRef } from 'react';
import { VerticalEquation } from './components/VerticalEquation';
import { NumberPad } from './components/NumberPad';
import { MakeTenVisual } from './components/MakeTenVisual';
import { StickerBoard } from './components/StickerBoard';
import { getEncouragement } from './services/geminiService';
import { playSound } from './services/audioService';

// --- Constants & Types ---
const TOTAL_ROUNDS = 5;
const PASSING_SCORE = 3;

type GameState = 'START' | 'PLAYING' | 'SUMMARY' | 'STICKERS';
type Step = 'ONES' | 'CARRY_ANIMATION' | 'TENS' | 'COMPLETE';
type Level = 1 | 2; // 1: No Carry, 2: With Carry

interface Problem {
  num1: number;
  num2: number;
  hasCarry: boolean;
}

// Reward Stickers
const STICKER_POOL = ['🦁', '🐼', '🐨', '🦊', '🐰', '🦄', '🦕', '🐳', '🚀', '⭐'];

const getRandomSticker = () => STICKER_POOL[Math.floor(Math.random() * STICKER_POOL.length)];

// --- Logic Helpers ---

const generateProblem = (level: Level): Problem => {
  while (true) {
    // Generate numbers
    let num1, num2;
    if (level === 1) {
      // Simple, no carry (sum of ones < 10)
      num1 = Math.floor(Math.random() * 40) + 10; 
      const maxOnes2 = 9 - (num1 % 10);
      const ones2 = Math.floor(Math.random() * (maxOnes2 + 1));
      const tens2 = Math.floor(Math.random() * 4) + 1;
      num2 = tens2 * 10 + ones2;
    } else {
      // Carry required (sum of ones >= 10)
      num1 = Math.floor(Math.random() * 60) + 15;
      num2 = Math.floor(Math.random() * 60) + 15;
    }

    const ones1 = num1 % 10;
    const ones2 = num2 % 10;
    const sum = num1 + num2;
    const hasCarry = (ones1 + ones2) >= 10;

    // Validate level constraints
    if (sum < 100) {
      if (level === 1 && !hasCarry) return { num1, num2, hasCarry };
      if (level === 2 && hasCarry) return { num1, num2, hasCarry };
    }
  }
};

// --- Main Component ---

const App: React.FC = () => {
  // Navigation State
  const [gameState, setGameState] = useState<GameState>('START');
  const [level, setLevel] = useState<Level>(1);
  const [stickers, setStickers] = useState<string[]>([]);
  
  // Round State
  const [currentProblem, setCurrentProblem] = useState<Problem>({ num1: 0, num2: 0, hasCarry: false });
  const [step, setStep] = useState<Step>('ONES');
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  
  // Input State
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [tensResult, setTensResult] = useState<string>('');
  const [onesResult, setOnesResult] = useState<string>('');
  
  // UX State
  const [message, setMessage] = useState<string>('准备好了吗？');
  const [isError, setIsError] = useState<boolean>(false);
  const [showMakeTenHint, setShowMakeTenHint] = useState<boolean>(false);

  // Audio helper
  const play = (type: 'correct' | 'wrong' | 'click' | 'success' | 'levelUp') => {
    playSound(type);
  };

  // --- Game Flow Methods ---

  const initGame = (selectedLevel: Level) => {
    play('click');
    setLevel(selectedLevel);
    setScore(0);
    setRoundsPlayed(0);
    setGameState('PLAYING');
    nextRound(selectedLevel, 0);
  };

  const nextRound = (lvl: Level, currentRound: number) => {
    if (currentRound >= TOTAL_ROUNDS) {
      endLevel();
      return;
    }
    const p = generateProblem(lvl);
    setCurrentProblem(p);
    setStep('ONES');
    setInputBuffer('');
    setTensResult('');
    setOnesResult('');
    setShowMakeTenHint(false);
    setIsError(false);
    
    const onesMsg = lvl === 2 ? '个位加个位，满十要进一哦！' : '我们先算个位数：';
    setMessage(onesMsg);
  };

  const endLevel = () => {
    play('success');
    setGameState('SUMMARY');
    // Award sticker if score is good
    if (score >= PASSING_SCORE) {
      const newSticker = getRandomSticker();
      // Ensure unique if possible, or just add
      if (!stickers.includes(newSticker)) {
        setStickers(prev => [...prev, newSticker]);
      }
    }
  };

  const handleInput = (num: number) => {
    play('click');
    if (step === 'COMPLETE' || step === 'CARRY_ANIMATION') return;
    if (inputBuffer.length < 2) {
      setInputBuffer(prev => prev + num);
      setIsError(false);
    }
  };

  const handleClear = () => {
    play('click');
    setInputBuffer('');
    setIsError(false);
  };

  const handleConfirm = async () => {
    if (inputBuffer === '') return;
    
    const val = parseInt(inputBuffer);
    const ones1 = currentProblem.num1 % 10;
    const ones2 = currentProblem.num2 % 10;
    const sumOnes = ones1 + ones2;
    
    const tens1 = Math.floor(currentProblem.num1 / 10);
    const tens2 = Math.floor(currentProblem.num2 / 10);

    // --- Step 1: Solving Ones Column ---
    if (step === 'ONES') {
      // In level 2 (carry), the sum of ones is like 13.
      // We expect the user to type 13? Or 3?
      // Standard teaching: "8 + 5 = 13". Write 3, carry 1.
      // To keep keypad simple, let's accept the full sum "13" OR just "3" if they understand visually.
      // But for teaching, typing "13" confirms they know the sum.
      
      const isCorrectSum = val === sumOnes;
      const isCorrectDigit = val === (sumOnes % 10); // They just typed 3 for 13

      if (isCorrectSum) {
        // Correct!
        play('correct');
        const aiMsg = await getEncouragement(true);
        setMessage(aiMsg);
        
        // Show the digit
        setOnesResult((sumOnes % 10).toString());
        setInputBuffer('');
        setIsError(false);

        if (currentProblem.hasCarry) {
          // Trigger Animation
          setStep('CARRY_ANIMATION');
          setMessage('个位满十啦！把10个一变成1个十 🎈');
          
          setTimeout(() => {
            play('levelUp'); // Sound effect for carry
            setStep('TENS');
            setMessage(`进位1！现在算十位：${tens1} + ${tens2} + 1 = ?`);
          }, 2500);
        } else {
          // No Carry
          setStep('TENS');
          setMessage(`算对啦！现在算十位：${tens1} + ${tens2} = ?`);
        }
      } else {
        // Wrong
        play('wrong');
        setIsError(true);
        const aiMsg = await getEncouragement(false);
        setMessage(aiMsg);
        
        // If they failed a carry problem, show hint
        if (level === 2 && currentProblem.hasCarry) {
          setShowMakeTenHint(true);
        }
      }
    } 
    // --- Step 2: Solving Tens Column ---
    else if (step === 'TENS') {
      const carryVal = currentProblem.hasCarry ? 1 : 0;
      const correctTens = tens1 + tens2 + carryVal;
      
      if (val === correctTens) {
        play('success');
        setTensResult(correctTens.toString());
        setInputBuffer('');
        setStep('COMPLETE');
        setScore(s => s + 1);
        
        const finalSum = currentProblem.num1 + currentProblem.num2;
        setMessage(`太棒了！答案是 ${finalSum} 🎉`);

        setTimeout(() => {
          setRoundsPlayed(prev => {
            const next = prev + 1;
            nextRound(level, next);
            return next;
          });
        }, 3000);
      } else {
        play('wrong');
        setIsError(true);
        setMessage(currentProblem.hasCarry 
          ? "十位数算错啦，别忘了加上进位的1哦！" 
          : "十位数再算算看？");
      }
    }
  };

  // --- Render Views ---

  if (gameState === 'START') {
    return (
      <div className="min-h-screen bg-cute-green flex flex-col items-center justify-center p-4 font-comic relative overflow-hidden">
         {/* Background Elements */}
         <div className="absolute top-10 left-10 text-6xl animate-bounce-short opacity-30">🦁</div>
         <div className="absolute bottom-10 right-10 text-6xl animate-bounce-short opacity-30 delay-100">🐼</div>

        <div className="bg-white p-10 rounded-3xl shadow-2xl border-b-8 border-cute-blue text-center max-w-md w-full z-10">
          <h1 className="text-5xl font-bold text-cute-pink mb-2 tracking-wide">
            加法大冒险
          </h1>
          <p className="text-gray-500 mb-8 text-lg">一起来挑战进位加法吧！</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => initGame(1)}
              className="w-full bg-cute-yellow hover:bg-yellow-200 text-yellow-800 text-xl font-bold py-4 rounded-xl shadow-md border-b-4 border-yellow-300 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              ⭐ 第一关：简单热身
            </button>
            
            <button 
              onClick={() => initGame(2)}
              className="w-full bg-cute-pink hover:bg-pink-300 text-white text-xl font-bold py-4 rounded-xl shadow-md border-b-4 border-pink-300 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              🚀 第二关：进位挑战
            </button>

            <button 
              onClick={() => { play('click'); setGameState('STICKERS'); }}
              className="w-full bg-white hover:bg-gray-50 text-cute-blue text-lg font-bold py-3 rounded-xl border-2 border-cute-blue dashed transition-all"
            >
              🎒 我的贴纸 ({stickers.length})
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'STICKERS') {
    return <StickerBoard stickers={stickers} onBack={() => { play('click'); setGameState('START'); }} />;
  }

  if (gameState === 'SUMMARY') {
    const isPass = score >= PASSING_SCORE;
    return (
      <div className="min-h-screen bg-cute-orange/20 flex flex-col items-center justify-center p-4 font-comic">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border-b-8 border-cute-orange text-center max-w-md w-full animate-bounce-short">
          <h1 className="text-4xl font-bold text-gray-700 mb-6">
            {isPass ? '🎉 闯关成功！' : '💪 继续加油！'}
          </h1>
          <div className="text-8xl mb-6">
            {score === TOTAL_ROUNDS ? '🌟🌟🌟' : score >= PASSING_SCORE ? '🌟🌟' : '🌟'}
          </div>
          <p className="text-2xl text-gray-600 mb-2">
            答对 {score} / {TOTAL_ROUNDS} 题
          </p>
          {isPass && <p className="text-cute-pink font-bold mb-6">获得新贴纸啦！快去看看！</p>}
          
          <button 
            onClick={() => { play('click'); setGameState('START'); }}
            className="w-full bg-cute-blue hover:bg-blue-300 text-white text-2xl font-bold py-4 rounded-xl shadow-lg border-b-4 border-blue-300 active:border-b-0 active:translate-y-1 transition-all"
          >
            返回主菜单 🏠
          </button>
        </div>
      </div>
    );
  }

  // --- Playing View ---

  return (
    <div className="min-h-screen bg-cute-blue/10 flex flex-col items-center py-6 px-4 font-comic relative overflow-hidden">
      
      {/* Header Info */}
      <div className="w-full max-w-md flex justify-between items-center mb-4">
        <button 
           onClick={() => setGameState('START')}
           className="bg-white/80 p-2 rounded-lg text-sm text-gray-500 hover:bg-white"
        >
          ❌ 退出
        </button>
        <div className="flex gap-2">
          <div className="bg-white px-3 py-1 rounded-full shadow-sm text-cute-pink font-bold text-sm">
            关卡 {level}
          </div>
          <div className="bg-white px-3 py-1 rounded-full shadow-sm text-cute-blue font-bold text-sm">
            {roundsPlayed + 1}/{TOTAL_ROUNDS}
          </div>
        </div>
      </div>

      {/* Message Bubble */}
      <div className="bg-white p-4 rounded-2xl mb-4 min-h-[4rem] flex items-center justify-center text-center max-w-md w-full shadow-md border-2 border-cute-green relative">
        <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-cute-green transform rotate-45 translate-x-[-50%]"></div>
        <p className="text-lg text-gray-700 font-bold">
          {message}
        </p>
      </div>

      {/* Equation Component */}
      <VerticalEquation 
        num1={currentProblem.num1}
        num2={currentProblem.num2}
        userOnes={step === 'ONES' ? inputBuffer : onesResult}
        userTens={step === 'TENS' ? inputBuffer : tensResult}
        carry={step !== 'ONES' && currentProblem.hasCarry}
        activeField={step === 'ONES' ? 'ones' : (step === 'TENS' ? 'tens' : 'complete')}
        isError={isError}
      />

      {/* Make 10 Visualizer (Only shows when needed in Carry step) */}
      {showMakeTenHint && step === 'ONES' && currentProblem.hasCarry && (
        <MakeTenVisual num1={currentProblem.num1 % 10} num2={currentProblem.num2 % 10} />
      )}

      {/* Input Pad */}
      <div className="w-full mt-auto pb-4">
        <NumberPad 
          onPress={handleInput} 
          onClear={handleClear} 
          onConfirm={handleConfirm}
          disabled={step === 'COMPLETE' || step === 'CARRY_ANIMATION'}
        />
      </div>
    </div>
  );
};

export default App;
