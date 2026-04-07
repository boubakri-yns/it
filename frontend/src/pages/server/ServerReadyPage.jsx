import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, statusTone } from '../../utils/actorSpaces';

export default function ServerReadyPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/server/orders/ready');
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Service salle" title="Commandes prêtes a servir" description="Tickets sortis de cuisine en attente d'envoi en salle." />
      <Panel title="Passe cuisine" subtitle="Marquer les commandes comme servies">
        {loading ? <LoadingBlock label="Chargement des commandes pretes..." /> : null}
        {!loading && orders.length === 0 ? (
          <EmptyBlock label="Aucune commande prete a servir." />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-charcoal/10 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-semibold">Commande #{order.id} - Table {order.table?.numero || '-'}</div>
                  <div className="mt-1 text-sm text-charcoal/65">{order.items?.length || 0} articles</div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill tone={statusTone(order.order_status)}>{formatLabel(order.order_status)}</StatusPill>
                  <button onClick={() => api.put(`/server/orders/${order.id}/serve`).then(load)} className="rounded-full bg-tomato px-4 py-2 text-sm text-white">
                    Servir maintenant
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
