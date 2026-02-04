import React from 'react';
import Link from 'next/link';
// DATA: The information for all the clubs
const clubs = [
  { 
    id: 1, 
    name: 'Technical Team', 
    slug: 'technical', 
    description: 'The architects of our digital world. We lead the charge in web development, app creation, and exploring the latest in tech innovation.',
    about: 'We are a collective of creators, innovators, and problem-solvers passionate about using technology to build amazing things. Our mission is to foster a vibrant tech culture within the community by providing resources, mentorship, and hands-on project experience.',
    wings: [
        { name: 'Software Wing', description: 'Focuses on the art of code. From full-stack web applications to mobile apps and machine learning, this wing covers all aspects of software development and design.', color: 'text-violet-400' },
        { name: 'Hardware Wing', description: 'Dives into the tangible world of electronics. Members explore IoT, robotics, embedded systems, and circuit design, bringing digital concepts to physical life.', color: 'text-pink-400' }
    ],
    offerings: [
        { title: 'Hands-on Workshops', description: 'Regular sessions on cutting-edge technologies and foundational skills to get you building from day one.' },
        { title: 'Real-world Projects', description: 'Opportunities to collaborate on impactful projects, build your portfolio, and solve real challenges.' },
        { title: 'DSA Classes', description: 'Consistent, structured classes to strengthen your problem-solving abilities and prepare for technical interviews.' }
    ],
    responsibilities: [],
    members: []
  },
  { 
    id: 2, 
    name: 'Cultural Team', 
    slug: 'cultural', 
    description: 'The vibrant soul of our community, celebrating creativity, diversity, and artistic expression through a spectacular array of events and activities.', 
    about: 'The Cultural Team is dedicated to enriching the community spirit by creating a platform for artistic talents to flourish. We believe that culture is the heartbeat of our community, and we strive to organize events that are inclusive, inspiring, and memorable for everyone.',
    activities: [
        { name: 'Performing Arts', description: 'From electrifying dance-offs and soulful singing competitions to theatrical performances, we bring the stage to life.', icon: '🎭' },
        { name: 'Visual Arts', description: 'We celebrate visual creativity through rangoli competitions, painting exhibitions, digital art showcases, and photography contests.', icon: '🎨' },
        { name: 'Literary Arts', description: 'Engaging the community with the power of words through poetry slams, debates, storytelling sessions, and creative writing workshops.', icon: '✍️' }
    ],
    goals: [
        'To discover and showcase the diverse talents within our community.',
        'To organize large-scale cultural festivals that become annual traditions.',
        'To foster a welcoming environment for all forms of artistic expression.'
    ],
    responsibilities: [], 
    members: [] 
  },
  { 
    id: 3, 
    name: 'Organising Team', 
    slug: 'organising', 
    description: 'The backbone of every event, the organising team ensures everything runs smoothly from concept to completion.', 
    about: 'The Organising Team is the master planner and executor behind every successful community event. We are the detail-oriented strategists who handle everything from initial brainstorming to on-the-ground management, ensuring a seamless and engaging experience for all attendees.',
    domains: [
      { name: 'Event Strategy', description: 'Conceptualizing and planning events that align with the community’s goals and interests.', icon: '🎯' },
      { name: 'Logistics Management', description: 'Coordinating venues, schedules, equipment, and all the moving parts to ensure a flawless execution.', icon: '🚚' },
      { name: 'Volunteer Coordination', description: 'Recruiting, training, and managing our amazing team of volunteers who help make it all happen.', icon: '🤝' }
    ],
    responsibilities: [
      'Developing comprehensive event plans and timelines.',
      'Managing budgets and securing necessary resources.',
      'Liaising with other teams to ensure cohesive event delivery.',
      'Conducting post-event reviews to gather feedback for future improvements.',
      'Managing registrations and attendee communications.'
    ], 
    members: [] 
  },
  { 
    id: 4, 
    name: 'Media Team', 
    slug: 'media', 
    description: 'Capturing moments and telling stories through photography, videography, and design.', 
    about: 'The Media Team is the creative eye of the community. We are the storytellers who capture the moments that matter, crafting compelling visual narratives that define our identity and preserve our memories. From dynamic event coverage to polished promotional content, we bring the community\'s vision to life.',
    areas: [
      { name: 'Photography', description: 'Freezing moments in time, from candid shots to professional event coverage, telling a story in every frame.', icon: '📸' },
      { name: 'Videography', description: 'Creating engaging video content, including event highlights, aftermovies, and promotional clips that capture the energy of our community.', icon: '🎬' },
      { name: 'Graphic Design', description: 'Designing stunning visuals for posters, social media, and all promotional materials, ensuring a consistent and beautiful brand identity.', icon: '🎨' }
    ],
    responsibilities: [
      'Providing complete photo and video coverage for all major community events.',
      'Editing and producing high-quality content for our digital platforms.',
      'Designing all visual assets required by other teams.',
      'Managing the community’s official photo galleries and video channels.',
      'Innovating with new media formats to keep our content fresh and engaging.'
    ], 
    members: [] 
  },
  { 
    id: 5, 
    name: 'Sports Team', 
    slug: 'sports', 
    description: 'Promoting fitness, teamwork, and competitive spirit through various sports and games.', 
    about: 'The Sports Team champions the spirit of athleticism, teamwork, and healthy competition within the community. We organize a wide range of sporting events, from casual games to competitive tournaments, ensuring there’s something for every skill level and interest.',
    events: [
      { name: 'Indoor Games', description: 'Strategy and skill come alive with tournaments in chess, carrom, table tennis, and more.', icon: '♟️' },
      { name: 'Outdoor Sports', description: 'Experience the thrill of competition on the field with events for cricket, football, volleyball, and basketball.', icon: '🏏' },
      { name: 'Fitness Challenges', description: 'Promoting a healthy lifestyle with community-wide fitness challenges, marathons, and workout sessions.', icon: '💪' }
    ],
    responsibilities: [
      'Planning and executing a diverse calendar of sports tournaments and events.',
      'Managing team registrations, fixtures, and league standings.',
      'Ensuring all sports equipment and facilities are well-maintained and safe.',
      'Promoting sportsmanship and fair play across all activities.',
      'Collaborating with other teams to boost participation and event success.'
    ], 
    members: [] 
  },
  { 
    id: 6, 
    name: 'Content Team', 
    slug: 'content', 
    description: 'The wordsmiths of our community, crafting compelling narratives and engaging content.', 
    about: 'The Content Team is the voice of our community. We are the storytellers, editors, and strategists responsible for crafting the narratives that connect us all. We manage everything from official announcements to engaging social media campaigns, ensuring our message is always clear, creative, and compelling.',
    focusAreas: [
      { name: 'Written Content', description: 'Creating everything from insightful blog posts and articles to official newsletters and website copy.', icon: '📝' },
      { name: 'Social Media', description: 'Curating our presence across all social platforms, creating engaging posts, stories, and campaigns.', icon: '📱' },
      { name: 'Script & Speech', description: 'Crafting powerful scripts for videos, podcasts, and speeches for community leaders and events.', icon: '🎤' }
    ],
    responsibilities: [
      'Developing and executing the overall content strategy for the community.',
      'Writing, editing, and proofreading all official communications.',
      'Managing the content calendar for blogs, newsletters, and social media.',
      'Collaborating with the Media Team to align visual and written content.',
      'Maintaining a consistent brand voice and tone across all platforms.'
    ], 
    members: [] 
  },
  { 
    id: 7, 
    name: 'PR Team', 
    slug: 'pr', 
    description: 'Building connections and managing the public image of our vibrant community.', 
    about: 'The PR Team acts as the bridge between our community and the wider world. We are the ambassadors and strategists who manage our public image, build meaningful relationships, and ensure our story is heard. We handle everything from media outreach to strategic partnerships.',
    keyRoles: [
      { name: 'Media Relations', description: 'Building connections with journalists, bloggers, and influencers to secure positive media coverage.', icon: '📰' },
      { name: 'Community Outreach', description: 'Establishing partnerships with other organizations, institutions, and communities to foster collaboration.', icon: '🌍' },
      { name: 'Reputation Management', description: 'Monitoring our public perception and developing strategies to enhance our brand and reputation.', icon: '🛡️' }
    ],
    responsibilities: [
      'Managing the public image and brand of the community.',
      'Building and maintaining relationships with external partners and media.',
      'Crafting and distributing press releases and official statements.',
      'Acting as the primary point of contact for external inquiries.',
      'Developing strategies to enhance community visibility and reputation.'
    ], 
    members: [] 
  },
];

