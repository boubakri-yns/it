import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
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

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Livraison" title="Historique livraisons" description="Vue archivee des missions deja livrees par le compte connecte." />
      <Panel title="Dernieres missions" subtitle="Cloturees avec succes">
        {loading ? <LoadingBlock label="Chargement de l'historique livraison..." /> : null}
        {!loading && deliveries.length === 0 ? (
          <EmptyBlock label="Aucune livraison terminee." />
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-charcoal/10 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">Mission #{delivery.id} - Commande #{delivery.order?.id}</div>
                  <div className="mt-1 text-sm text-charcoal/65">Livree le {formatDateTime(delivery.delivered_at)}</div>
                </div>
                <StatusPill tone={statusTone(delivery.status)}>{formatLabel(delivery.status)}</StatusPill>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
