import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, statusTone } from '../../utils/actorSpaces';

export default function DeliveryDashboardPage() {
  const [available, setAvailable] = useState([]);
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: availableData }, { data: activeData }, { data: historyData }] = await Promise.all([
      api.get('/deliveries/available'),
      api.get('/deliveries/active'),
      api.get('/deliveries/history'),
    ]);
    setAvailable(availableData);
    setActive(activeData);
    setHistory(historyData);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Espace livraison" title="Pilotage des tournees" description="Missions disponibles, livraisons actives et suivi des tournees terminees." />
      <StatGrid
        items={[
          { label: 'Disponibles', value: available.length, note: 'Attente d affectation' },
          { label: 'Actives', value: active.length, note: 'Missions en cours' },
          { label: 'Historique', value: history.length, note: 'Livraisons terminees' },
          { label: 'Performance', value: `${history.length + active.length}`, note: 'Missions traitees' },
        ]}
      />
      {loading ? <LoadingBlock label="Chargement du dashboard livraison..." /> : null}
      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Disponibles" subtitle="A prendre en charge">
          {available.length === 0 ? (
            <EmptyBlock label="Aucune livraison disponible." />
          ) : (
            <div className="space-y-4">
              {available.slice(0, 4).map((delivery) => (
                <div key={delivery.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="font-semibold">Commande #{delivery.order?.id}</div>
                  <div className="mt-2 text-sm text-charcoal/65">{delivery.order?.address || 'Adresse indisponible'}</div>
                  <button onClick={() => api.put(`/deliveries/${delivery.id}/take`).then(load)} className="mt-4 rounded-full bg-tomato px-4 py-2 text-sm text-white">
                    Accepter
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Actives" subtitle="Missions actuellement assignees">
          {active.length === 0 ? (
            <EmptyBlock label="Aucune mission active." />
          ) : (
            <div className="space-y-4">
              {active.slice(0, 4).map((delivery) => (
                <div key={delivery.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Mission #{delivery.id}</div>
                    <StatusPill tone={statusTone(delivery.status)}>{formatLabel(delivery.status)}</StatusPill>
                  </div>
                  <div className="mt-2 text-sm text-charcoal/65">{delivery.order?.address || 'Adresse indisponible'}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
