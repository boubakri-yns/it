import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { LoadingBlock, PageIntro, Panel, StatGrid } from '../../components/space/SpaceUI';
import { formatDateTime } from '../../utils/actorSpaces';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard/stats').then(({ data }) => setStats(data));
  }, []);

  const operations = useMemo(
    () => [
      { label: 'Comptes', value: stats?.users ?? 0, note: 'Clients et equipes actives' },
      { label: 'Catalogue', value: stats?.products ?? 0, note: `${stats?.categories ?? 0} categories organisees` },
      { label: 'Commandes', value: stats?.orders ?? 0, note: `${stats?.deliveries ?? 0} livraisons reliees` },
      { label: 'Encaisse', value: `${Number(stats?.revenue_paid || 0).toFixed(2)} MAD`, note: `${stats?.reservations ?? 0} reservations gerees` },
    ],
    [stats],
  );

  if (!stats) {
    return <LoadingBlock label="Chargement du dashboard admin..." />;
  }

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Espace administration"
        title="Pilotage global"
        description="Le back-office est centre sur cinq blocs utiles : comptes, catalogue, commandes, reservations et parametres."
      />
      <StatGrid items={operations} />
      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Priorites admin" subtitle="Ce qu il faut surveiller en premier">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-cream p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-tomato">Comptes</div>
              <div className="mt-3 text-3xl font-semibold text-charcoal">{stats.users}</div>
              <div className="mt-2 text-sm text-charcoal/65">Verifier les acces et les roles actifs.</div>
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-tomato">Carte</div>
              <div className="mt-3 text-3xl font-semibold text-charcoal">{stats.products}</div>
              <div className="mt-2 text-sm text-charcoal/65">Maintenir un catalogue propre et disponible.</div>
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-tomato">Flux</div>
              <div className="mt-3 text-3xl font-semibold text-charcoal">{stats.orders}</div>
              <div className="mt-2 text-sm text-charcoal/65">Suivre les commandes et les reservations.</div>
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-charcoal p-5 text-cream">
              <div className="text-xs uppercase tracking-[0.22em] text-gold">Revenu</div>
              <div className="mt-3 text-3xl font-semibold">{Number(stats.revenue_paid || 0).toFixed(2)} MAD</div>
              <div className="mt-2 text-sm text-cream/75">Vision rapide de l encaissement confirme.</div>
            </div>
          </div>
        </Panel>
        <Panel title="Activite recente" subtitle="Derniers evenements systeme">
          {stats.latest_logs?.length ? (
            <div className="list-scroll max-h-[28rem] space-y-4 overflow-y-auto pr-3">
              {stats.latest_logs.map((log) => (
                <div key={log.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">{log.action}</div>
                    <div className="text-sm text-charcoal/50">{formatDateTime(log.created_at)}</div>
                  </div>
                  <div className="mt-2 text-sm text-charcoal/65">{log.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-charcoal/15 bg-white p-6 text-sm text-charcoal/60">
              Aucun log recent.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
