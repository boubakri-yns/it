import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, statusTone } from '../../utils/actorSpaces';

export default function CookOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/kitchen/orders');
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const pending = orders.filter((order) => ['paid', 'accepted'].includes(order.order_status));
  const preparing = orders.filter((order) => order.order_status === 'in_preparation');
  const ready = orders.filter((order) => order.order_status === 'ready');
  const totalItems = useMemo(
    () => orders.reduce((sum, order) => sum + (order.items?.reduce((acc, item) => acc + Number(item.quantity || 0), 0) || 0), 0),
    [orders],
  );

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Espace cuisine" title="Flux de production" description="Le travail cuisine est organise en trois etapes: lancer, preparer, remettre." />
      <StatGrid
        items={[
          { label: 'A lancer', value: pending.length, note: 'Tickets a demarrer' },
          { label: 'En preparation', value: preparing.length, note: 'Commandes sur le poste' },
          { label: 'Pretes', value: ready.length, note: 'A remettre au service' },
          { label: 'Articles', value: totalItems, note: 'Volume total en cuisine' },
        ]}
      />
      {loading ? <LoadingBlock label="Chargement du centre de production..." /> : null}
      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="1. A lancer" subtitle="Commandes prêtes à entrer en preparation">
          {pending.length === 0 ? (
            <EmptyBlock label="Aucune commande en attente de lancement." />
          ) : (
            <div className="list-scroll max-h-[26rem] space-y-4 overflow-y-auto pr-3">
              {pending.map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Commande #{order.id}</div>
                    <StatusPill tone={statusTone(order.order_status)}>{formatLabel(order.order_status)}</StatusPill>
                  </div>
                  <div className="mt-2 text-sm text-charcoal/65">{formatLabel(order.order_type)}</div>
                  <div className="mt-1 text-sm text-charcoal/55">{order.items?.length || 0} ligne(s) de preparation</div>
                  <button onClick={() => api.put(`/kitchen/orders/${order.id}/start`).then(load)} className="mt-4 rounded-full bg-charcoal px-4 py-2 text-sm text-cream">
                    Demarrer preparation
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="2. En preparation" subtitle="Commandes en cours de realisation">
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
                  <div className="mt-2 text-sm text-charcoal/65">{formatLabel(order.order_type)}</div>
                  <div className="mt-1 text-sm text-charcoal/55">{order.items?.length || 0} ligne(s) en cours</div>
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
