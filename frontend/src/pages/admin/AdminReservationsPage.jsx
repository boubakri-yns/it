import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
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

  const confirmedReservations = useMemo(() => reservations.filter((reservation) => reservation.status === 'confirmed'), [reservations]);
  const arrivedReservations = useMemo(() => reservations.filter((reservation) => reservation.status === 'arrived'), [reservations]);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Administration" title="Reservations" description="Vision propre des reservations pour suivre la charge salle et les tables concernees." />
      <StatGrid
        items={[
          { label: 'Reservations', value: reservations.length, note: 'Volume global' },
          { label: 'Confirmees', value: confirmedReservations.length, note: 'Attente d accueil' },
          { label: 'Arrivees', value: arrivedReservations.length, note: 'Deja prises en charge' },
          { label: 'Prochaine table', value: reservations[0]?.table?.numero || '-', note: reservations[0] ? reservations[0].reservation_time : 'Aucune reservation' },
        ]}
      />
      <Panel title="Reservations recentes" subtitle="Lecture back-office">
        {loading ? <LoadingBlock label="Chargement des reservations..." /> : null}
        {!loading && reservations.length === 0 ? (
          <EmptyBlock label="Aucune reservation." />
        ) : (
          <div className="list-scroll max-h-[30rem] space-y-4 overflow-y-auto pr-3">
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
