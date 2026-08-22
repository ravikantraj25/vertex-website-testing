// app/dashboard/admin/lumous/page.tsx
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import ActionButtons from "./ActionButtons";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MemberDetail {
  id: string;
  name: string;
  usn: string;
  email: string;
  phoneNo: string | null;
  isLeader: boolean;
}

interface TeamEntry {
  id: string;
  teamName: string;
  leaderId: string;
  screenshotUrl: string | null;
  ssUploaded: boolean;
  amountPaid: number;
  registrationStatus: string;
  paymentStatus: string;
  registrationId: string;
  members: MemberDetail[];
}

interface SoloEntry {
  id: string;
  registrationId: string;
  screenshotUrl: string | null;
  ssUploaded: boolean;
  amountPaid: number;
  registrationStatus: string;
  paymentStatus: string;
  participant: {
    id: string;
    name: string;
    usn: string;
    email: string;
    phoneNo: string | null;
  };
}

interface GroupedEvent {
  id: string;
  name: string;
  slug: string;
  solos: SoloEntry[];
  teams: TeamEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const map: Record<string, string> = {
    CONFIRMED:       "bg-emerald-100 text-emerald-700 border-emerald-200",
    PAYMENT_PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    CANCELLED:       "bg-red-100 text-red-600 border-red-200",
    SUCCESS:         "bg-emerald-100 text-emerald-700 border-emerald-200",
    PENDING:         "bg-amber-100 text-amber-700 border-amber-200",
    FAILED:          "bg-red-100 text-red-600 border-red-200",
  };
  return map[status] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScreenshotCell({
  url,
  uploaded,
  amountPaid,
}: {
  url: string | null;
  uploaded: boolean;
  amountPaid: number;
}) {
  // Free event — no screenshot needed
  if (amountPaid === 0) {
    return (
      <div className="w-24 h-32 flex-shrink-0 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col items-center justify-center gap-1">
        <span className="text-lg">🆓</span>
        <span className="text-[10px] font-bold text-emerald-600 text-center px-1">Free Event</span>
      </div>
    );
  }

  // Paid but screenshot not uploaded
  if (!uploaded || !url) {
    return (
      <div className="w-24 h-32 flex-shrink-0 bg-red-50 rounded-xl border border-dashed border-red-300 flex flex-col items-center justify-center gap-1 px-2">
        <span className="text-lg">⚠️</span>
        <span className="text-[10px] font-bold text-red-500 text-center leading-tight">
          SS Not Uploaded
        </span>
      </div>
    );
  }

  // Screenshot uploaded
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-24 h-32 flex-shrink-0 rounded-xl border border-zinc-300 overflow-hidden block relative group"
      title="Click to view full screenshot"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Payment Screenshot"
        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
        <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">View ↗</span>
      </div>
    </a>
  );
}

