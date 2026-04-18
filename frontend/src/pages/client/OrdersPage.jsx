import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
import { formatDateTime, formatLabel, formatMoney, statusTone } from '../../utils/actorSpaces';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/my/orders').then(({ data }) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const paidOrders = useMemo(() => orders.filter((order) => order.payment_status === 'paid'), [orders]);
  const deliveryOrders = useMemo(() => orders.filter((order) => order.order_type === 'livraison'), [orders]);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Espace client" title="Mes commandes" description="Historique de tes commandes avec type, total et statut de progression." />
      <StatGrid
        items={[
          { label: 'Total commandes', value: orders.length, note: 'Depuis la creation du compte' },
          { label: 'Payees', value: paidOrders.length, note: 'Encaissees avec succes' },
          { label: 'Livraisons', value: deliveryOrders.length, note: 'Commandes a domicile' },
          { label: 'Dernier montant', value: orders[0] ? formatMoney(orders[0].total) : '0.00 MAD', note: orders[0] ? formatLabel(orders[0].order_status) : 'Aucune commande' },
        ]}
      />
      <Panel title="Historique commandes" subtitle="Dernieres commandes du compte">
        {loading ? <LoadingBlock label="Chargement des commandes..." /> : null}
        {!loading && orders.length === 0 ? (
          <EmptyBlock label="Aucune commande pour le moment." />
        ) : (
          <div className="list-scroll max-h-[30rem] space-y-4 overflow-y-auto pr-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="font-semibold text-charcoal">Commande #{order.id}</div>
                    <div className="text-sm text-charcoal/65">
                      {formatLabel(order.order_type)} - {formatMoney(order.total)}
                    </div>
                    <div className="text-sm text-charcoal/55">{formatDateTime(order.created_at)}</div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <StatusPill tone={statusTone(order.order_status)}>{formatLabel(order.order_status)}</StatusPill>
                      <StatusPill tone={statusTone(order.payment_status)}>{formatLabel(order.payment_status)}</StatusPill>
                    </div>
                  </div>
                  <div className="grid gap-3 rounded-[1.2rem] bg-cream p-4 text-sm text-charcoal/70 lg:min-w-[240px]">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-tomato">Paiement</div>
                      <div className="mt-1 font-semibold text-charcoal">{formatLabel(order.payment_status)}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-tomato">Type</div>
                      <div className="mt-1 font-semibold text-charcoal">{formatLabel(order.order_type)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
