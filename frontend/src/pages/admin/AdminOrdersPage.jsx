import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, formatMoney, statusTone } from '../../utils/actorSpaces';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/orders').then(({ data }) => {
      setOrders(data.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Administration" title="Commandes" description="Vision transversale des commandes livraison, sur place et a emporter." />
      <Panel title="Flux commandes" subtitle="Historique recent">
        {loading ? <LoadingBlock label="Chargement des commandes..." /> : null}
        {!loading && orders.length === 0 ? (
          <EmptyBlock label="Aucune commande." />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-charcoal/10 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">Commande #{order.id}</div>
                  <div className="mt-1 text-sm text-charcoal/65">
                    {formatLabel(order.order_type)} - {formatMoney(order.total)}
                  </div>
                </div>
                <StatusPill tone={statusTone(order.order_status)}>{formatLabel(order.order_status)}</StatusPill>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