function MemberRow({ member }: { member: MemberDetail }) {
  return (
    <li className="bg-white rounded-lg border border-zinc-100 px-3 py-2.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 sm:justify-between">
      <div className="flex items-center gap-2 min-w-0">
        {member.isLeader && (
          <span className="text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
            Leader
          </span>
        )}
        <span className="font-semibold text-zinc-800 text-sm truncate">{member.name}</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 sm:text-right">
        <span className="font-mono text-xs text-zinc-500">{member.usn}</span>
        {member.phoneNo && (
          <a
            href={`tel:${member.phoneNo}`}
            className="text-xs text-blue-500 hover:underline"
          >
            📞 {member.phoneNo}
          </a>
        )}
        <a
          href={`mailto:${member.email}`}
          className="text-xs text-zinc-400 hover:text-zinc-600 truncate max-w-[160px]"
        >
          {member.email}
        </a>
      </div>
    </li>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LumousAdminPage() {

  // ── Query ──────────────────────────────────────────────────────────────────
  // Fetch all participations (all statuses) so admin can see pending too.
  // We show registration status badge on each card so admin knows what's confirmed.
  const eventsData = await prisma.event.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      teams: {
        select: { id: true, leaderId: true },
      },
      participations: {
        include: {
          participant: true,
          team: true,
          registration: {
            include: {
              payment: true,
            },
          },
        },
      },
    },
  });

  // ── Transform ──────────────────────────────────────────────────────────────
  const groupedEvents: GroupedEvent[] = eventsData.map((event) => {
    const solos: SoloEntry[] = [];
    const teamsMap = new Map<string, TeamEntry>();

    // Build a quick lookup: teamId -> leaderId from the teams relation
    const leaderMap = new Map<string, string>();
    event.teams.forEach((t) => leaderMap.set(t.id, t.leaderId));

    event.participations.forEach((p) => {
      // Screenshot is stored in razorpayPaymentId (Cloudinary URL)
      const rawUrl = p.registration?.payment?.razorpayPaymentId ?? null;
      // Only treat as valid screenshot if it's actually a Cloudinary/http URL
      const screenshotUrl =
        rawUrl && rawUrl.startsWith("http") ? rawUrl : null;
      const ssUploaded = !!screenshotUrl;

      const amountPaid = p.registration?.payment?.amount
        ? p.registration.payment.amount / 100
        : 0;

      const registrationStatus = p.registration?.status ?? "UNKNOWN";
      const paymentStatus = p.registration?.payment?.status ?? "UNKNOWN";
      const registrationId = p.registration?.id ?? "";

      if (p.teamId && p.team) {
        if (!teamsMap.has(p.teamId)) {
          teamsMap.set(p.teamId, {
            id:                 p.teamId,
            teamName:           p.team.name,
            leaderId:           leaderMap.get(p.teamId) ?? "",
            screenshotUrl,
            ssUploaded,
            amountPaid,
            registrationStatus,
            paymentStatus,
            registrationId,
            members:            [],
          });
        }

        const team = teamsMap.get(p.teamId)!;

        // Update screenshot/status from the leader's registration
        // (all members share same registration, but upsert ensures freshness)
        if (!team.ssUploaded && ssUploaded) {
          team.screenshotUrl = screenshotUrl;
          team.ssUploaded    = true;
        }

        team.members.push({
          id:       p.participant.id,
          name:     p.participant.name,
          usn:      p.participant.usn,
          email:    p.participant.email,
          phoneNo:  p.participant.phoneNo ?? null,
          isLeader: p.participant.id === team.leaderId,
        });
      } else {
        solos.push({
          id:                 p.id,
          registrationId,
          screenshotUrl,
          ssUploaded,
          amountPaid,
          registrationStatus,
          paymentStatus,
          participant: {
            id:      p.participant.id,
            name:    p.participant.name,
            usn:     p.participant.usn,
            email:   p.participant.email,
            phoneNo: p.participant.phoneNo ?? null,
          },
        });
      }
    });

    // Sort members so leader always appears first
    teamsMap.forEach((team) => {
      team.members.sort((a, b) =>
        a.isLeader === b.isLeader ? 0 : a.isLeader ? -1 : 1
      );
    });

    return {
      id:    event.id,
      name:  event.name,
      slug:  event.slug,
      solos,
      teams: Array.from(teamsMap.values()),
    };
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalEvents        = groupedEvents.filter(e => e.solos.length > 0 || e.teams.length > 0).length;
  const totalParticipants  = groupedEvents.reduce(
    (acc, e) =>
      acc +
      e.solos.length +
      e.teams.reduce((a, t) => a + t.members.length, 0),
    0
  );
  const totalPendingSS     = groupedEvents.reduce(
    (acc, e) =>
      acc +
      e.solos.filter((s) => s.amountPaid > 0 && !s.ssUploaded).length +
      e.teams.filter((t) => t.amountPaid > 0 && !t.ssUploaded).length,
    0
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ── Header ── */}
        <header className="border-b border-zinc-200 pb-6">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            Lumous 2026 — Registrations
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            All registrations across all events · All statuses shown
          </p>

          {/* Summary pills */}
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="text-xs font-bold bg-zinc-900 text-white px-3 py-1.5 rounded-full">
              {totalEvents} Active Events
            </span>
            <span className="text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full">
              {totalParticipants} Total Participants
            </span>
            {totalPendingSS > 0 && (
              <span className="text-xs font-bold bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-full animate-pulse">
                ⚠️ {totalPendingSS} Pending Screenshot{totalPendingSS !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </header>

        {/* ── Events ── */}
        {groupedEvents.map((event) => {
          const totalCount =
            event.solos.length +
            event.teams.reduce((a, t) => a + t.members.length, 0);

          if (totalCount === 0) return null;

          return (
            <div
              key={event.id}
              className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden"
            >
              {/* Event Header */}
              <div className="bg-zinc-900 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-widest">
                    {event.name}
                  </h2>
                  <p className="text-zinc-500 text-xs mt-0.5 font-mono">{event.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-black text-xs font-black px-3 py-1 rounded-full">
                    {totalCount} Participant{totalCount !== 1 ? "s" : ""}
                  </span>
                  {event.teams.length > 0 && (
                    <span className="bg-zinc-700 text-zinc-200 text-xs font-bold px-3 py-1 rounded-full">
                      {event.teams.length} Team{event.teams.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-10">

                {/* ── TEAM REGISTRATIONS ── */}
                {event.teams.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">
                      Team Registrations ({event.teams.length})
                    </h3>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                      {event.teams.map((team) => (
                        <div
                          key={team.id}
                          className="border border-zinc-200 rounded-xl p-4 bg-zinc-50 flex gap-4"
                        >
                          {/* Screenshot */}
                          <ScreenshotCell
                            url={team.screenshotUrl}
                            uploaded={team.ssUploaded}
                            amountPaid={team.amountPaid}
                          />

                          {/* Team Info */}
                          <div className="flex-1 min-w-0 flex flex-col gap-3">
                            {/* Team name + badges */}
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <h4 className="text-base font-black text-zinc-800 leading-tight">
                                {team.teamName}
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(team.registrationStatus)}`}
                                >
                                  {team.registrationStatus}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(team.paymentStatus)}`}
                                >
                                  {team.amountPaid > 0
                                    ? `₹${team.amountPaid} · ${team.paymentStatus}`
                                    : "FREE"}
                                </span>
                                {team.paymentStatus === "PENDING" && team.amountPaid > 0 && team.ssUploaded && (
                                  <ActionButtons registrationId={team.registrationId} />
                                )}
                              </div>
                            </div>

                            {/* Screenshot warning inline */}
                            {team.amountPaid > 0 && !team.ssUploaded && (
                              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                                <span className="text-red-500 text-xs">⚠️</span>
                                <span className="text-xs font-semibold text-red-600">
                                  Payment screenshot not uploaded
                                </span>
                              </div>
                            )}

                            {/* Members list */}
                            <ul className="space-y-1.5">
                              {team.members.map((member) => (
                                <MemberRow key={member.id} member={member} />
                              ))}
                            </ul>

                            {/* Registration ID */}
                            <p className="text-[10px] text-zinc-400 font-mono mt-auto">
                              Reg ID: {team.registrationId.slice(-10).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SOLO REGISTRATIONS ── */}
                {event.solos.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">
                      Solo Participants ({event.solos.length})
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-zinc-200">
                      <table className="w-full text-left text-sm text-zinc-600 min-w-[700px]">
                        <thead className="bg-zinc-100 text-[11px] uppercase text-zinc-500 font-black tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Participant</th>
                            <th className="px-4 py-3">USN</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Reg Status</th>
                            <th className="px-4 py-3">Pay Status</th>
                            <th className="px-4 py-3 text-center">Screenshot</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 bg-white">
                          {event.solos.map((solo) => (
                            <tr key={solo.id} className="hover:bg-zinc-50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-zinc-800 whitespace-nowrap">
                                {solo.participant.name}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-zinc-500 whitespace-nowrap">
                                {solo.participant.usn}
                              </td>
                              <td className="px-4 py-3 text-xs">
                                {solo.participant.phoneNo ? (
                                  <a
                                    href={`tel:${solo.participant.phoneNo}`}
                                    className="text-blue-500 hover:underline block"
                                  >
                                    📞 {solo.participant.phoneNo}
                                  </a>
                                ) : (
                                  <span className="text-zinc-400">No phone</span>
                                )}
                                <a
                                  href={`mailto:${solo.participant.email}`}
                                  className="text-zinc-400 hover:text-zinc-600 block truncate max-w-[160px]"
                                >
                                  {solo.participant.email}
                                </a>
                              </td>
                              <td className="px-4 py-3 font-bold whitespace-nowrap">
                                {solo.amountPaid > 0 ? (
                                  <span className="text-emerald-600">₹{solo.amountPaid}</span>
                                ) : (
                                  <span className="text-zinc-400">Free</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(solo.registrationStatus)}`}
                                >
                                  {solo.registrationStatus}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(solo.paymentStatus)}`}
                                >
                                  {solo.paymentStatus}
                                </span>
                                {solo.paymentStatus === "PENDING" && solo.amountPaid > 0 && solo.ssUploaded && (
                                  <div className="mt-2"><ActionButtons registrationId={solo.registrationId} /></div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {solo.amountPaid === 0 ? (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    Free
                                  </span>
                                ) : solo.ssUploaded && solo.screenshotUrl ? (
                                  <a
                                    href={solo.screenshotUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-500 font-bold text-xs underline underline-offset-2"
                                  >
                                    View SS ↗
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                    ⚠️ Not Uploaded
                                  </span>
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

        {/* ── Empty state ── */}
        {groupedEvents.every((e) => e.solos.length === 0 && e.teams.length === 0) && (
          <div className="text-center py-24 text-zinc-400">
            <div className="text-5xl mb-4">📭</div>
            <p className="font-semibold text-lg">No registrations found</p>
            <p className="text-sm mt-1">Registrations will appear here once submitted.</p>
          </div>
        )}

      </div>
    </div>
  );
}