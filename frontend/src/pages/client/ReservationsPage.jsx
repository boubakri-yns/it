import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
import { formatDateTime, formatLabel, statusTone } from '../../utils/actorSpaces';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/my/reservations').then(({ data }) => {
      setReservations(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Espace client" title="Mes reservations" description="Retrouve tes reservations, ta table et leur statut de confirmation." />
      <Panel title="Historique reservations" subtitle="Toutes tes reservations">
        {loading ? <LoadingBlock label="Chargement des reservations..." /> : null}
        {!loading && reservations.length === 0 ? (
          <EmptyBlock label="Aucune reservation pour le moment." />
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-charcoal/10 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">Table {reservation.table?.numero || '-'}</div>
                  <div className="mt-1 text-sm text-charcoal/65">
                    {formatDateTime(`${reservation.reservation_date} ${reservation.reservation_time}`)}
                  </div>
                </div>
                <StatusPill tone={statusTone(reservation.status)}>{formatLabel(reservation.status)}</StatusPill>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
