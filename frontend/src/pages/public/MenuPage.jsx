import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { addToCart } from '../../utils/cart';
import { fallbackMenu } from '../../utils/menuFallback';

const MENU_CACHE_KEY = 'menu_cache_v2';

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [search, setSearch] = useState('');
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const cached = sessionStorage.getItem(MENU_CACHE_KEY);
    if (cached) setProducts(JSON.parse(cached));

    api
      .get('/products')
      .then(({ data }) => {
        const items = data.data || [];
        const resolved = items.length > 0 ? items : fallbackMenu;
        setProducts(resolved);
        sessionStorage.setItem(MENU_CACHE_KEY, JSON.stringify(resolved));
      })
      .catch(() => {
        setProducts(fallbackMenu);
        sessionStorage.setItem(MENU_CACHE_KEY, JSON.stringify(fallbackMenu));
      });
  }, []);

  const categories = useMemo(() => {
    const names = [...new Set(products.map((product) => product.category?.name).filter(Boolean))];
    return ['Tout', ...names];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const byCategory = activeCategory === 'Tout' || product.category?.name === activeCategory;
      const haystack = `${product.name} ${product.description} ${product.category?.name || ''}`.toLowerCase();
      const bySearch = haystack.includes(search.toLowerCase());
      return byCategory && bySearch;
    });
  }, [activeCategory, products, search]);

  const adjustQuantity = (productId, delta) => {
    setQuantities((current) => {
      const nextValue = Math.max(1, (current[productId] || 1) + delta);
      return { ...current, [productId]: nextValue };
    });
  };

  return (
    <section className="min-h-screen bg-cream py-10 text-charcoal">
      <div className="container-shell">
        <div className="rounded-[2rem] border border-charcoal/10 bg-white p-6 shadow-soft">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une pizza, une pasta, un dessert..."
            className="w-full rounded-2xl border border-charcoal/10 bg-cream px-5 py-4 text-sm text-charcoal outline-none placeholder:text-charcoal/35"
          />

          <div className="mt-5 flex flex-wrap gap-3">
            {categories.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-5 py-3 text-sm transition ${
                    active
                      ? 'border-tomato bg-tomato text-white'
                      : 'border-charcoal/15 bg-white text-charcoal/90 hover:border-olive'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-[1.4rem] border border-charcoal/10 bg-white">
                <div className="p-3">
                  <img src={product.image} alt={product.name} className="h-40 w-full rounded-[1rem] object-cover" />
                </div>
                <div className="px-4 pb-5">
                  <div className="flex items-center justify-between text-sm text-charcoal/70">
                    <span>{product.category?.name}</span>
                    <span>{Number(product.price).toFixed(2)} EUR</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-charcoal">{product.name}</h3>
                  <p className="mt-4 min-h-[72px] text-sm leading-6 text-charcoal/60">{product.description}</p>
                  <div className="mt-6 space-y-3">
                    <div className="rounded-[1.5rem] border border-charcoal/15 px-4 py-3">
                      <div className="mb-3 text-center text-sm font-medium text-charcoal/70">Quantite</div>
                      <div className="flex items-center justify-between gap-3 rounded-full bg-cream px-3 py-2">
                        <button
                          onClick={() => adjustQuantity(product.id, -1)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/15 bg-white text-lg text-charcoal transition hover:border-olive"
                        >
                          -
                        </button>
                        <span className="min-w-10 text-center text-base font-semibold text-charcoal">
                          {quantities[product.id] || 1}
                        </span>
                        <button
                          onClick={() => adjustQuantity(product.id, 1)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/15 bg-white text-lg text-charcoal transition hover:border-olive"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addToCart(product, quantities[product.id] || 1);
                        toast.success(`${product.name} ajoute au panier`);
                      }}
                      className="w-full rounded-full bg-tomato px-5 py-3 text-sm font-medium text-white transition hover:bg-tomato/90"
                    >
                      Commander
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
