import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, formatMoney, statusTone } from '../../utils/actorSpaces';

export default function CookHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/kitchen/history').then(({ data }) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const readyOrders = useMemo(() => orders.filter((order) => order.order_status === 'ready'), [orders]);
  const deliveryOrders = useMemo(() => orders.filter((order) => order.order_type === 'livraison'), [orders]);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Espace cuisine" title="Historique cuisine" description="Archive du travail deja pris en charge par le cuisinier connecte." />
      <StatGrid
        items={[
          { label: 'Traitees', value: orders.length, note: 'Commandes deja gerees' },
          { label: 'Pretes', value: readyOrders.length, note: 'Sorties de cuisine' },
          { label: 'Livraisons', value: deliveryOrders.length, note: 'Commandes destinees au livreur' },
          { label: 'Derniere', value: orders[0] ? `#${orders[0].id}` : '-', note: orders[0] ? formatMoney(orders[0].total) : 'Aucune commande' },
        ]}
      />
      <Panel title="Commandes traitees" subtitle="Historique des tickets cuisines">
        {loading ? <LoadingBlock label="Chargement de l'historique..." /> : null}
        {!loading && orders.length === 0 ? (
          <EmptyBlock label="Aucune commande historique pour ce cuisinier." />
        ) : (
          <div className="list-scroll max-h-[30rem] space-y-4 overflow-y-auto pr-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="font-semibold">Commande #{order.id}</div>
                    <div className="mt-1 text-sm text-charcoal/65">
                      {formatLabel(order.order_type)} - {formatMoney(order.total)}
                    </div>
                    <div className="mt-2 text-sm text-charcoal/55">{order.items?.length || 0} ligne(s) traitee(s)</div>
                  </div>
                  <StatusPill tone={statusTone(order.order_status)}>{formatLabel(order.order_status)}</StatusPill>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
