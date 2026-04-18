import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { roleSpaceMeta } from '../../utils/actorSpaces';
import { canUseCart, getCart, getCartEventName } from '../../utils/cart';

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M3.75 5.25h1.56c.7 0 1.31.48 1.47 1.16l.21.84m0 0 1.34 5.37c.17.67.77 1.13 1.46 1.13h6.85c.68 0 1.28-.45 1.46-1.1l1.14-4.12a1.5 1.5 0 0 0-1.45-1.9H6.99Zm2.25 11.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm9 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

const primaryLinks = [
  { to: '/menu', label: 'Menu' },
  { to: '/reservation', label: 'Reservation' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const actorSpace = user ? roleSpaceMeta[user.role] : null;
  const [cartCount, setCartCount] = useState(0);
  const cartEnabled = canUseCart(user);

  useEffect(() => {
    const syncCartCount = () => {
      const items = getCart(user);
      setCartCount(items.reduce((sum, item) => sum + Number(item.quantity || 0), 0));
    };

    syncCartCount();
    window.addEventListener('storage', syncCartCount);
    window.addEventListener('focus', syncCartCount);
    window.addEventListener(getCartEventName(), syncCartCount);

    return () => {
      window.removeEventListener('storage', syncCartCount);
      window.removeEventListener('focus', syncCartCount);
      window.removeEventListener(getCartEventName(), syncCartCount);
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-charcoal/10 bg-white/95 backdrop-blur">
        <div className="container-shell py-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-12">
              <Link to="/" className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-tomato text-xl font-bold text-white">
                  I
                </span>
                <span className="flex flex-col">
                  <span className="font-display text-2xl font-semibold uppercase tracking-[0.04em] text-charcoal">Italia</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-charcoal/55">Ristorante</span>
                </span>
              </Link>

              <nav className="flex flex-wrap items-center gap-6 text-sm font-semibold uppercase tracking-[0.03em]">
                {primaryLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `cursor-pointer transition ${
                        isActive ? 'text-olive' : 'text-charcoal/80 hover:text-olive'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {cartEnabled ? (
                <Link
                  to="/panier"
                  className="inline-flex cursor-pointer items-center gap-3 rounded-[1rem] border border-charcoal/12 bg-cream px-4 py-3 text-charcoal transition hover:border-olive/40"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 bg-white text-charcoal">
                    <CartIcon />
                  </span>
                  <span className="text-sm font-semibold">Panier</span>
                  <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-tomato px-2 py-1 text-xs font-semibold text-white">
                    {cartCount}
                  </span>
                </Link>
              ) : null}

              {user ? (
                <>
                  <Link
                    to={user.role === 'client' ? '/client' : actorSpace?.basePath || '/'}
                    className="cursor-pointer rounded-[1rem] border border-charcoal/12 bg-white px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-olive/40 hover:text-olive"
                  >
                    {user.role === 'client' ? 'Espace client' : actorSpace?.navLabel || 'Espace'}
                  </Link>
                  <button
                    onClick={logout}
                    className="cursor-pointer rounded-[1rem] bg-tomato px-5 py-3 text-sm font-semibold text-white transition hover:bg-tomato/90"
                  >
                    Sortir
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/connexion"
                    className="cursor-pointer rounded-[1rem] border border-charcoal/12 bg-white px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-olive/40 hover:text-olive"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/inscription"
                    className="cursor-pointer rounded-[1rem] bg-tomato px-5 py-3 text-sm font-semibold text-white transition hover:bg-tomato/90"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
