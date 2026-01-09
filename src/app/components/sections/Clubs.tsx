'use client'

import { 
  ArrowUpRight, 
  Code, 
  Paintbrush, 
  Megaphone, 
  Camera, 
  HeartPulse, 
  FileText, 
  Share2 
} from 'lucide-react'

export default function Clubs() {
  
  const clubs = [
    {
      id: 1,
      name: 'Technical Team',
      slug: 'technical',
      description: 'Dive into code, build projects, and explore the latest in web and software development.',
      icon: <Code className="w-10 h-10 text-indigo-300" />,
      bgColor: 'bg-indigo-900/20',
      borderColor: 'border-indigo-500/30',
      buttonColor: 'border-indigo-400 text-indigo-400 group-hover:bg-indigo-600/20'
    },
    {
      id: 2,
      name: 'Cultural Team',
      slug: 'cultural',
      description: 'Express your creativity through music, dance, art, and celebrate diverse cultural events.',
      icon: <Paintbrush className="w-10 h-10 text-rose-300" />,
      bgColor: 'bg-rose-900/20',
      borderColor: 'border-rose-500/30',
      buttonColor: 'border-rose-400 text-rose-400 group-hover:bg-rose-600/20'
    },
    {
      id: 3,
      name: 'Organising Team',
      slug: 'organising',
      description: 'Be the backbone of our community by planning, managing, and executing amazing events.',
      icon: <Megaphone className="w-10 h-10 text-amber-300" />,
      bgColor: 'bg-amber-900/20',
      borderColor: 'border-amber-500/30',
      buttonColor: 'border-amber-400 text-amber-400 group-hover:bg-amber-600/20'
    },
    {
      id: 4,
      name: 'Media Team',
      slug: 'media',
      description: 'Capture moments, create stunning visuals, and tell our story through photo and video.',
      icon: <Camera className="w-10 h-10 text-cyan-300" />,
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-500/30',
      buttonColor: 'border-cyan-400 text-cyan-400 group-hover:bg-cyan-600/20'
    },
    {
      id: 5,
      name: 'Sports Team',
      slug: 'sports',
      description: 'Promote fitness, teamwork, and friendly competition through various sports and activities.',
      icon: <HeartPulse className="w-10 h-10 text-emerald-300" />,
      bgColor: 'bg-emerald-900/20',
      borderColor: 'border-emerald-500/30',
      buttonColor: 'border-emerald-400 text-emerald-400 group-hover:bg-emerald-600/20'
    },
    {
      id: 6,
      name: 'Content Team',
      slug: 'content',
      description: 'Craft compelling narratives, write engaging articles, and shape our voice across all platforms.',
      icon: <FileText className="w-10 h-10 text-slate-300" />,
      bgColor: 'bg-slate-900/20',
      borderColor: 'border-slate-500/30',
      buttonColor: 'border-slate-400 text-slate-400 group-hover:bg-slate-600/20'
    },
    {
      id: 7,
      name: 'PR Team',
      slug: 'pr',
      description: 'Build relationships, manage our public image, and connect with the wider community.',
      icon: <Share2 className="w-10 h-10 text-pink-300" />,
      bgColor: 'bg-pink-900/20',
      borderColor: 'border-pink-500/30',
      buttonColor: 'border-pink-400 text-pink-400 group-hover:bg-pink-600/20'
    },
  ]

  return (
    <section
      id="clubs"
      className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 overflow-hidden flex items-center font-sans"
      style={{ backgroundColor: '#04041e' }}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(123,49,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(123,49,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl w-full mx-auto">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 items-start mb-16">
          <div className="animate-fade-in">
            
            <h2 className="text-[64px] font-bold text-white leading-[77px] font-sans">
              Explore Our<br />Clubs
            </h2>
          </div>
          <div className="animate-fade-in-delay lg:pt-2">
            <p className="text-white text-xl leading-[30px]">
              From tech wizards to creative storytellers, discover the diverse teams that form the vibrant core of our community. Each club is a gateway to new skills, friendships, and experiences.
            </p>
          </div>
        </div>

        {/* Horizontally Scrolling Container */}
        <div className="overflow-x-auto overflow-y-hidden py-16 scrollbar-custom">
          <div className="flex gap-8 min-w-max">
            {clubs.map((club, index) => (
              
              <div
                key={club.id}
                className={`group relative w-96 h-80 rounded-3xl border ${club.bgColor} ${club.borderColor} p-8 flex flex-col justify-between flex-shrink-0 hover:border-violet-400/50 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div>
                  <div className="mb-6">
                    {club.icon}
                  </div>
                  
                  <h3 className="text-white text-2xl font-bold mb-3 font-sans">
                    {club.name}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {club.description}
                  </p>
                </div>

                <div className="flex items-end justify-end">
                  <a href={`/clubs/${club.slug}`}>
                    <button className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-45 ${club.buttonColor}`}>
                      <ArrowUpRight className="w-6 h-6" />
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {}
      <style>{`
        /* Default fonts (replace with Urbanist and Poppins in your project) */
        .font-serif {
            font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
        }
        .font-sans {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        }
      
        /* Animations */
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s forwards;
          opacity: 0;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        /* Custom Scrollbar */
        .scrollbar-custom::-webkit-scrollbar {
          height: 8px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(71, 85, 105, 0.1);
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #a855f7, #ec4899);
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, #9333ea, #db2777);
        }
        /* Firefox */
        .scrollbar-custom {
          scrollbar-width: thin;
          scrollbar-color: #a855f7 rgba(71, 85, 105, 0.1);
        }
      `}</style>
    </section>
  )
}