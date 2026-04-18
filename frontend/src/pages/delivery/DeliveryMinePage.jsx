import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
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

  const started = useMemo(() => deliveries.filter((delivery) => delivery.status === 'livraison_commencee'), [deliveries]);
  const arrived = useMemo(() => deliveries.filter((delivery) => delivery.status === 'arrive_a_destination'), [deliveries]);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Livraison" title="Mes missions en cours" description="Le flux est simple : demarrer, arriver a destination, confirmer la livraison." />
      <StatGrid
        items={[
          { label: 'Actives', value: deliveries.length, note: 'Toutes les missions en cours' },
          { label: 'Demarrees', value: started.length, note: 'En route vers le client' },
          { label: 'Sur place', value: arrived.length, note: 'Arrivees a destination' },
          { label: 'Etape', value: deliveries[0] ? formatLabel(deliveries[0].status) : '-', note: deliveries[0] ? `Mission #${deliveries[0].id}` : 'Aucune mission' },
        ]}
      />
      <Panel title="Missions en cours" subtitle="Suivi des etapes terrain">
        {loading ? <LoadingBlock label="Chargement des missions actives..." /> : null}
        {!loading && deliveries.length === 0 ? (
          <EmptyBlock label="Aucune livraison active." />
        ) : (
          <div className="list-scroll max-h-[30rem] space-y-4 overflow-y-auto pr-3">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-semibold">Mission #{delivery.id} - Commande #{delivery.order?.id}</div>
                  <StatusPill tone={statusTone(delivery.status)}>{formatLabel(delivery.status)}</StatusPill>
                </div>
                <div className="mt-2 text-sm text-charcoal/55">
                  Client: {delivery.order?.prenom || '-'} {delivery.order?.nom || ''}
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
