import { Timeline } from "@/app/components/ui/timeline.tsx"

function Journey() {
  const data = [
    {
      title: "2025",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-white/70 md:text-sm">
            Vertex evolves into a multi-domain student club, uniting technology,
            culture, media, and sports under one growing community.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="/images/journey/inaug3.jpeg"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover md:h-44 lg:h-60"
            />
            <img
              src="/images/journey/inaug1.jpeg"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover md:h-44 lg:h-60"
            />
            <img
              src="/images/journey/inaug2.jpeg"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover md:h-44 lg:h-60"
            />
            <img
              src="/images/journey/inaug4.jpeg"
              alt="Vertex Sports Meet"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Early 2024",
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-white/70 md:text-sm">
            Vertex begins as a departmental initiative within the Electronics
            and Telecommunication Engineering department.

            The early phase focused on learning, collaboration, and forming a
            core team driven by curiosity and innovation.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="/images/journey/early.jpeg"
              alt="Early Workshops"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover md:h-44 lg:h-60"
            />
            
          </div>
        </div>
      ),
    },
    {
      title: "Milestones",
      content: (
        <div>
          <p className="mb-4 text-xs font-normal text-white/70 md:text-sm">
            Key moments that shaped Vertex into an active student-led community.
          </p>

          <div className="mb-8 space-y-2">
            <div className="text-xs md:text-sm text-white/70">
              Over time, Vertex took shape through consistent effort and collaboration — starting with a small core team, gradually introducing technical and cultural initiatives, and expanding into media, content, sports, and organizing. With growing participation and shared ownership, the club evolved into an inclusive community driven by students and their collective energy.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="/images/journey/milestone.jpeg"
              alt="Vertex Team"
              width={2000}
              height={2000}
              className="h-20 w-full rounded-lg object-cover md:h-44 lg:h-60"
            />
            </div>
        </div>
      ),
    },
  ]

  return (
    <section className="w-full px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">
            Our story
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            From an idea to a growing community
          </h2>
          <p className="mt-4 leading-relaxed text-white/50">
            Vertex started as a simple idea — to give students a space beyond
            academics. Over time, it grew into a collaborative club bringing
            together technology, culture, sports, and leadership through shared
            experiences and learning.
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-clip">
        <Timeline data={data} />
      </div>
    </section>
  )
}

export default Journey