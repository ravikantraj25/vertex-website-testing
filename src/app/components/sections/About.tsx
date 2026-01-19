import React from 'react';


const About: React.FC = () => {
  return (
    
    <section id="about" className="bg-[#04041E] font-sans">
      <AboutVertex />
      <WhyJoinUs />
    </section>
  );
}
export default About;



const AboutVertex: React.FC = () => {
  return (
    <div className="text-white py-14 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="max-w-7xl mx-auto flex flex-row items-stretch gap-[47px] w-full">
        
        <div className="relative w-[12px] flex-shrink-0 hidden md:block">
          <div className="absolute w-[5px] left-1/2 top-1 bottom-0 -translate-x-1/2 bg-[#D9D9D9] bg-opacity-45 rounded-full"></div>
          <div className="absolute w-[12px] h-[8px] left-1/2 top-1 -translate-x-1/2 bg-gradient-to-r from-[#A2AB9D] to-[#E9EFD9] rounded-full"></div>
        </div>

        {/* Text Content */}
        <div className="flex-1 flex flex-col items-start gap-[52px]">
          <div className="flex flex-col items-start gap-[25px]">
            <p className="font-semibold text-[28px] leading-tight tracking-[-0.02em] text-[#D4F39A]">
              ABOUT VERTEX
            </p>
            <h2 className="font-bold text-[51px] leading-[61px] tracking-[-0.01em] text-white">
              Empowering students through creativity, collaboration, and community.
            </h2>
          </div>
          <div className="font-normal text-[28px] leading-[140%] tracking-[-0.01em] text-[#D9D9D9] space-y-6">
            <p>
              In a world where learning goes beyond classrooms, Vertex stands as a dynamic student led club from the ETE Department at DSCE. It is a space where innovation meets expression bringing students together through technical excellence, cultural vibrance, and social impact.
            </p>
            <p>
              Driven by curiosity and passion, Vertex encourages students to step up, lead, create, and connect shaping a well-rounded college experience rooted in teamwork, exploration, and growth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};




interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  style?: React.CSSProperties;
  hasFadingBorder?: boolean;
}


const InfoCard: React.FC<InfoCardProps> = ({ icon, title, description, className, style = {}, hasFadingBorder = false }) => (
  <div className={`relative rounded-[30px] flex flex-col justify-between h-full overflow-hidden ${className}`} style={style}>
    {hasFadingBorder && (
      <div 
        className="absolute inset-0 rounded-[30px] pointer-events-none"
        style={{
          border: '2px solid transparent',
          background: 'linear-gradient(to right, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1)) border-box',
          WebkitMask: 
            'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'exclude',
          maskComposite: 'exclude',
        }}
      />
    )}
    <div className="relative flex flex-col h-full">
        <div className="text-7xl mb-8">
          {icon}
        </div>
        <div className="flex justify-between items-center gap-4 mt-auto">
            <div className="flex-1">
                 <h3 className="font-semibold text-[34px] leading-tight mb-4 text-white">{title}</h3>
                 <p className="text-white/80 text-sm leading-relaxed font-normal">{description}</p>
            </div>
            <button className="w-[54px] h-[54px] bg-white rounded-full hover:opacity-90 transition-opacity flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
        </div>
    </div>
  </div>
);

// The main "Why Join Us" component
const WhyJoinUs: React.FC = () => {
  const cardData = [
    {
      icon: '⚙️',
      title: 'Tech in Action',
      description: 'Hands-on workshops, hackathons, and real-world engineering experiences that bring ideas to life.',
      className: 'lg:col-span-3 p-[31px_40px]',
      style: {
        background: 'linear-gradient(139.92deg, #04051B 12.44%, #2A2594 125.92%)'
      }
    },
    {
      icon: '🎨',
      title: 'Culture & Creativity',
      description: 'Open mics, fests, and artistic events where students express, explore, and connect beyond the classroom.',
      className: 'lg:col-span-3 p-[31px_45px]',
    },
    {
      icon: '⚡️',
      title: 'Sports & Spirit',
      description: 'From field games to fitness challenges — it\'s strength, teamwork, and unforgettable memories.',
      className: 'lg:col-span-2 p-8',
    },
    {
      icon: '💡',
      title: 'Skill Building',
      description: 'Opportunities to lead, plan, speak, and solve — shaping both your resume and your confidence.',
      className: 'lg:col-span-2 p-8',
    },
    {
      icon: '🤝',
      title: 'Networking',
      description: 'Meet peers, mentors, and collaborators who challenge and support your journey.',
      className: 'lg:col-span-2 p-8',
    },
  ];

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-[77px]">
        <h2 className="text-5xl font-semibold text-[#D4F39A] text-center">
          Why join us?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 w-full">
          {cardData.map((card, index) => (
            <InfoCard
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
              className={card.className}
              style={card.style}
              hasFadingBorder={true} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

