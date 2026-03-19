export default function LearnView() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-7 pb-12" style={{ background: 'var(--bg2)' }}>
        <div className="max-w-[860px] mx-auto">
          <div className="mb-6">
            <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }} className="text-[1.3rem] italic">
              Learn
            </div>
            <div className="text-[0.72rem] leading-relaxed mt-1" style={{ color: 'var(--ink3)' }}>
              A quick guide to using One Honest Look. We’ll expand this over time.
            </div>
          </div>

          <div className="space-y-3">
            <section
              className="rounded-xl border p-5"
              style={{ background: 'var(--bg)', borderColor: 'var(--rule)', boxShadow: 'var(--sh)' }}
            >
              <div className="text-[0.7rem] font-medium tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--ink3)' }}>
                Front-end framework (for now)
              </div>
              <div className="text-[0.8rem] leading-[1.9]" style={{ color: 'var(--ink2)' }}>
                This app is built with <strong>React</strong> (UI), bundled by <strong>Vite</strong> (dev server & builds),
                and styled with utility classes (Tailwind-style) alongside theme variables (for example <code>var(--bg)</code> and{' '}
                <code>var(--ink)</code>).
              </div>
              <div className="mt-3 text-[0.78rem] leading-[1.9]" style={{ color: 'var(--ink3)' }}>
                We’ll use this tab to document patterns, shortcuts, and best practices for working in the project—starting with the
                front-end stack, then moving into data/storage, views, and workflows.
              </div>
            </section>

            <section
              className="rounded-xl border p-5"
              style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}
            >
              <div className="text-[0.7rem] font-medium tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--ink3)' }}>
                What you can do next
              </div>
              <ul className="text-[0.8rem] leading-[1.9] list-disc pl-5" style={{ color: 'var(--ink2)' }}>
                <li>Write step-by-step “how to use the map” instructions.</li>
                <li>Add explanations for Progress tracking and Snapshots.</li>
                <li>Link to the most important UI screens/components for contributors.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

