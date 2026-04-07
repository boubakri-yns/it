import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SectionTitle from '../../components/ui/SectionTitle';

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
          <div className="rounded-[2rem] bg-white/10 p-8 shadow-soft backdrop-blur">
            <div className="grid gap-4 md:grid-cols-2">
              {(data?.featured_products || []).slice(0, 4).map((product) => (
                <div key={product.id} className="rounded-3xl bg-white/10 p-4">
                  <div className="text-sm uppercase tracking-[0.3em] text-gold">{product.category?.name || 'Signature'}</div>
                  <div className="mt-2 font-display text-2xl">{product.name}</div>
                  <div className="mt-2 text-sm text-cream/70">{product.price} EUR</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-20">
        <SectionTitle
          eyebrow="Specialites"
          title="Une carte rapide a parcourir, pensée pour commander sans friction."
          description="Menu synchronisé avec l’API, catégories claires et plats mis en avant."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {(data?.featured_products || []).map((product) => (
            <div key={product.id} className="rounded-[2rem] bg-white p-6 shadow-soft">
              <div className="text-sm uppercase tracking-[0.3em] text-olive">{product.name}</div>
              <p className="mt-3 text-sm text-charcoal/70">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold text-tomato">{product.price} EUR</span>
                <Link to={`/menu/${product.id}`} className="text-sm font-semibold text-charcoal">
                  Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
