import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navByRole = {
  client: [
    { to: '/client', label: 'Dashboard' },
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
    { to: '/delivery', label: 'Dashboard' },
    { to: '/delivery/available', label: 'Disponibles' },
    { to: '/delivery/active', label: 'Actives' },
    { to: '/delivery/detail', label: 'Detail mission' },
    { to: '/delivery/history', label: 'Historique' },
  ],
  server: [
    { to: '/server', label: 'Dashboard' },
    { to: '/server/reservations', label: 'Reservations' },
    { to: '/server/tables', label: 'Tables' },
    { to: '/server/ready', label: 'Pretes a servir' },
    { to: '/server/onsite', label: 'Commandes sur place' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/users', label: 'Utilisateurs' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/admin/products', label: 'Plats' },
    { to: '/admin/tables', label: 'Tables' },
    { to: '/admin/reservations', label: 'Reservations' },
    { to: '/admin/orders', label: 'Commandes' },
    { to: '/admin/payments', label: 'Paiements' },
    { to: '/admin/deliveries', label: 'Livraisons' },
    { to: '/admin/stats', label: 'Statistiques' },
    { to: '/admin/settings', label: 'Parametres' },
    { to: '/admin/logs', label: 'Logs' },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const nav = navByRole[user?.role] || [];

  return (
    <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
      <aside className="bg-charcoal px-6 py-8 text-cream">
        <div className="font-display text-3xl text-gold">Italia</div>
        <div className="mt-3 text-sm text-cream/70">
          {user?.prenom} {user?.nom}
        </div>
        <nav className="mt-8 space-y-2">
          <Link to="/" className="block rounded-2xl border border-white/10 px-4 py-3 text-gold hover:bg-white/10">
            Retour au site
          </Link>
          {nav.map((item) => (
            <Link key={item.to} to={item.to} className="block rounded-2xl px-4 py-3 hover:bg-white/10">
              {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="mt-8 rounded-2xl bg-tomato px-4 py-3 text-sm text-white">
          Logout
        </button>
      </aside>
      <main className="bg-stone-50">
        <div className="container-shell py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
