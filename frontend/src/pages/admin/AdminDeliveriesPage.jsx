import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, statusTone } from '../../utils/actorSpaces';

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/deliveries').then(({ data }) => {
      setDeliveries(data.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Administration" title="Livraisons" description="Suivi des missions logistiques, des chauffeurs assignes et des statuts." />
      <Panel title="Missions" subtitle="Historique recent">
        {loading ? <LoadingBlock label="Chargement des livraisons..." /> : null}
        {!loading && deliveries.length === 0 ? (
          <EmptyBlock label="Aucune livraison." />
        ) : (
          <div className="list-scroll max-h-[30rem] space-y-4 overflow-y-auto pr-3">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-charcoal/10 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-semibold">Livraison #{delivery.id}</div>
                  <div className="mt-1 text-sm text-charcoal/65">
                    Commande #{delivery.order?.id || '-'} - {delivery.delivery_user?.prenom || 'Non assigne'}
                  </div>
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
