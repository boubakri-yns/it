import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, statusTone } from '../../utils/actorSpaces';

export default function DeliveryMinePage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/deliveries/active');
    setDeliveries(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Livraison" title="Mes livraisons actives" description="Missions en cours avec boutons de changement de statut." />
      <Panel title="Missions en cours" subtitle="Suivi des etapes terrain">
        {loading ? <LoadingBlock label="Chargement des missions actives..." /> : null}
        {!loading && deliveries.length === 0 ? (
          <EmptyBlock label="Aucune livraison active." />
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-semibold">Mission #{delivery.id} - Commande #{delivery.order?.id}</div>
                  <StatusPill tone={statusTone(delivery.status)}>{formatLabel(delivery.status)}</StatusPill>
                </div>
                <div className="mt-2 text-sm text-charcoal/65">{delivery.order?.address || 'Adresse indisponible'}</div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => api.put(`/deliveries/${delivery.id}/start`).then(load)} className="rounded-full bg-charcoal px-4 py-2 text-sm text-cream">
                    Demarrer
                  </button>
                  <button onClick={() => api.put(`/deliveries/${delivery.id}/arrived`).then(load)} className="rounded-full bg-olive px-4 py-2 text-sm text-white">
                    Marquer arrive
                  </button>
                  <button onClick={() => api.put(`/deliveries/${delivery.id}/complete`).then(load)} className="rounded-full bg-tomato px-4 py-2 text-sm text-white">
                    Livraison effectuee
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
