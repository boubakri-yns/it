import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
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

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Espace cuisine" title="Historique cuisine" description="Archive du travail deja pris en charge par le cuisinier connecte." />
      <Panel title="Commandes traitees" subtitle="Historique des tickets cuisines">
        {loading ? <LoadingBlock label="Chargement de l'historique..." /> : null}
        {!loading && orders.length === 0 ? (
          <EmptyBlock label="Aucune commande historique pour ce cuisinier." />
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
