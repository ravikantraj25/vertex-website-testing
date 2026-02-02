'use client'

import { useState } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { Mic, CircuitBoard, ArrowRight, Code, MoveRight } from 'lucide-react'

type EventType = {
  id: number;
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

// New event data with corrected icon
const eventsData = [
  {
    id: 1,
    Icon: Mic,
    title: 'MicDrop',
    description: 'Open mic night for poetry, music, and stand-up',
  },
  {
    id: 2,
    Icon: CircuitBoard,
    title: 'Circuit Rush',
    description: 'Hardware hackathon / circuit design challenge',
  },
  {
    id: 3,
    Icon: Code,
    title: 'Vertex Velocity',
    description: 'Mini sports fest (track, tug-of-war, football, etc.)',
  },
  {
    id: 4,
    Icon: Code, // Corrected icon from placeholder
    title: 'CodeClash',
    description: 'A competitive programming contest for all skill levels.',
  },
]

// Animation variants for the cards
const cardVariants = {
  enter: ([offset, direction]: [number, number]) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.8,
  }),
  center: ([offset, direction]: [number, number]) => ({
    x: '0%',
    y: offset === 0 ? 0 : 30,
    scale: offset === 0 ? 1 : 0.95,
    rotate: offset === 0 ? -12 : 12,
    zIndex: eventsData.length - Math.abs(offset),
    opacity: 1,
  }),
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    zIndex: 0,
  }),
};


export default function Events() {
  const [events, setEvents] = useState(eventsData);
  const [[activeIndex, direction], setActive] = useState([0, 0]); // Store index and direction

  if (!events || events.length === 0) {
    return (
      <section id="events" className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#04041e' }}>
        <h2 className="text-2xl text-gray-400">No upcoming events.</h2>
      </section>
    );
  }

  const changeCard = (newDirection: number) => {
    setActive(prev => {
      let newIndex = prev[0] + newDirection;
      if (newIndex < 0) newIndex = events.length - 1;
      else if (newIndex >= events.length) newIndex = 0;
      return [newIndex, newDirection];
    });
  };

  const prevIndex = (activeIndex - 1 + events.length) % events.length;
  const nextIndex = (activeIndex + 1) % events.length;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipe = info.offset.x;
    if (swipe > 50) changeCard(-1); // Swipe right
    else if (swipe < -50) changeCard(1); // Swipe left
  };

  return (
    <section
      id="events"
      className="relative flex flex-col justify-center items-center min-h-screen py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundColor: '#04041e' }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(123,49,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(123,49,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl font-semibold text-yellow-200 mb-4"
            style={{ textShadow: '0 0 10px rgba(247, 247, 247, 0.4), 0 0 20px rgba(241, 242, 245, 0.2)' }}
          >
            Upcoming Events
          </h2>
        </div>

        <div className="w-full flex justify-center items-center h-[550px]">
          <div className="hidden lg:flex lg:w-4/12 lg:-mr-32">
            <SideCard event={events[prevIndex]} />
          </div>

          <div className="relative w-full lg:w-7/12 h-full flex items-center justify-center z-10">
            <AnimatePresence initial={false} custom={direction}>
              {events.map((event, index) => {
                const offset = index - activeIndex;
                if (Math.abs(offset) > 1) return null;

                const isFrontCard = offset === 0;

                return (
                  <motion.div
                    key={event.id}
                    className={`absolute w-[85%] max-w-[400px] h-[460px] rounded-2xl flex flex-col justify-between p-6 shadow-2xl ${
                      isFrontCard ? 'bg-[#2b1c5a] cursor-grab active:cursor-grabbing' : 'bg-white'
                    }`}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={[offset, direction]}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    drag={isFrontCard ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                  >
                    {isFrontCard ? <FrontCardContent event={event} onNext={() => changeCard(1)} /> : <BackCardContent />}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="hidden lg:flex lg:w-4/12 lg:-ml-32">
            <SideCard event={events[nextIndex]} />
          </div>
        </div>

        <div className="flex justify-center mt-12 md:mt-16">
          <button
  className="group inline-flex items-center justify-center gap-3 
  px-14 py-4 rounded-full 
  text-white font-semibold 
  bg-gradient-to-r from-[#1E003E] to-[#6A1B9A] 
  shadow-[0_0_10px_rgba(138,43,226,0.35)] 
  transition-all duration-300 
  hover:shadow-[0_0_18px_rgba(168,85,247,0.6)] 
  hover:scale-[1.03]"
>
  <span>View More</span>
  <MoveRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
</button>

        </div>
      </div>
    </section>
  )
}

const SideCard: React.FC<{ event: EventType }> = ({ event }) => (
  <div className="w-full h-[400px] border-4 border-dashed border-white rounded-2xl p-6 flex flex-col text-center items-center justify-center">
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
      <event.Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{event.description}</p>
  </div>
);

const FrontCardContent: React.FC<{ event: EventType; onNext: () => void }> = ({ event, onNext }) => (
  <>
    <div>
      <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center mb-4">
        <event.Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-3xl font-bold text-white">{event.title}</h3>
    </div>
    <div className="flex justify-between items-end">
      <p className="text-gray-300 text-sm w-3/4">{event.description}</p>
      <button
        onClick={onNext}
        className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
      >
        <ArrowRight size={24} />
      </button>
    </div>
  </>
);

const BackCardContent = () => <div />;

