import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, statusTone } from '../../utils/actorSpaces';

export default function CookDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: current }, { data: past }] = await Promise.all([api.get('/kitchen/orders'), api.get('/kitchen/history')]);
    setOrders(current);
    setHistory(past);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const pending = orders.filter((order) => ['paid', 'accepted'].includes(order.order_status));
  const preparing = orders.filter((order) => order.order_status === 'in_preparation');
  const ready = orders.filter((order) => order.order_status === 'ready');
  const latestReady = ready[0];
  const totalPreparationLines = useMemo(
    () => orders.reduce((sum, order) => sum + (order.items?.length || 0), 0),
    [orders],
  );

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Espace cuisine" title="Pilotage des preparations" description="Vue claire du flux cuisine : ce qui entre en poste, ce qui est en cours et ce qui sort du passe." />
      <StatGrid
        items={[
          { label: 'A preparer', value: pending.length, note: 'Tickets a lancer' },
          { label: 'En preparation', value: preparing.length, note: 'Prises par la brigade' },
          { label: 'Pretes', value: ready.length, note: 'En attente de retrait' },
          { label: 'Lignes actives', value: totalPreparationLines, note: 'Charge cuisine instantanee' },
        ]}
      />
      {loading ? <LoadingBlock label="Chargement des commandes cuisine..." /> : null}
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Vue chef" subtitle="Point rapide sur la production en cours">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-cream p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-tomato">File d attente</div>
              <div className="mt-3 text-3xl font-semibold text-charcoal">{pending.length}</div>
              <div className="mt-2 text-sm text-charcoal/65">Commandes a lancer des maintenant.</div>
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-tomato">En poste</div>
              <div className="mt-3 text-3xl font-semibold text-charcoal">{preparing.length}</div>
              <div className="mt-2 text-sm text-charcoal/65">Commandes actuellement en cuisine.</div>
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-charcoal p-5 text-cream">
              <div className="text-xs uppercase tracking-[0.22em] text-gold">Sortie</div>
              <div className="mt-3 text-3xl font-semibold">{ready.length}</div>
              <div className="mt-2 text-sm text-cream/75">
                {latestReady ? `Derniere prete: #${latestReady.id}` : 'Aucune commande prete actuellement.'}
              </div>
            </div>
          </div>
        </Panel>
        <Panel title="Historique recent" subtitle="Production deja traitee">
          {history.length === 0 ? (
            <EmptyBlock label="Aucune commande historique pour le moment." />
          ) : (
            <div className="list-scroll max-h-[26rem] space-y-4 overflow-y-auto pr-3">
              {history.slice(0, 4).map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Commande #{order.id}</div>
                    <StatusPill tone={statusTone(order.order_status)}>{formatLabel(order.order_status)}</StatusPill>
                  </div>
                  <div className="mt-2 text-sm text-charcoal/65">{formatLabel(order.order_type)}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="A preparer" subtitle="Commandes payees ou acceptees">
          {pending.length === 0 ? (
            <EmptyBlock label="Aucune commande a preparer." />
          ) : (
            <div className="list-scroll max-h-[26rem] space-y-4 overflow-y-auto pr-3">
              {pending.map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Commande #{order.id}</div>
                    <StatusPill tone={statusTone(order.order_status)}>{formatLabel(order.order_status)}</StatusPill>
                  </div>
                  <div className="mt-2 text-sm text-charcoal/65">{order.items?.length || 0} articles</div>
                  <button onClick={() => api.put(`/kitchen/orders/${order.id}/start`).then(load)} className="mt-4 rounded-full bg-charcoal px-4 py-2 text-sm text-cream">
                    Demarrer preparation
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="En preparation" subtitle="Commandes en cours de fabrication">
          {preparing.length === 0 ? (
            <EmptyBlock label="Aucune commande en preparation." />
          ) : (
            <div className="list-scroll max-h-[26rem] space-y-4 overflow-y-auto pr-3">
              {preparing.map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Commande #{order.id}</div>
                    <StatusPill tone="warm">{formatLabel(order.order_status)}</StatusPill>
                  </div>
                  <div className="mt-2 text-sm text-charcoal/65">{order.items?.length || 0} articles</div>
                  <button onClick={() => api.put(`/kitchen/orders/${order.id}/ready`).then(load)} className="mt-4 rounded-full bg-tomato px-4 py-2 text-sm text-white">
                    Commande prete
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
