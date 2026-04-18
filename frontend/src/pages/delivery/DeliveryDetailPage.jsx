import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, FauxMap, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, statusTone } from '../../utils/actorSpaces';

export default function DeliveryDetailPage() {
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/deliveries/active').then(async ({ data }) => {
      if (!data.length) {
        setLoading(false);
        return;
      }

      const detail = await api.get(`/deliveries/${data[0].id}`);
      setDelivery(detail.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingBlock label="Chargement du detail livraison..." />;
  }

  if (!delivery) {
    return <EmptyBlock label="Aucune livraison active a afficher." />;
  }

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Livraison"
        title={`Detail mission #${delivery.id}`}
        description={`Commande #${delivery.order?.id} pour ${delivery.order?.prenom || ''} ${delivery.order?.nom || ''}.`}
        actions={[
          <button key="start" onClick={() => api.put(`/deliveries/${delivery.id}/start`).then(({ data }) => setDelivery(data))} className="rounded-full bg-charcoal px-5 py-3 text-sm text-cream">
            Demarrer
          </button>,
          <button key="arrived" onClick={() => api.put(`/deliveries/${delivery.id}/arrived`).then(({ data }) => setDelivery(data))} className="rounded-full bg-olive px-5 py-3 text-sm text-white">
            Marquer arrive
          </button>,
          <button key="done" onClick={() => api.put(`/deliveries/${delivery.id}/complete`).then(({ data }) => setDelivery(data))} className="rounded-full bg-tomato px-5 py-3 text-sm text-white">
            Confirmer livree
          </button>,
        ]}
      />
      <StatGrid
        items={[
          { label: 'Mission', value: `#${delivery.id}`, note: `Commande #${delivery.order?.id || '-'}` },
          { label: 'Statut', value: formatLabel(delivery.status), note: 'Etat actuel du trajet' },
          { label: 'Ville', value: delivery.order?.city || '-', note: 'Zone de destination' },
          { label: 'Client', value: delivery.order?.prenom || '-', note: delivery.order?.nom || '-' },
        ]}
      />
      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <FauxMap title={delivery.order?.address || 'Adresse indisponible'} subtitle={`Coords ${delivery.order?.latitude || '-'}, ${delivery.order?.longitude || '-'}`} />
        <Panel title="Informations client" subtitle="Coordonnees et statut de la mission">
          <div className="space-y-4 text-sm text-charcoal/75">
            <div>
              <div className="text-charcoal/50">Client</div>
              <div className="mt-1 text-base font-semibold text-charcoal">
                {delivery.order?.prenom} {delivery.order?.nom}
              </div>
            </div>
            <div>
              <div className="text-charcoal/50">Telephone</div>
              <div className="mt-1 text-base font-semibold text-charcoal">{delivery.order?.telephone || '-'}</div>
            </div>
            <div>
              <div className="text-charcoal/50">Adresse</div>
              <div className="mt-1 text-base font-semibold text-charcoal">{delivery.order?.address || '-'}</div>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-stone-50 p-4">
              <span>Statut</span>
              <StatusPill tone={statusTone(delivery.status)}>{formatLabel(delivery.status)}</StatusPill>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
