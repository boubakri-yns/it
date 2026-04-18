import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
import { formatDateTime, formatLabel, statusTone } from '../../utils/actorSpaces';

export default function DeliveryDashboardPage() {
  const [available, setAvailable] = useState([]);
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    load();
  }, []);

  const currentMission = active[0];
  const completedCount = useMemo(() => history.filter((delivery) => delivery.status === 'delivered').length, [history]);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Espace livraison"
        title="Vue d ensemble livraison"
        description="Cette page sert de synthese. Les actions terrain restent sur les pages A prendre, En cours, Mission detail et Historique."
        actions={[
          <Link key="available" to="/delivery/available" className="rounded-full border border-charcoal/12 bg-white px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-olive/40 hover:text-olive">
            Ouvrir les missions a prendre
          </Link>,
          <Link key="active" to="/delivery/active" className="rounded-full bg-tomato px-5 py-3 text-sm font-semibold text-white transition hover:bg-tomato/90">
            Ouvrir les missions en cours
          </Link>,
        ]}
      />
      <StatGrid
        items={[
          { label: 'A prendre', value: available.length, note: 'Missions libres' },
          { label: 'En cours', value: active.length, note: 'Missions deja prises' },
          { label: 'Livrees', value: completedCount, note: 'Missions confirmees' },
          { label: 'Total suivi', value: available.length + active.length + history.length, note: 'Vision globale du flux' },
        ]}
      />
      {loading ? <LoadingBlock label="Chargement de la synthese livraison..." /> : null}
      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Etat du flux" subtitle="Ce qu il faut regarder en premier">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-cream p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-tomato">Disponible</div>
              <div className="mt-3 text-3xl font-semibold text-charcoal">{available.length}</div>
              <div className="mt-2 text-sm text-charcoal/65">Missions a affecter.</div>
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-tomato">Active</div>
              <div className="mt-3 text-3xl font-semibold text-charcoal">{active.length}</div>
              <div className="mt-2 text-sm text-charcoal/65">Livraisons en cours sur le terrain.</div>
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-charcoal p-5 text-cream">
              <div className="text-xs uppercase tracking-[0.22em] text-gold">Mission focus</div>
              <div className="mt-3 text-xl font-semibold">{currentMission ? `#${currentMission.id}` : 'Aucune'}</div>
              <div className="mt-2 text-sm text-cream/75">
                {currentMission ? formatLabel(currentMission.status) : 'Aucune mission active.'}
              </div>
            </div>
          </div>
        </Panel>
        <Panel title="Mission actuelle" subtitle="Resume rapide sans refaire la page detail">
          {!currentMission ? (
            <EmptyBlock label="Aucune mission active pour le moment." />
          ) : (
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-charcoal/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">Mission #{currentMission.id} - Commande #{currentMission.order?.id || '-'}</div>
                  <StatusPill tone={statusTone(currentMission.status)}>{formatLabel(currentMission.status)}</StatusPill>
                </div>
                <div className="mt-2 text-sm text-charcoal/65">
                  {currentMission.order?.prenom || '-'} {currentMission.order?.nom || ''}
                </div>
                <div className="mt-1 text-sm text-charcoal/55">{currentMission.order?.address || 'Adresse indisponible'}</div>
              </div>
              <Link to="/delivery/detail" className="inline-flex rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-cream transition hover:bg-charcoal/90">
                Ouvrir le detail mission
              </Link>
            </div>
          )}
        </Panel>
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="A prendre" subtitle="Apercu des prochaines missions disponibles">
          {available.length === 0 ? (
            <EmptyBlock label="Aucune livraison disponible." />
          ) : (
            <div className="list-scroll max-h-[22rem] space-y-4 overflow-y-auto pr-3">
              {available.slice(0, 3).map((delivery) => (
                <div key={delivery.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="font-semibold">Mission #{delivery.id}</div>
                  <div className="mt-2 text-sm text-charcoal/65">{delivery.order?.address || 'Adresse indisponible'}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Historique recent" subtitle="Dernieres livraisons confirmees">
          {history.length === 0 ? (
            <EmptyBlock label="Aucune livraison terminee pour le moment." />
          ) : (
            <div className="list-scroll max-h-[22rem] space-y-4 overflow-y-auto pr-3">
              {history.slice(0, 3).map((delivery) => (
                <div key={delivery.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Mission #{delivery.id}</div>
                    <StatusPill tone={statusTone(delivery.status)}>{formatLabel(delivery.status)}</StatusPill>
                  </div>
                  <div className="mt-2 text-sm text-charcoal/65">{delivery.order?.address || 'Adresse indisponible'}</div>
                  <div className="mt-1 text-sm text-charcoal/55">
                    {delivery.delivered_at ? formatDateTime(delivery.delivered_at) : 'Mission terminee'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
