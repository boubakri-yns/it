import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
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

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Espace cuisine" title="Centre de production" description="Actions principales de la cuisine: lancement de la preparation et validation du passage au statut prete." />
      {loading ? <LoadingBlock label="Chargement du centre de production..." /> : null}
      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Backlog cuisine" subtitle="Commandes a demarrer">
          {pending.length === 0 ? (
            <EmptyBlock label="Le backlog cuisine est vide." />
          ) : (
            <div className="space-y-4">
              {pending.map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between">
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
        <Panel title="Commandes au passe" subtitle="Finalisation et sortie de cuisine">
          {preparing.length === 0 ? (
            <EmptyBlock label="Aucune commande en cours a finaliser." />
          ) : (
            <div className="space-y-4">
              {preparing.map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Commande #{order.id}</div>
                    <StatusPill tone="warm">{formatLabel(order.order_status)}</StatusPill>
                  </div>
                  <div className="mt-2 text-sm text-charcoal/65">{formatLabel(order.order_type)}</div>
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
