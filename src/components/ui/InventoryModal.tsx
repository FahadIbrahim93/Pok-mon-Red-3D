import { useEffect, useState } from 'react';
import { useGameStore, InventoryItem } from '../../store/gameStore';
import { 
  Heart, 
  Sparkles, 
  Star, 
  Backpack, 
  X, 
  Grid, 
  ChevronRight, 
  Compass, 
  Check, 
  ArrowUpDown, 
  Bike, 
  Map as MapIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../game/soundManager';

type SortRule = 'HIGHLIGHTS' | 'QUANTITY' | 'ALPHABETICAL';
type CategoryFilter = 'ALL' | 'RECOVERY' | 'CAPTURE' | 'STATUS_HEAL' | 'KEY_ITEM';

export function InventoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<CategoryFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortRule>('HIGHLIGHTS');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const inventoryItems = useGameStore((state) => state.inventoryItems || []);
  const bicycleActive = useGameStore((state) => state.bicycleActive);
  const showTownMap = useGameStore((state) => state.showTownMap);
  const party = useGameStore((state) => state.party);
  const position = useGameStore((state) => state.position);
  const actions = useGameStore((state) => state.actions);

  const activePokemon = party[0] || null;

  // Listen for the customs event to make trigger opening effortless
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      soundManager.playSFX('click');
    };
    window.addEventListener('open-bag', handleOpen);
    return () => window.removeEventListener('open-bag', handleOpen);
  }, []);

  // Keyboard shortcut (tab or i) to toggle inventory
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mode = useGameStore.getState().mode;
      if (mode === 'BATTLE') return;

      if (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'b') {
        e.preventDefault();
        soundManager.playSFX('click');
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Dynamic Sorting & Categorizing Rules
  const getSortedAndFilteredItems = () => {
    // A. Filter by category
    let items = [...inventoryItems];
    if (filter !== 'ALL') {
      items = items.filter((item) => item.category === filter);
    }

    // B. Sort items based on Rule
    items.sort((a, b) => {
      // Favorites ALWAYS stay top of their localized sorting context
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      if (sortBy === 'QUANTITY') {
        return b.quantity - a.quantity; // Highest quantity first
      }
      if (sortBy === 'ALPHABETICAL') {
        return a.displayName.localeCompare(b.displayName); // Alphabetical
      }
      
      // Default: "HIGHLIGHTS" (Sorted by usage category priority: recovery first, then captures, status, keys)
      const categoryWeight = {
        RECOVERY: 1,
        CAPTURE: 2,
        STATUS_HEAL: 3,
        KEY_ITEM: 4,
      };
      
      const weightA = categoryWeight[a.category] || 99;
      const weightB = categoryWeight[b.category] || 99;
      
      if (weightA !== weightB) {
        return weightA - weightB;
      }
      return b.quantity - a.quantity; // secondary fallback on count
    });

    return items;
  };

  const processedItems = getSortedAndFilteredItems();
  const favoriteItems = inventoryItems.filter((i) => i.isFavorite && i.quantity > 0);
  const selectedItem = inventoryItems.find((i) => i.id === selectedItemId) || null;

  const handleUseItem = (id: string) => {
    actions.useOverworldItem(id);
    
    // Close inventory on recovery action or when dialogue is triggered, keeping overworld focused
    const updatedItem = inventoryItems.find(i => i.id === id);
    if (updatedItem && (updatedItem.category === 'RECOVERY' || updatedItem.category === 'STATUS_HEAL' || updatedItem.category === 'KEY_ITEM')) {
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex items-center justify-center p-4 sm:p-6 text-zinc-150 font-mono">
      
      {/* Container Dashboard Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border-2 border-slate-700 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative max-h-[90vh]"
      >
        
        {/* Glow corner elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none" />

        {/* LEFT PANEL: ITEMS LIST SECTION */}
        <div className="flex-grow flex flex-col p-4 w-full md:w-3/5 border-b md:border-b-0 md:border-r border-slate-700/80 max-h-[50vh] md:max-h-[80vh] overflow-y-auto">
          
          {/* Header row details */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Backpack size={20} className="text-amber-400 animate-bounce" />
              <h2 className="text-lg font-black text-white tracking-widest">TRAINER BAG SECTIONS</h2>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg bg-slate-950 hover:bg-rose-950 border border-slate-800 text-slate-400 hover:text-rose-450 transition-colors pointer-events-auto cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Favorites (Pinned Grid Access List) */}
          {favoriteItems.length > 0 && (
            <div className="mb-4 bg-slate-950/60 p-3 rounded-xl border border-indigo-500/20">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-widest mb-2">
                <Star size={11} className="fill-amber-400 text-amber-400 animate-spin" />
                <span>Quick Access favorites</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {favoriteItems.map((item) => (
                  <button
                    key={`fav-${item.id}`}
                    onClick={() => {
                      setSelectedItemId(item.id);
                      soundManager.playSFX('click');
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all border pointer-events-auto cursor-pointer ${selectedItemId === item.id ? 'bg-amber-500/10 border-amber-400 text-amber-200' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}
                  >
                    <span className="truncate max-w-[80px]">{item.displayName}</span>
                    <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] text-slate-400">x{item.quantity}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtering Category Tabs Row */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-3 border-b border-slate-800 text-[10px] sm:text-xs">
            {(['ALL', 'RECOVERY', 'CAPTURE', 'STATUS_HEAL', 'KEY_ITEM'] as CategoryFilter[]).map((catName) => (
              <button
                key={catName}
                onClick={() => {
                  setFilter(catName);
                  soundManager.playSFX('click');
                }}
                className={`px-3 py-1.5 rounded-lg border font-black transition-all whitespace-nowrap pointer-events-auto cursor-pointer ${filter === catName ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800 text-slate-400'}`}
              >
                {catName === 'STATUS_HEAL' ? 'HEALS' : catName}
              </button>
            ))}
          </div>

          {/* Sort selection tools row */}
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2.5">
            <span>SHOWING {processedItems.length} DISTINCT ITEMS</span>
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={12} className="text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortRule);
                  soundManager.playSFX('click');
                }}
                className="bg-slate-950 border border-slate-800 text-white px-2 py-1 rounded text-[10px] font-black focus:outline-none focus:border-indigo-500 cursor-pointer pointer-events-auto"
              >
                <option value="HIGHLIGHTS">PRIORITY TYPE</option>
                <option value="QUANTITY">QUANTITY</option>
                <option value="ALPHABETICAL">ALPHABETICAL</option>
              </select>
            </div>
          </div>

          {/* Dynamic Scroll List */}
          <div className="space-y-1.5 overflow-y-auto max-h-[25vh] md:max-h-[42vh] pr-1">
            {processedItems.length === 0 ? (
              <div className="h-28 flex flex-col justify-center items-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                <Backpack size={20} className="mb-2 text-slate-600" />
                <span>NO ITEMS FOUND IN THIS BAG FILTER</span>
              </div>
            ) : (
              processedItems.map((item) => {
                const isItemFav = item.isFavorite;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItemId(item.id);
                      soundManager.playSFX('click');
                    }}
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer pointer-events-auto ${selectedItemId === item.id ? 'bg-indigo-950/40 border-indigo-500 shadow-lg scale-[0.99]' : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/80'}`}
                  >
                    
                    {/* Item title left block */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.toggleFavoriteItem(item.id);
                        }}
                        className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-500 transition-colors pointer-events-auto cursor-pointer"
                      >
                        <Star size={12} className={isItemFav ? 'fill-amber-400 text-amber-400 animate-pulse' : 'text-slate-600'} />
                      </button>

                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-extrabold text-white uppercase flex items-center gap-1.5">
                          {item.displayName}
                          {isItemFav && <span className="h-1 w-1 rounded-full bg-amber-400" />}
                        </span>
                        <span className="text-[9px] bg-slate-900/80 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-slate-800 w-fit uppercase tracking-widest mt-0.5">
                          {item.category === 'STATUS_HEAL' ? 'CONDITION' : item.category}
                        </span>
                      </div>
                    </div>

                    {/* Stock quantities display */}
                    <div className="text-right flex items-center gap-3">
                      <div className="flex flex-col text-right">
                        <span className="text-xs sm:text-sm font-black text-white">x{item.quantity}</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase">STOCK QTY</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-600" />
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* RIGHT PANEL: SELECTED ITEM DETAIL & PERSISTENT USE & INTERACTIVE LOCAL MAP */}
        <div className="w-full md:w-2/5 p-4 bg-slate-950/60 flex flex-col justify-between max-h-[40vh] md:max-h-[80vh]">
          
          <div className="h-full flex flex-col justify-between gap-4 overflow-y-auto">
            
            {/* 1. Item Visual Showcase Block */}
            {selectedItem ? (
              <div className="flex flex-col gap-3 h-full justify-between">
                
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  
                  {/* Decorative glowing header card */}
                  <div className="flex items-start justify-between mb-3 border-b border-slate-800 pb-2">
                    <div>
                      <h3 className="text-xs font-black text-rose-400 tracking-wider">BAG DESCRIPTION</h3>
                      <h1 className="text-base font-black text-white uppercase tracking-tight mt-0.5">{selectedItem.displayName}</h1>
                    </div>
                    {selectedItem.isFavorite && (
                      <span className="bg-amber-500/10 border border-amber-550 text-amber-400 text-[8px] px-2 py-0.5 font-bold uppercase rounded-md flex items-center gap-1">
                        <Star size={8} className="fill-amber-450" /> FAVORITED
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-300 leading-relaxed mb-4">
                    {selectedItem.description}
                  </p>

                  <div className="text-[10px] text-indigo-300 bg-indigo-950/10 p-2 rounded border border-indigo-900/30 font-bold">
                    🛡️ USAGE EFFECT:  
                    <span className="text-white font-black ml-1 uppercase block mt-1">
                      {selectedItem.category === 'RECOVERY' && `RESTORES ACTIVE PARTY LIVES FOR MEAL POWER OF ${selectedItem.effectPower}HP`}
                      {selectedItem.category === 'CAPTURE' && `LAUNCHES AN OUTBURST GRAB EFFICIENCY (TARGET Arena RATE)`}
                      {selectedItem.category === 'STATUS_HEAL' && `REMEDIATES CHEMICAL TOXINS & ENABLES ENERGETIC COMBAT RESTART`}
                      {selectedItem.category === 'KEY_ITEM' && `REBOUNDS TRAINER VELOCITIES & DUALGRID PALLET DISCOVERY MAPS`}
                    </span>
                  </div>

                </div>

                {/* Healing targeted active pokemon display preview */}
                {selectedItem.category === 'RECOVERY' && activePokemon && (
                  <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850 flex items-center justify-between text-xs font-bold">
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">HEALING TARGET</span>
                      <span className="text-white uppercase font-black">{activePokemon.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[9px]">PARTY HP SLIDER</span>
                      <span className="text-green-400 font-extrabold">{activePokemon.hp} / {activePokemon.maxHp} HP</span>
                    </div>
                  </div>
                )}

                {/* Bicycle active state check */}
                {selectedItem.name === 'BICYCLE' && (
                  <div className="bg-slate-900/85 p-3 rounded-xl border border-slate-800 text-center text-xs">
                    <Bike className={`mx-auto mb-2 text-yellow-400 ${bicycleActive ? 'animate-bounce' : ''}`} size={24} />
                    <span className="font-black uppercase tracking-wider block">BICYCLE VELOCITY STATE</span>
                    <span className={`inline-block px-3 py-1 rounded text-[10px] font-black mt-2 uppercase ${bicycleActive ? 'bg-green-600 text-white animate-pulse' : 'bg-slate-950 text-slate-500'}`}>
                      {bicycleActive ? 'ACTIVE (SPEED x1.7)' : 'NOT IN SERVICE (WALKING)'}
                    </span>
                  </div>
                )}

                {/* 2. Item Trigger Buttons */}
                <div className="space-y-2 mt-auto">
                  {selectedItem.quantity > 0 || selectedItem.category === 'KEY_ITEM' ? (
                    <button
                      onClick={() => handleUseItem(selectedItem.id)}
                      className={`w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer pointer-events-auto transition-all transform active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-lg shadow-emerald-950/20`}
                    >
                      {selectedItem.name === 'BICYCLE' ? (
                        <>
                          <Bike size={14} className="animate-pulse" />
                          <span>{bicycleActive ? 'DISMOUNT BICYCLE' : 'RIDE BICYCLE'}</span>
                        </>
                      ) : selectedItem.name === 'TOWN_MAP' ? (
                        <>
                          <MapIcon size={14} className="animate-spin" />
                          <span>OPEN COORDINATES NAVIGATOR</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} className="animate-bounce" />
                          <span>USE {selectedItem.displayName}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="bg-red-950/30 border border-red-900/60 text-red-400 font-black p-3 rounded-xl text-center text-xs uppercase tracking-wide">
                      🛑 OUT OF STOCK QUANTITY
                    </div>
                  )}

                  <button
                    onClick={() => {
                      actions.toggleFavoriteItem(selectedItem.id);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider border cursor-pointer pointer-events-auto transition-colors flex items-center justify-center gap-2 ${selectedItem.isFavorite ? 'bg-amber-950/30 border-amber-600/50 text-amber-400 hover:bg-slate-900' : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'}`}
                  >
                    <Star size={12} className={selectedItem.isFavorite ? 'fill-amber-400' : ''} />
                    <span>{selectedItem.isFavorite ? 'UNFAVORITE ITEM' : 'ADD TO FAVORITES'}</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-slate-500 text-center text-xs p-6 border-2 border-dashed border-slate-900 rounded-xl bg-slate-950/40">
                <Compass size={32} className="text-slate-700 animate-spin mb-3" />
                <h3 className="font-extrabold uppercase text-slate-400 mb-1">SELECT AN ACTION</h3>
                <p className="text-[10px] text-slate-650 font-bold leading-relaxed max-w-[180px]">
                  Select any travel tool, healing potion, or capture gear to view full inventory effects & triggers!
                </p>
              </div>
            )}

          </div>

        </div>

      </motion.div>

      {/* IMMERSIVE POPUP TOWN MAP OVERLAY */}
      <AnimatePresence>
        {showTownMap && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-lg p-5"
          >
            <div className="bg-slate-900 border-4 border-amber-600 p-6 rounded-2xl w-full max-w-xl text-center flex flex-col relative shadow-[0_24px_64px_rgba(245,158,11,0.25)]">
              
              {/* Wooden retro sign border details */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-600 border-2 border-slate-950 text-black font-black text-xs py-1 px-4 rounded-full uppercase tracking-widest">
                PALLET GRID NAVIGATOR
              </div>

              <div className="flex justify-between items-center mb-5 border-b-2 border-amber-600/30 pb-3">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-ping" />
                  <span className="font-black text-xs tracking-widest uppercase">GPS VISUAL MAP</span>
                </div>
                <button 
                  onClick={() => actions.closeTownMap()}
                  className="bg-slate-950 border border-slate-800 text-rose-500 hover:bg-rose-950 p-1.5 rounded-lg font-black text-xs uppercase cursor-pointer pointer-events-auto"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Graphic 2D coordinates grid layout */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-center items-center mb-4 relative shadow-inner">
                
                {/* Palette graphic visual grid */}
                <div className="grid grid-cols-12 gap-0.5 w-[300px] h-[300px] bg-slate-900 overflow-hidden rounded relative border border-slate-800 p-1">
                  
                  {/* Grid Lines background */}
                  {Array.from({ length: 144 }).map((_, idx) => {
                    const row = Math.floor(idx / 12);
                    const col = idx % 12;

                    // Landmarks check
                    // Player house coordinates [3,3]
                    // Rival house coordinates [9,3]
                    // Laboratory coordinates [7,9]
                    // Sign coords [8,4]
                    const isPlayerHouse = col >= 2 && col <= 4 && row >= 2 && row <= 3;
                    const isRivalHouse = col >= 8 && col <= 10 && row >= 2 && row <= 3;
                    const isLab = col >= 5 && col <= 8 && row >= 8 && row <= 9;
                    const isSign = col === 8 && row === 4;

                    // Player live coordinate position highlight [position[0], position[1]]
                    const isPlayerHere = col === position[0] && row === position[1];

                    let cellStyle = 'bg-slate-950/20';
                    let tileIcon = '';

                    if (isPlayerHere) {
                      cellStyle = 'bg-red-500 border border-white z-10 animate-bounce rounded-full';
                      tileIcon = '🔴';
                    } else if (isSign) {
                      cellStyle = 'bg-amber-500 border border-amber-600 rounded';
                      tileIcon = '🪧';
                    } else if (isPlayerHouse) {
                      cellStyle = 'bg-[#1c7ed6] rounded';
                      tileIcon = '🏠';
                    } else if (isRivalHouse) {
                      cellStyle = 'bg-[#7048e8] rounded';
                      tileIcon = '🏡';
                    } else if (isLab) {
                      cellStyle = 'bg-[#099268] rounded';
                      tileIcon = '🔬';
                    } else if (row >= 5 && row <= 7 && col >= 2 && col <= 9) { // High grass center
                      cellStyle = 'bg-green-900/40';
                      tileIcon = '🌿';
                    }

                    return (
                      <div 
                        key={idx} 
                        className={`w-full h-full flex items-center justify-center text-[10px] sm:text-xs select-none transition-colors border-[0.5px] border-slate-950/30 ${cellStyle}`}
                        title={`Coord (${col}, ${row})`}
                      >
                        {tileIcon}
                      </div>
                    );
                  })}

                </div>

                {/* Live indicators */}
                <div className="absolute top-2 left-2 bg-slate-900/90 text-white rounded p-2 text-[9px] font-bold border border-slate-800 text-left space-y-1 max-w-[80px]">
                  <div>🔴 RED (YOU)</div>
                  <div>🏠 MY HOUSE</div>
                  <div>🏡 GARY</div>
                </div>
                <div className="absolute top-2 right-2 bg-slate-900/90 text-white rounded p-2 text-[9px] font-bold border border-slate-800 text-left space-y-1 max-w-[80px]">
                  <div>🔬 OAK LAB</div>
                  <div>🪧 SIGN</div>
                  <div>🌿 GRASS</div>
                </div>

              </div>

              {/* coordinates log and close */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-3">
                <div className="font-bold space-y-1">
                  <div className="text-amber-400">🔴 POSITION: ({position[0]}, {position[1]})</div>
                  <div className="text-slate-400">LANDMARK: {
                    (position[0] === 8 && position[1] === 4) ? 'PALLET TOWN SIGNPOST' :
                    (position[0] >= 2 && position[0] <= 4 && position[1] >= 2 && position[1] <= 3) ? 'PLAYER RED\'S HOUSE' :
                    (position[0] >= 8 && position[0] <= 10 && position[1] >= 2 && position[1] <= 3) ? 'RIVAL GARY\'S HOUSE' :
                    (position[0] >= 5 && position[0] <= 9 && position[1] >= 8 && position[1] <= 10) ? 'PROFESSOR OAK RESEARCH LAB' :
                    (position[1] >= 5 && position[1] <= 7 && position[0] >= 2 && position[0] <= 9) ? 'WILD GRASS DENSITY REGION' : 'PALLET TOWN STREET'
                  }</div>
                </div>
                <button
                  onClick={() => actions.closeTownMap()}
                  className="bg-amber-600 hover:bg-amber-500 text-black py-2.5 px-6 font-black rounded-lg uppercase transition-all transform active:scale-95 text-center pointer-events-auto cursor-pointer"
                >
                  DISMISS MAP
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
