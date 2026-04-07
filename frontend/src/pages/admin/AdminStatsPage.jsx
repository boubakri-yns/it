import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { LoadingBlock, PageIntro, Panel, StatGrid } from '../../components/space/SpaceUI';

export default function AdminStatsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard/detailed-stats').then(({ data }) => setStats(data));
  }, []);

  if (!stats) {
    return <LoadingBlock label="Chargement des statistiques detaillees..." />;
  }

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Administration" title="Statistiques detaillees" description="Lecture croisee des commandes, livraisons, paiements et logs recents." />
      <StatGrid
        items={[
          { label: 'Types commande', value: Object.keys(stats.orders_by_type || {}).length, note: 'Canaux actifs' },
          { label: 'Statuts commande', value: Object.keys(stats.orders_by_status || {}).length, note: 'Suivi du flux' },
          { label: 'Statuts livraison', value: Object.keys(stats.deliveries_by_status || {}).length, note: 'Logistique' },
          { label: 'Moyens paiement', value: Object.keys(stats.payments_by_method || {}).length, note: 'Encaissement' },
        ]}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <Panel title="Commandes par type" subtitle="Repartition">
          <div className="space-y-3">
            {Object.entries(stats.orders_by_type || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl bg-stone-50 p-4">
                <span>{key}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Paiements par methode" subtitle="Repartition">
          <div className="space-y-3">
            {Object.entries(stats.payments_by_method || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl bg-stone-50 p-4">
                <span>{key}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
