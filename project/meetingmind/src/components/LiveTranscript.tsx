import { useRef, useEffect } from 'react'

const CONFIRMED_LINES = [
  "SARAH: Good morning everyone. Let's get started on the product roadmap review. I want to make sure we cover the Q3 priorities before we lose anyone.",
  "JAMES: Thanks Sarah. So we've had some good progress on the mobile experience. The design team finished the new onboarding flow last Friday and it's looking really polished.",
  "SARAH: That's great to hear. What's the timeline looking like for the procurement side? I know Marcus had some concerns about the vendor contracts.",
  "MARCUS: Right, so we flagged two vendors whose contracts are up for renewal in July. Legal needs to review both before we can proceed. I'm going to set up a call with them this week.",
  "JAMES: One thing I want to raise - the resourcing for the July design sprint is still not confirmed. We need at least two senior designers and a front-end engineer committed before end of May.",
  "SARAH: Noted. Let's make sure that's an action item. Marcus, can you also confirm the budget allocation for the new tooling before next week's finance call?",
  "MARCUS: Yes, I'll loop in Finance today. I think we're in good shape but I want to double-check the line items.",
]

const INTERIM_LINE = "SARAH: Perfect. Let's wrap up - I'll send out the summary notes and action items by..."

export default function LiveTranscript() {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-xl p-4 font-mono text-sm min-h-0">
      <div className="flex flex-col gap-3">
        {CONFIRMED_LINES.map((line, i) => (
          <p key={i} className="text-gray-800 leading-relaxed">
            {line}
          </p>
        ))}
        <p className="text-gray-400 leading-relaxed italic">{INTERIM_LINE}</p>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
