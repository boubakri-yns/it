import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SectionTitle from '../../components/ui/SectionTitle';
import chefHero from '../../assets/chef-real-hq.png';

export default function HomePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('home_cache');
    if (cached) {
      setData(JSON.parse(cached));
    }

    api.get('/public/home').then(({ data: response }) => {
      setData(response);
      sessionStorage.setItem('home_cache', JSON.stringify(response));
    });
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-charcoal py-24 text-cream">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(192,57,43,0.45),_transparent_35%),linear-gradient(135deg,_rgba(91,107,45,0.85),_rgba(31,27,24,0.96))]" />
        <div className="container-shell relative grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Premium Italian Dining</p>
            <h1 className="mt-6 font-display text-5xl leading-tight md:text-7xl">{data?.hero?.title || 'Italia Restaurant'}</h1>
            <p className="mt-6 max-w-2xl text-lg text-cream/80">{data?.hero?.subtitle}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/menu" className="rounded-full bg-tomato px-6 py-3 text-white">
                Voir le menu
              </Link>
              <Link to="/reservation" className="rounded-full border border-white/30 px-6 py-3">
                Reserver une table
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={chefHero}
              alt="Illustration d'un chef italien avec une pizza"
              className="mx-auto block w-full max-w-[380px] select-none object-contain [filter:drop-shadow(0_20px_34px_rgba(0,0,0,0.22))]"
              loading="eager"
              decoding="async"
              draggable="false"
            />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,164,92,0.14),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(192,57,43,0.08),_transparent_28%)]" />
        <div className="container-shell relative">
          <SectionTitle
            eyebrow="Specialites"
            title="Une carte rapide a parcourir, pensée pour commander sans friction."
            description="Menu synchronisé avec l'API, catégories claires et plats mis en avant."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(data?.featured_products || []).slice(0, 6).map((product) => (
              <article
                key={product.id}
                className="group flex min-h-[182px] flex-col rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(31,27,24,0.16)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[0.7rem] uppercase tracking-[0.42em] text-gold">
                      {product.category?.name || 'Specialite'}
                    </div>
                    <h3 className="mt-3 font-display text-[1.8rem] leading-none text-charcoal">{product.name}</h3>
                  </div>
                  <span className="rounded-full border border-tomato/15 bg-tomato/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-tomato">
                    Signature
                  </span>
                </div>

                <p className="mt-4 min-h-[72px] text-sm leading-7 text-charcoal/70">{product.description}</p>

                <div className="mt-auto flex items-end justify-between gap-4 pt-5">
                  <span className="text-xl font-semibold text-tomato">{Number(product.price).toFixed(2)} MAD</span>
                  <Link
                    to={`/menu/${product.id}`}
                    className="inline-flex items-center rounded-full border border-charcoal/12 px-4 py-2 text-sm font-semibold text-charcoal transition group-hover:border-olive/40 group-hover:text-olive"
                  >
                    Voir detail
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
