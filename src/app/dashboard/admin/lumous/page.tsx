// app/admin/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import Image from "next/image";

// Make it dynamically rendered since it's an admin dashboard
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // 1. Prisma Query: Fetch events -> Confirmed Participations -> Participant, Team, Payment
  const eventsData = await prisma.event.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      participations: {
      
        include: {
          participant: true,
          team: true, // Needed to group by team
          registration: {
            include: {
              payment: true, // Needed to fetch the Cloudinary screenshot URL
            },
          },
        },
      },
    },
  });

  // 2. Data Transformation: Group participations into Teams and Solos
  const groupedEvents = eventsData.map((event) => {
    const solos: any[] = [];
    const teamsMap = new Map<string, any>();

    event.participations.forEach((p) => {
      // The Cloudinary URL is stored here
      const screenshotUrl = p.registration?.payment?.razorpayPaymentId || null;
      const amountPaid = p.registration?.payment?.amount ? p.registration.payment.amount / 100 : 0;

      if (p.teamId && p.team) {
        // Group under team
        if (!teamsMap.has(p.teamId)) {
          teamsMap.set(p.teamId, {
            id: p.teamId,
            teamName: p.team.name,
            screenshotUrl,
            amountPaid,
            members: [],
          });
        }
        teamsMap.get(p.teamId).members.push(p.participant);
      } else {
        // Solo participation
        solos.push({
          id: p.id, // Participation ID
          participant: p.participant,
          screenshotUrl,
          amountPaid,
        });
      }
    });

    return {
      id: event.id,
      name: event.name,
      slug: event.slug,
      solos,
      teams: Array.from(teamsMap.values()),
    };
  });

  // 3. Render the UI
  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <header className="mb-10 border-b pb-6">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-zinc-500 mt-2">Showing confirmed registrations grouped by event.</p>
        </header>

        {groupedEvents.map((event) => {
          const totalParticipants = event.solos.length + event.teams.reduce((acc, t) => acc + t.members.length, 0);
          
          if (totalParticipants === 0) return null; // Hide empty events

          return (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
              {/* Event Header */}
              <div className="bg-zinc-900 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">{event.name}</h2>
                <span className="bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                  {totalParticipants} Participants
                </span>
              </div>

              <div className="p-6 space-y-8">
                {/* --- TEAM REGISTRATIONS --- */}
                {event.teams.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b pb-2">Teams</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {event.teams.map((team) => (
                        <div key={team.id} className="border border-zinc-200 rounded-xl p-5 bg-zinc-50 flex gap-5">
                          {/* Payment Screenshot */}
                          <div className="w-24 h-32 flex-shrink-0 bg-zinc-200 rounded-lg overflow-hidden border border-zinc-300 relative group flex items-center justify-center">
                            {team.screenshotUrl && team.screenshotUrl.startsWith("http") ? (
                              <a href={team.screenshotUrl} target="_blank" rel="noopener noreferrer">
                                <img src={team.screenshotUrl} alt="Payment" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                              </a>
                            ) : (
                              <span className="text-xs text-zinc-500 text-center px-2">Free / No SS</span>
                            )}
                          </div>
                          
                          {/* Team Data */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="text-lg font-bold text-zinc-800">{team.teamName}</h4>
                              {team.amountPaid > 0 && (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">₹{team.amountPaid}</span>
                              )}
                            </div>
                            <ul className="space-y-2">
                              {team.members.map((member: any) => (
                                <li key={member.id} className="text-sm flex flex-col sm:flex-row sm:items-center justify-between bg-white px-3 py-2 rounded-lg border border-zinc-100">
                                  <span className="font-semibold text-zinc-700">{member.name}</span>
                                  <span className="font-mono text-xs text-zinc-500">{member.usn}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- SOLO REGISTRATIONS --- */}
                {event.solos.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest border-b pb-2">Solo Participants</h3>
                    <div className="overflow-x-auto rounded-xl border border-zinc-200">
                      <table className="w-full text-left text-sm text-zinc-600">
                        <thead className="bg-zinc-100 text-xs uppercase text-zinc-500 font-bold">
                          <tr>
                            <th className="px-4 py-3">Participant</th>
                            <th className="px-4 py-3">USN</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3 text-right">Screenshot</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 bg-white">
                          {event.solos.map((solo) => (
                            <tr key={solo.id} className="hover:bg-zinc-50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-zinc-800">{solo.participant.name}</td>
                              <td className="px-4 py-3 font-mono text-xs">{solo.participant.usn}</td>
                              <td className="px-4 py-3 text-xs">
                                <div>{solo.participant.phoneNo || "N/A"}</div>
                                <div className="text-zinc-400">{solo.participant.email}</div>
                              </td>
                              <td className="px-4 py-3 font-semibold text-emerald-600">
                                {solo.amountPaid > 0 ? `₹${solo.amountPaid}` : "Free"}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {solo.screenshotUrl && solo.screenshotUrl.startsWith("http") ? (
                                  <a href={solo.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline font-semibold text-xs inline-flex items-center gap-1">
                                    View Image ↗
                                  </a>
                                ) : (
                                  <span className="text-zinc-400 text-xs italic">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {groupedEvents.every(e => e.solos.length === 0 && e.teams.length === 0) && (
          <div className="text-center py-20 text-zinc-500">
            No confirmed registrations found.
          </div>
        )}

      </div>
    </div>
  );
}