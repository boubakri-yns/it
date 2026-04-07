export default function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? <p className="text-sm uppercase tracking-[0.35em] text-tomato">{eyebrow}</p> : null}
      <h2 className="mt-3 font-display text-4xl text-charcoal">{title}</h2>
      {description ? <p className="mt-4 text-charcoal/70">{description}</p> : null}
    </div>
  );
}
