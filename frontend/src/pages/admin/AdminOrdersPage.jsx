import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
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

  const deliveryOrders = useMemo(() => orders.filter((order) => order.order_type === 'livraison'), [orders]);
  const onsiteOrders = useMemo(() => orders.filter((order) => order.order_type === 'sur_place'), [orders]);
  const activeOrders = useMemo(
    () => orders.filter((order) => !['livree', 'served', 'cancelled', 'annulee'].includes(order.order_status)),
    [orders],
  );

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Administration" title="Commandes" description="Lecture centrale du flux de vente avec separation claire entre volume, type et avancement." />
      <StatGrid
        items={[
          { label: 'Total', value: orders.length, note: 'Toutes les commandes' },
          { label: 'Actives', value: activeOrders.length, note: 'Encore en traitement' },
          { label: 'Livraison', value: deliveryOrders.length, note: 'Commandes avec mission livreur' },
          { label: 'Sur place', value: onsiteOrders.length, note: 'Tickets lies aux tables' },
        ]}
      />
      <Panel title="Flux commandes" subtitle="Historique recent">
        {loading ? <LoadingBlock label="Chargement des commandes..." /> : null}
        {!loading && orders.length === 0 ? (
          <EmptyBlock label="Aucune commande." />
        ) : (
          <div className="list-scroll max-h-[30rem] space-y-4 overflow-y-auto pr-3">
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
