import { useEffect, useState } from 'react';
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

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Espace cuisine" title="Pilotage des preparations" description="Vue temps reel des commandes a prendre, en cours et pretes a remettre au service ou a la livraison." />
      <StatGrid
        items={[
          { label: 'A preparer', value: pending.length, note: 'Tickets a lancer' },
          { label: 'En preparation', value: preparing.length, note: 'Prises par la brigade' },
          { label: 'Pretes', value: ready.length, note: 'En attente de retrait' },
          { label: 'Historique', value: history.length, note: 'Commandes deja traitees' },
        ]}
      />
      {loading ? <LoadingBlock label="Chargement des commandes cuisine..." /> : null}
      <div className="grid gap-8 xl:grid-cols-3">
        <Panel title="A preparer" subtitle="Commandes payees ou acceptees">
          {pending.length === 0 ? (
            <EmptyBlock label="Aucune commande a preparer." />
          ) : (
            <div className="space-y-4">
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
            <div className="space-y-4">
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
        <Panel title="Pretes" subtitle="A retirer par le service ou le livreur">
          {ready.length === 0 ? (
            <EmptyBlock label="Aucune commande prete." />
          ) : (
            <div className="space-y-4">
              {ready.map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="font-semibold">Commande #{order.id}</div>
                  <div className="mt-2 text-sm text-charcoal/65">{formatLabel(order.order_type)}</div>
                  <div className="mt-4">
                    <StatusPill tone="success">{formatLabel(order.order_status)}</StatusPill>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
