const information = [
  { id: 'about', title: 'About', description: 'A National Level Hackathon.' },
  { id: 'schedule', title: 'Schedule', description: 'Information to be announced.' },
  { id: 'prizes', title: 'Prizes', description: 'Information to be announced.' },
  { id: 'faqs', title: 'FAQs', description: 'Information to be announced.' },
]

export function InformationSection() {
  return (
    <section aria-label="HackWarts event information" className="border-t border-[#b89a59]/15 bg-[#080d15] px-5 py-16 sm:px-8 sm:py-20 lg:px-14">
      <div className="mx-auto max-w-[1280px]">
        <div className="mx-auto mb-9 max-w-md text-center">
          <p className="eyebrow">Event Information</p>
          <p className="mt-3 text-xs leading-6 text-[#a4a19a]">Further details will be shared when confirmed.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {information.map((item) => (
            <article key={item.id} id={item.id} className="scroll-mt-24 border border-[#d0ae65]/15 bg-[linear-gradient(145deg,rgba(255,255,255,.035),transparent_45%),#0b111a] px-5 py-5 transition-colors hover:border-[#d0ae65]/35">
              <h2 className="display-font text-lg font-normal text-[#e5d9bd]">{item.title}</h2>
              <p className="mt-2 text-xs leading-5 text-[#96969a]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
