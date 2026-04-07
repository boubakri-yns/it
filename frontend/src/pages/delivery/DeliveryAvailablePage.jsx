import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, statusTone } from '../../utils/actorSpaces';

export default function DeliveryAvailablePage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/deliveries/available');
    setDeliveries(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Livraison" title="Livraisons disponibles" description="Missions ouvertes a prendre en charge par le livreur." />
      <Panel title="File d affectation" subtitle="Adresse, client et commande">
        {loading ? <LoadingBlock label="Chargement des missions..." /> : null}
        {!loading && deliveries.length === 0 ? (
          <EmptyBlock label="Aucune mission n'est disponible actuellement." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">Mission #{delivery.id}</div>
                  <StatusPill tone={statusTone(delivery.status)}>{formatLabel(delivery.status)}</StatusPill>
                </div>
                <div className="mt-2 text-sm text-charcoal/65">Commande #{delivery.order?.id}</div>
                <div className="mt-2 text-sm text-charcoal/65">{delivery.order?.address || 'Adresse indisponible'}</div>
                <button onClick={() => api.put(`/deliveries/${delivery.id}/take`).then(load)} className="mt-4 rounded-full bg-tomato px-4 py-2 text-sm text-white">
                  Prendre la livraison
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
