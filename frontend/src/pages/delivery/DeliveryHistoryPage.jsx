import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
import { formatDateTime, formatLabel, statusTone } from '../../utils/actorSpaces';

export default function DeliveryHistoryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/deliveries/history').then(({ data }) => {
      setDeliveries(data);
      setLoading(false);
    });
  }, []);

  const deliveredCount = useMemo(() => deliveries.filter((delivery) => delivery.status === 'delivered').length, [deliveries]);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Livraison" title="Historique livraisons" description="Vue archivee des missions deja livrees par le compte connecte." />
      <StatGrid
        items={[
          { label: 'Livrees', value: deliveredCount, note: 'Missions confirmees' },
          { label: 'Historique', value: deliveries.length, note: 'Toutes les missions cloturees' },
          { label: 'Derniere mission', value: deliveries[0] ? `#${deliveries[0].id}` : '-', note: deliveries[0]?.order?.city || 'Aucune mission' },
          { label: 'Derniere date', value: deliveries[0]?.delivered_at ? formatDateTime(deliveries[0].delivered_at) : '-', note: 'Confirmation de livraison' },
        ]}
      />
      <Panel title="Dernieres missions" subtitle="Cloturees avec succes">
        {loading ? <LoadingBlock label="Chargement de l'historique livraison..." /> : null}
        {!loading && deliveries.length === 0 ? (
          <EmptyBlock label="Aucune livraison terminee." />
        ) : (
          <div className="list-scroll max-h-[30rem] space-y-4 overflow-y-auto pr-3">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="font-semibold">Mission #{delivery.id} - Commande #{delivery.order?.id}</div>
                    <div className="mt-1 text-sm text-charcoal/65">Livree le {formatDateTime(delivery.delivered_at)}</div>
                    <div className="mt-2 text-sm text-charcoal/55">{delivery.order?.address || 'Adresse indisponible'}</div>
                  </div>
                  <StatusPill tone={statusTone(delivery.status)}>{formatLabel(delivery.status)}</StatusPill>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
