import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, statusTone } from '../../utils/actorSpaces';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reservations').then(({ data }) => {
      setReservations(data.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Administration" title="Reservations" description="Controle des reservations clients et de l'affectation des tables." />
      <Panel title="Reservations recentes" subtitle="Lecture back-office">
        {loading ? <LoadingBlock label="Chargement des reservations..." /> : null}
        {!loading && reservations.length === 0 ? (
          <EmptyBlock label="Aucune reservation." />
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-charcoal/10 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-semibold">
                    {reservation.prenom} {reservation.nom}
                  </div>
                  <div className="mt-1 text-sm text-charcoal/65">
                    Table {reservation.table?.numero || '-'} - {reservation.reservation_date} {reservation.reservation_time}
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
