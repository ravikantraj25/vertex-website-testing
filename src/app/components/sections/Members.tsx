'use client'

import { ArrowUpRight } from 'lucide-react'
import { Urbanist, Poppins } from 'next/font/google'

const urbanist = Urbanist({ subsets: ['latin'] })
const poppins = Poppins({ subsets: ['latin'], weight: '400' })

export default function Founders() {
  const founders = [
    {
      id: 1,
      name: 'Pranjal',
      role: 'Overall Lead',
      image: '/founders/pranjal.jpg',
    },
    {
      id: 2,
      name: 'Darshil',
      role: 'Technical Lead',
      image: '/founders/darshil.jpg',
    },
    {
      id: 3,
      name: 'Amogh',
      role: 'Media Lead',
      image: '/founders/amogh.jpg',
    },
    {
      id: 4,
      name: 'Aryan',
      role: 'Events Lead',
      image: '/founders/aryan.jpg',
    },
    {
      id: 5,
      name: 'Sneha',
      role: 'Design Lead',
      image: '/founders/sneha.jpg',
    },
  ]

  return (
    <section
      id="members"
      className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 overflow-hidden flex items-center"
      style={{ backgroundColor: '#04041e' }}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(123,49,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(123,49,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl w-full mx-auto">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 items-start mb-16">
          <div className={`animate-fade-in ${urbanist.className}`}>
            <h2 className="text-[64px] font-semibold text-white leading-[77px]">
              Meet the<br />Founders
            </h2>
          </div>
          <div className={`animate-fade-in-delay lg:pt-2 ${poppins.className}`}>
            <p className="text-white text-xl leading-[30px]">
              A team of passionate visionaries united by creativity, leadership, and a shared mission to shape a vibrant, inclusive community at Vertex.
            </p>
          </div>
        </div>

        {/* Horizontally Scrolling Container - Height increased with py-16 */}
        <div className="overflow-x-auto overflow-y-hidden py-16 scrollbar-custom">
          <div className="flex gap-8 min-w-max">
            {founders.map((founder, index) => (
              <div
                key={founder.id}
                className="group relative w-96 aspect-square rounded-3xl bg-slate-300 overflow-hidden flex-shrink-0 hover:scale-105 transition-transform duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-8xl font-bold opacity-20 select-none">
                  {founder.name[0]}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                  <div>
                    <h3 className="text-slate-900 text-2xl font-bold mb-1">
                      {founder.name}
                    </h3>
                    <p className="text-violet-600 text-sm font-medium">
                      {founder.role}
                    </p>
                  </div>
                  <button className="w-12 h-12 rounded-full bg-transparent border border-violet-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-45 group-hover:bg-violet-600/10">
                    <ArrowUpRight className="w-6 h-6 text-violet-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
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