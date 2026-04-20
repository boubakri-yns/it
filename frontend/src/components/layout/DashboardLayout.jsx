import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import SiteFooter from './SiteFooter';

const navByRole = {
  client: [
    { to: '/client', label: 'Vue d ensemble' },
    { to: '/client/profil', label: 'Profil' },
    { to: '/client/commandes', label: 'Commandes' },
    { to: '/client/reservations', label: 'Reservations' },
  ],
  cook: [
    { to: '/cook', label: 'Dashboard' },
    { to: '/cook/production', label: 'Production' },
    { to: '/cook/history', label: 'Historique' },
  ],
  delivery: [
    { to: '/delivery', label: 'Vue d ensemble' },
    { to: '/delivery/available', label: 'A prendre' },
    { to: '/delivery/detail', label: 'Mission detail' },
    { to: '/delivery/history', label: 'Historique' },
  ],
  server: [
    { to: '/server', label: 'Vue d ensemble' },
    { to: '/server/reservations', label: 'Accueil clients' },
    { to: '/server/tables', label: 'Plan de salle' },
    { to: '/server/ready', label: 'Passe cuisine' },
    { to: '/server/onsite', label: 'Prise de commande' },
  ],
  admin: [
    { to: '/admin', label: 'Vue d ensemble' },
    { to: '/admin/users', label: 'Utilisateurs' },
    { to: '/admin/products', label: 'Catalogue' },
    { to: '/admin/orders', label: 'Commandes' },
    { to: '/admin/reservations', label: 'Reservations' },
    { to: '/admin/settings', label: 'Parametres' },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const nav = navByRole[user?.role] || [];
  const roleTitle =
    user?.role === 'client'
      ? 'Espace client'
      : user?.role === 'delivery'
        ? 'Espace livraison'
      : user?.role === 'server'
          ? 'Espace service'
          : user?.role === 'admin'
            ? 'Espace administration'
          : 'Tableau de bord';

  return (
    <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
      <aside className="bg-charcoal px-6 py-8 text-cream">
        <div className="font-display text-3xl text-gold">Italia</div>
        <div className="mt-4 text-xs uppercase tracking-[0.28em] text-gold/70">{roleTitle}</div>
        <div className="mt-3 text-sm text-cream/70">
          {user?.prenom} {user?.nom}
        </div>
        <nav className="mt-8 space-y-2">
          <Link to="/" className="block rounded-2xl border border-white/10 px-4 py-3 text-gold hover:bg-white/10">
            Retour au site
          </Link>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/client' || item.to === '/cook' || item.to === '/delivery' || item.to === '/server' || item.to === '/admin'}
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 transition ${
                  isActive ? 'bg-white text-charcoal' : 'text-cream hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="mt-8 rounded-2xl bg-tomato px-4 py-3 text-sm text-white">
          Deconnexion
        </button>
      </aside>
      <div className="flex min-h-screen flex-col bg-stone-50">
        <main className="flex-1">
          <div className="container-shell py-8">
            <Outlet />
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
