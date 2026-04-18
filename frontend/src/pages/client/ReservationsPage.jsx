import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
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

  const confirmedReservations = useMemo(() => reservations.filter((reservation) => reservation.status === 'confirmed'), [reservations]);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Espace client" title="Mes reservations" description="Retrouve tes reservations, ta table et leur statut de confirmation." />
      <StatGrid
        items={[
          { label: 'Reservations', value: reservations.length, note: 'Historique complet' },
          { label: 'Confirmees', value: confirmedReservations.length, note: 'Pretes a etre honorees' },
          { label: 'Derniere table', value: reservations[0]?.table?.numero || '-', note: reservations[0] ? reservations[0].reservation_date : 'Aucune reservation' },
          { label: 'Prochaine heure', value: reservations[0]?.reservation_time || '-', note: reservations[0] ? formatLabel(reservations[0].status) : 'Aucune reservation' },
        ]}
      />
      <Panel title="Historique reservations" subtitle="Toutes tes reservations">
        {loading ? <LoadingBlock label="Chargement des reservations..." /> : null}
        {!loading && reservations.length === 0 ? (
          <EmptyBlock label="Aucune reservation pour le moment." />
        ) : (
          <div className="list-scroll max-h-[30rem] space-y-4 overflow-y-auto pr-3">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="font-semibold text-charcoal">Table {reservation.table?.numero || '-'}</div>
                    <div className="text-sm text-charcoal/65">
                      {formatDateTime(`${reservation.reservation_date} ${reservation.reservation_time}`)}
                    </div>
                    <div className="text-sm text-charcoal/55">{reservation.guest_count} personne(s)</div>
                    {reservation.notes ? <div className="text-sm text-charcoal/55">Note: {reservation.notes}</div> : null}
                  </div>
                  <div className="grid gap-3 rounded-[1.2rem] bg-cream p-4 text-sm text-charcoal/70 lg:min-w-[240px]">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-tomato">Statut</div>
                      <div className="mt-1">
                        <StatusPill tone={statusTone(reservation.status)}>{formatLabel(reservation.status)}</StatusPill>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-tomato">Date</div>
                      <div className="mt-1 font-semibold text-charcoal">{reservation.reservation_date}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
