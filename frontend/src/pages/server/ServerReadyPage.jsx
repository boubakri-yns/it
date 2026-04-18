import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
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

  const onsiteReady = useMemo(() => orders.filter((order) => order.order_type === 'sur_place'), [orders]);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Service salle" title="Passe cuisine" description="Tickets sortis de cuisine, prets a etre recuperes puis servis en salle." />
      <StatGrid
        items={[
          { label: 'Pretes', value: orders.length, note: 'Toutes les commandes a servir' },
          { label: 'Sur place', value: onsiteReady.length, note: 'Commandes liees aux tables' },
          { label: 'Prochaine table', value: orders[0]?.table?.numero || '-', note: orders[0] ? `Commande #${orders[0].id}` : 'Aucune commande' },
          { label: 'Action', value: orders.length > 0 ? 'Servir' : '-', note: 'Valider la sortie vers la salle' },
        ]}
      />
      <Panel title="Passe cuisine" subtitle="Marquer les commandes comme servies">
        {loading ? <LoadingBlock label="Chargement des commandes pretes..." /> : null}
        {!loading && orders.length === 0 ? (
          <EmptyBlock label="Aucune commande prete a servir." />
        ) : (
            <div className="list-scroll max-h-[30rem] space-y-4 overflow-y-auto pr-3">
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
