import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { LoadingBlock, PageIntro, Panel, StatGrid } from '../../components/space/SpaceUI';
import { formatDateTime } from '../../utils/actorSpaces';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard/stats').then(({ data }) => setStats(data));
  }, []);

  if (!stats) {
    return <LoadingBlock label="Chargement du dashboard admin..." />;
  }

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Espace admin" title="Centre de pilotage" description="Vue synthese des volumes, revenus et activites recentes de la plateforme." />
      <StatGrid
        items={[
          { label: 'Utilisateurs', value: stats.users, note: 'Tous roles' },
          { label: 'Plats', value: stats.products, note: `${stats.categories} categories` },
          { label: 'Commandes', value: stats.orders, note: `${stats.deliveries} livraisons` },
          { label: 'Revenu', value: `${Number(stats.revenue_paid || 0).toFixed(2)} EUR`, note: `${stats.reservations} reservations` },
        ]}
      />
      <Panel title="Derniers logs" subtitle="Activite recente du systeme">
        <div className="space-y-4">
          {(stats.latest_logs || []).map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-[1.5rem] border border-charcoal/10 p-5">
              <div>
                <div className="font-semibold">{log.action}</div>
                <div className="mt-1 text-sm text-charcoal/65">{log.description}</div>
              </div>
              <div className="text-sm text-charcoal/50">{formatDateTime(log.created_at)}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
