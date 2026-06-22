import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Sparkles, Footprints, ShieldAlert, BookOpen, Map, Milestone } from 'lucide-react';
import { motion } from 'motion/react';

export function DialogueBox() {
  const dialogue = useGameStore((state) => state.dialogue);
  const actions = useGameStore((state) => state.actions);
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Parse Dialogue for Character Portraits
  let speakerName = 'HERO RED';
  let messageContent = dialogue || '';
  let portraitType = 'HERO';

  if (dialogue) {
    if (dialogue.startsWith('PROFESSOR OAK:')) {
      speakerName = 'PROFESSOR OAK';
      messageContent = dialogue.replace('PROFESSOR OAK:', '').trim();
      portraitType = 'OAK';
    } else if (dialogue.startsWith('RIVAL GARY:')) {
      speakerName = 'RIVAL GARY';
      messageContent = dialogue.replace('RIVAL GARY:', '').trim();
      portraitType = 'RIVAL';
    } else if (dialogue.startsWith('PIKACHU:')) {
      speakerName = 'PIKACHU';
      messageContent = dialogue.replace('PIKACHU:', '').trim();
      portraitType = 'PIKACHU';
    } else if (dialogue.startsWith('BULBASAUR:')) {
      speakerName = 'BULBASAUR';
      messageContent = dialogue.replace('BULBASAUR:', '').trim();
      portraitType = 'BULBASAUR';
    } else if (dialogue.startsWith('CHARMANDER:')) {
      speakerName = 'CHARMANDER';
      messageContent = dialogue.replace('CHARMANDER:', '').trim();
      portraitType = 'CHARMANDER';
    } else if (dialogue.startsWith('NURSE JOY:')) {
      speakerName = 'NURSE JOY';
      messageContent = dialogue.replace('NURSE JOY:', '').trim();
      portraitType = 'NURSE_JOY';
    } else if (
      dialogue.includes('A sign!') || 
      dialogue.includes('says:') || 
      dialogue.toUpperCase().includes('LAB') || 
      dialogue.includes("rival's home")
    ) {
      speakerName = 'BOARD SIGN';
      messageContent = dialogue;
      portraitType = 'SIGN';
    }
  }

  // Handle Typewriter Text Effect
  useEffect(() => {
    if (!dialogue) {
      setTypedText('');
      setIsTypingComplete(false);
      return;
    }

    setTypedText('');
    setIsTypingComplete(false);
    let index = 0;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      index++;
      setTypedText(messageContent.slice(0, index));
      if (index >= messageContent.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsTypingComplete(true);
      }
    }, 18); // Fast, snappy, vintage typewriter speed

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [dialogue, messageContent]);

  // Handle Action Input (keyboard + mouse) to Skip or Close
  const handleInteraction = () => {
    if (!isTypingComplete) {
      // Skip running typewriter directly to full text
      if (timerRef.current) clearInterval(timerRef.current);
      setTypedText(messageContent);
      setIsTypingComplete(true);
    } else {
      // Clear dialogue entirely
      actions.clearDialogue();
    }
  };

  // Keyboard Shortcuts for Dialog Actioning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialogue) return;
      if (e.key === 'z' || e.key === 'x' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleInteraction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogue, isTypingComplete, messageContent]);

  if (!dialogue) return null;

  // Render stylized face portraits procedurally with pure CSS matching retro palettes
  const renderPortrait = () => {
    switch (portraitType) {
      case 'OAK':
        return (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-800 border-4 border-zinc-600 flex flex-col justify-end overflow-hidden shadow-inner">
            {/* Senior scholastic coat outline */}
            <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-start p-2">
              {/* Oak Silver Hair bangs */}
              <div className="w-14 h-6 rounded-b-full bg-slate-300 relative top-1 flex justify-around">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
              {/* Serious Specs */}
              <div className="flex gap-2.5 mt-2">
                <div className="w-4 h-3 border border-zinc-400 rounded-sm bg-neutral-100/10" />
                <div className="w-4 h-3 border border-zinc-400 rounded-sm bg-neutral-100/10" />
              </div>
              {/* Warm Smile */}
              <div className="text-red-300 font-extrabold text-xs mt-1">👴🏼</div>
            </div>
            <div className="absolute bottom-0 w-full h-8 bg-zinc-100 border-t border-zinc-400 rounded-t-lg flex justify-center items-center">
              <span className="text-[10px] text-slate-800 font-black">OAK</span>
            </div>
          </div>
        );
      case 'RIVAL':
        return (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#7950f2] border-4 border-[#5f3dc7] flex flex-col justify-end overflow-hidden shadow-inner">
            {/* Spiky hair silhouette */}
            <div className="absolute inset-x-0 top-1.5 flex justify-center gap-1">
              <div className="w-3 h-5 bg-amber-600 rotate-12 rounded-t-full" />
              <div className="w-4 h-6 bg-amber-600 -rotate-12 rounded-t-full" />
              <div className="w-3 h-5 bg-amber-600 rotate-45 rounded-t-full" />
            </div>
            {/* Sneering face details */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
              <div className="text-base font-extrabold mt-1">😏</div>
              <div className="text-[9px] text-[#ffc078] font-black mt-1">GARY</div>
            </div>
            <div className="absolute bottom-0 w-full h-7 bg-indigo-950 flex justify-center items-center">
              <span className="text-[9px] text-violet-200 font-black">RIVAL</span>
            </div>
          </div>
        );
      case 'PIKACHU':
        return (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-400 border-4 border-amber-600 flex flex-col justify-end overflow-hidden shadow-inner">
            {/* Long Pointy ears */}
            <div className="absolute -top-1 left-2 w-3.5 h-8 bg-amber-400 border-t-4 border-zinc-900 rounded-t-full -rotate-12" />
            <div className="absolute -top-1 right-2 w-3.5 h-8 bg-amber-400 border-t-4 border-zinc-900 rounded-t-full rotate-12" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <div className="flex gap-4 mb-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              </div>
              <span className="text-xl">⚡</span>
            </div>
            <div className="absolute bottom-0 w-full h-7 bg-yellow-600 flex justify-center items-center">
              <span className="text-[9px] text-[#212529] font-black">POKéMON</span>
            </div>
          </div>
        );
      case 'BULBASAUR':
        return (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-teal-500 border-4 border-teal-700 flex flex-col justify-end overflow-hidden shadow-inner">
            <div className="absolute -top-2 left-6 w-8 h-8 rounded-full bg-emerald-400 border-2 border-emerald-600 flex items-center justify-center">
              <span className="text-xs">🌿</span>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
              <span className="text-xl">🐸</span>
              <span className="text-[8px] bg-teal-900/60 px-1 rounded text-teal-200 uppercase font-black tracking-widest mt-1">GRASS</span>
            </div>
            <div className="absolute bottom-0 w-full h-7 bg-teal-900 flex justify-center items-center">
              <span className="text-[9px] text-teal-200 font-black">BULBA</span>
            </div>
          </div>
        );
      case 'CHARMANDER':
        return (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#ff922b] border-4 border-[#e8590c] flex flex-col justify-end overflow-hidden shadow-inner">
            <div className="absolute -top-1.5 right-1 animate-pulse flex flex-col items-center">
              <span className="text-xs">🔥</span>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
              <span className="text-xl">🦎</span>
              <span className="text-[8px] bg-amber-950/70 px-1 rounded text-orange-200 uppercase font-black tracking-widest mt-1">FIRE</span>
            </div>
            <div className="absolute bottom-0 w-full h-7 bg-orange-950 flex justify-center items-center">
              <span className="text-[9px] text-orange-300 font-black">CHAR</span>
            </div>
          </div>
        );
      case 'NURSE_JOY':
        return (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-pink-500 border-4 border-pink-700 flex flex-col justify-end overflow-hidden shadow-inner">
            {/* Nurse cap */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-6 bg-white rounded-b-xl border-b-2 border-pink-300 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>
            {/* Face */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-5">
              {/* Eyes */}
              <div className="flex gap-3 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
              </div>
              {/* Smile */}
              <div className="w-4 h-2 rounded-b-full bg-rose-300" />
              {/* Blush */}
              <div className="flex gap-4 mt-1">
                <div className="w-2 h-1 rounded-full bg-pink-400/60" />
                <div className="w-2 h-1 rounded-full bg-pink-400/60" />
              </div>
            </div>
            {/* Pink uniform collar */}
            <div className="absolute bottom-0 w-full h-7 bg-pink-200 border-t border-pink-300 flex justify-center items-center">
              <span className="text-[9px] text-pink-800 font-black">NURSE</span>
            </div>
            <div className="absolute -top-0.5 -right-0.5">
              <span className="text-xs">✨</span>
            </div>
          </div>
        );
      case 'SIGN':
        return (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-900 border-4 border-amber-950 flex flex-col justify-center items-center overflow-hidden shadow-inner">
            <Milestone size={32} className="text-amber-200 animate-bounce" />
            <span className="text-[9px] text-amber-200 font-black uppercase mt-1 tracking-wider">PALLET SIGN</span>
          </div>
        );
      default:
        // Cool Red Trainer Portrait
        return (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-rose-600 border-4 border-rose-800 flex flex-col justify-end overflow-hidden shadow-inner dark:bg-slate-900">
            {/* Red cap outline */}
            <div className="absolute -top-1 left-2.5 w-14 h-7 bg-red-650 rounded-t-full border-b-2 border-white flex justify-center items-center">
              <span className="text-[12px] text-white font-black">O</span>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-5">
              <div className="flex gap-2 mb-1">
                <span className="w-1.5 h-2.5 bg-zinc-900 rounded-full" />
                <span className="w-1.5 h-2.5 bg-zinc-900 rounded-full" />
              </div>
              <span className="text-[10px] text-rose-200 font-extrabold uppercase mt-1 tracking-tight">RED (HERO)</span>
            </div>
            <div className="absolute bottom-0 w-full h-7 bg-rose-950 flex justify-center items-center">
              <span className="text-[9px] text-white font-black">TRAINER</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl pointer-events-auto">
      
      {/* Dialogue Wrapper */}
      <div 
        className="bg-slate-900/95 text-white border-[4px] border-slate-700 rounded-2xl p-4 sm:p-5 shadow-[0_16px_48px_rgba(0,0,0,0.6)] cursor-pointer hover:bg-slate-900 transition-colors relative flex gap-4 items-center"
        onClick={handleInteraction}
        id="overworld-dialogue-box"
      >
        {/* Soft background gradient radial flame light */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-xl pointer-events-none" />

        {/* Dynamic Portrait Display */}
        <div className="flex-shrink-0 animate-bounce-slow">
          {renderPortrait()}
        </div>

        {/* Message Content with Typewriter */}
        <div className="flex-grow flex flex-col justify-between h-full min-h-[70px]">
          
          {/* Speaker Tag label */}
          <div className="flex items-center gap-1.5 mb-1 bg-slate-800/80 px-2 py-0.5 rounded-md w-fit border border-slate-700/60 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
            <span className="text-[10px] font-black text-rose-400 tracking-widest uppercase">{speakerName}</span>
          </div>

          {/* Scrolling Dialogue Script Text */}
          <div className="text-sm sm:text-base md:text-lg font-extrabold leading-relaxed text-zinc-100 font-mono tracking-wide selection:bg-rose-500/30">
            {typedText}
            {!isTypingComplete && (
              <span className="inline-block w-2.5 h-4 ml-1 bg-rose-500 animate-pulse" />
            )}
          </div>

          {/* Action indicator continue glyph */}
          <div className="flex justify-end mt-1.5">
            <span className="text-indigo-400 font-black text-[9px] tracking-widest flex items-center gap-1 bg-slate-950/70 py-1 px-2.5 rounded-md border border-slate-800 animate-pulse">
              <Sparkles size={10} className="animate-spin text-yellow-300" />
              <span>{isTypingComplete ? 'PRESS [Z / SPACE]' : 'TYPING... CLIK TO SKIP'}</span>
              <span>&#9660;</span>
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
