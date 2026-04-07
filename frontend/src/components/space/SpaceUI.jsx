export function PageIntro({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-6 rounded-[2rem] bg-white p-8 shadow-soft lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.35em] text-tomato">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl text-charcoal md:text-5xl">{title}</h1>
        <p className="mt-4 text-charcoal/70">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function StatGrid({ items }) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-[2rem] bg-white p-6 shadow-soft">
          <div className="text-sm uppercase tracking-[0.3em] text-tomato">{item.label}</div>
          <div className="mt-4 font-display text-4xl">{item.value}</div>
          {item.note ? <p className="mt-3 text-sm text-charcoal/60">{item.note}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-soft">
      <div>
        <h2 className="font-display text-3xl">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-charcoal/65">{subtitle}</p> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function StatusPill({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-charcoal/10 text-charcoal',
    warm: 'bg-gold/20 text-charcoal',
    success: 'bg-olive/15 text-olive',
    danger: 'bg-tomato/15 text-tomato',
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function FauxMap({ title, subtitle }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-charcoal/10">
      <div className="bg-charcoal px-5 py-4 text-cream">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-cream/70">{subtitle}</div>
      </div>
      <div className="grid min-h-[260px] place-items-center bg-[linear-gradient(135deg,rgba(206,91,63,0.12)_25%,transparent_25%,transparent_50%,rgba(206,91,63,0.12)_50%,rgba(206,91,63,0.12)_75%,transparent_75%,transparent)] bg-[length:48px_48px] p-6">
        <div className="rounded-[2rem] bg-white/90 px-6 py-5 text-center shadow-soft">
          <div className="text-sm uppercase tracking-[0.3em] text-tomato">Carte</div>
          <div className="mt-3 font-display text-3xl">Point de livraison</div>
          <div className="mt-2 text-sm text-charcoal/70">Suivi terrain, itineraire et confirmation de statut</div>
        </div>
      </div>
    </div>
  );
}

export function LoadingBlock({ label = 'Chargement...' }) {
  return <div className="rounded-[2rem] bg-white p-6 text-sm text-charcoal/60 shadow-soft">{label}</div>;
}

export function EmptyBlock({ label = 'Aucune donnee disponible.' }) {
  return <div className="rounded-[2rem] border border-dashed border-charcoal/15 bg-white p-6 text-sm text-charcoal/60">{label}</div>;
}