// This is a TypeScript type for the page's props
interface ClubPageProps {
  params: {
    slug: string;
  };
}

// COMPONENT: This is the actual React component that Next.js will render.
export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || 'pr';

  const club = clubs.find((c) => c.slug === slug);

  if (!club) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 text-white" style={{ backgroundColor: '#04041e' }}>
        <h1 className="text-4xl font-bold">Club not found</h1>
        <a href="/" className="mt-4 text-violet-400 hover:underline">
          Go back to Home
        </a>
      </main>
    );
  }

  return (
    <main 
      className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 overflow-y-auto" 
      style={{ backgroundColor: '#04041e' }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(123,49,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(123,49,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in">
            {club.name}
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto animate-fade-in-delay">
            {club.description}
          </p>
        </div>

        {/* Conditional Rendering for Technical Team */}
        {club.slug === 'technical' ? (
          <div className="space-y-12">
            <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up">
              <h2 className="text-3xl font-bold text-white mb-4">About the Team</h2>
              <p className="text-gray-300 leading-relaxed">{club.about}</p>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <h2 className="text-3xl font-bold text-white mb-6">Our Core Wings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {club.wings?.map(wing => (
                  <div key={wing.name} className="bg-slate-800/50 p-6 rounded-lg">
                    <h3 className={`font-bold ${wing.color} text-2xl mb-2`}>{wing.name}</h3>
                    <p className="text-gray-300">{wing.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <h2 className="text-3xl font-bold text-white mb-6">What We Offer</h2>
              <ul className="space-y-4">
                {club.offerings?.map(offering => (
                  <li key={offering.title} className="flex items-start">
                    <span className="text-violet-400 mr-4 mt-1">✓</span>
                    <span className="text-gray-300"><b>{offering.title}:</b> {offering.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : /* Conditional Rendering for Cultural Team */
        club.slug === 'cultural' ? (
            <div className="space-y-12">
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-white mb-4">About the Team</h2>
                    <p className="text-gray-300 leading-relaxed">{club.about}</p>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <h2 className="text-3xl font-bold text-white mb-6">Our Core Activities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {club.activities?.map(activity => (
                            <div key={activity.name} className="bg-slate-800/50 p-6 rounded-lg text-center">
                                <div className="text-4xl mb-4">{activity.icon}</div>
                                <h3 className="font-bold text-pink-400 text-xl mb-2">{activity.name}</h3>
                                <p className="text-gray-300 text-sm">{activity.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <h2 className="text-3xl font-bold text-white mb-6">Our Goals</h2>
                    <ul className="space-y-4">
                        {club.goals?.map((goal, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-pink-400 mr-4 mt-1">✓</span>
                                <span className="text-gray-300">{goal}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ) : /* Conditional Rendering for Organising Team */
        club.slug === 'organising' ? (
            <div className="space-y-12">
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-white mb-4">About the Team</h2>
                    <p className="text-gray-300 leading-relaxed">{club.about}</p>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <h2 className="text-3xl font-bold text-white mb-6">Our Key Domains</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {club.domains?.map(domain => (
                            <div key={domain.name} className="bg-slate-800/50 p-6 rounded-lg text-center">
                                <div className="text-4xl mb-4">{domain.icon}</div>
                                <h3 className="font-bold text-teal-400 text-xl mb-2">{domain.name}</h3>
                                <p className="text-gray-300 text-sm">{domain.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <h2 className="text-3xl font-bold text-white mb-6">Core Responsibilities</h2>
                    <ul className="space-y-4">
                        {club.responsibilities?.map((task, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-teal-400 mr-4 mt-1">✓</span>
                                <span className="text-gray-300">{task}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ) : /* Conditional Rendering for Media Team */
        club.slug === 'media' ? (
            <div className="space-y-12">
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-white mb-4">About the Team</h2>
                    <p className="text-gray-300 leading-relaxed">{club.about}</p>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <h2 className="text-3xl font-bold text-white mb-6">Our Creative Areas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {club.areas?.map(area => (
                            <div key={area.name} className="bg-slate-800/50 p-6 rounded-lg text-center">
                                <div className="text-4xl mb-4">{area.icon}</div>
                                <h3 className="font-bold text-amber-400 text-xl mb-2">{area.name}</h3>
                                <p className="text-gray-300 text-sm">{area.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <h2 className="text-3xl font-bold text-white mb-6">Core Responsibilities</h2>
                    <ul className="space-y-4">
                        {club.responsibilities?.map((task, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-amber-400 mr-4 mt-1">✓</span>
                                <span className="text-gray-300">{task}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ) : /* Conditional Rendering for Sports Team. */
        club.slug === 'sports' ? (
            <div className="space-y-12">
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-white mb-4">About the Team</h2>
                    <p className="text-gray-300 leading-relaxed">{club.about}</p>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <h2 className="text-3xl font-bold text-white mb-6">Our Sporting Arenas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {club.events?.map(event => (
                            <div key={event.name} className="bg-slate-800/50 p-6 rounded-lg text-center">
                                <div className="text-4xl mb-4">{event.icon}</div>
                                <h3 className="font-bold text-green-400 text-xl mb-2">{event.name}</h3>
                                <p className="text-gray-300 text-sm">{event.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <h2 className="text-3xl font-bold text-white mb-6">Core Responsibilities</h2>
                    <ul className="space-y-4">
                        {club.responsibilities?.map((task, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-green-400 mr-4 mt-1">✓</span>
                                <span className="text-gray-300">{task}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ) : /* Conditional Rendering for Content Team */
        club.slug === 'content' ? (
            <div className="space-y-12">
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-white mb-4">About the Team</h2>
                    <p className="text-gray-300 leading-relaxed">{club.about}</p>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <h2 className="text-3xl font-bold text-white mb-6">Our Focus Areas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {club.focusAreas?.map(area => (
                            <div key={area.name} className="bg-slate-800/50 p-6 rounded-lg text-center">
                                <div className="text-4xl mb-4">{area.icon}</div>
                                <h3 className="font-bold text-blue-400 text-xl mb-2">{area.name}</h3>
                                <p className="text-gray-300 text-sm">{area.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <h2 className="text-3xl font-bold text-white mb-6">Core Responsibilities</h2>
                    <ul className="space-y-4">
                        {club.responsibilities?.map((task, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-400 mr-4 mt-1">✓</span>
                                <span className="text-gray-300">{task}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ) : /* Conditional Rendering for PR Team */
        club.slug === 'pr' ? (
            <div className="space-y-12">
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up">
                    <h2 className="text-3xl font-bold text-white mb-4">About the Team</h2>
                    <p className="text-gray-300 leading-relaxed">{club.about}</p>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    <h2 className="text-3xl font-bold text-white mb-6">Our Key Roles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {club.keyRoles?.map(role => (
                            <div key={role.name} className="bg-slate-800/50 p-6 rounded-lg text-center">
                                <div className="text-4xl mb-4">{role.icon}</div>
                                <h3 className="font-bold text-red-400 text-xl mb-2">{role.name}</h3>
                                <p className="text-gray-300 text-sm">{role.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    <h2 className="text-3xl font-bold text-white mb-6">Core Responsibilities</h2>
                    <ul className="space-y-4">
                        {club.responsibilities?.map((task, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-red-400 mr-4 mt-1">✓</span>
                                <span className="text-gray-300">{task}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ) : (
          /* Default layout for all other clubs */
          <div className="space-y-12">
             <div className="bg-white/5 p-8 rounded-2xl animate-fade-in-up">
               <h2 className="text-3xl font-bold text-white mb-6">Our Responsibilities</h2>
               {club.responsibilities.length > 0 ? (
                  <ul className="space-y-4">
                    {club.responsibilities.map((task, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-violet-400 mr-4 mt-1">✓</span>
                        <span className="text-gray-300">{task}</span>
                      </li>
                    ))}
                  </ul>
               ) : (
                <p className="text-gray-400">More information coming soon!</p>
               )}
             </div>
          </div>
        )}

        <div className="text-center mt-16">
          <a href="/#clubs" className="inline-block text-violet-400 hover:underline animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            &larr; Back to all clubs
          </a>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-fade-in-delay { animation: fade-in 1s ease-out 0.3s forwards; opacity: 0; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; opacity: 0; }
      `}</style>
    </main>
  );
}

