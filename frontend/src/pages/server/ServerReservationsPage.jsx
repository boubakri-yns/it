import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
import { formatDateTime, formatLabel, statusTone } from '../../utils/actorSpaces';

export default function ServerReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/server/reservations/today');
    setReservations(data);
    setLoading(false);
  };

  useEffect(() => {
    load();

    const intervalId = window.setInterval(() => {
      api.get('/server/reservations/today').then(({ data }) => {
        setReservations(data);
      });
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  const arrivedReservations = useMemo(() => reservations.filter((reservation) => reservation.status === 'arrived'), [reservations]);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Service salle" title="Reservations a venir" description="Les reservations confirmees passent ensuite en occupee manuellement a l'arrivee du client." />
      <StatGrid
        items={[
          { label: 'Reservations', value: reservations.length, note: 'Flux du jour' },
          { label: 'Arrivees', value: arrivedReservations.length, note: 'Clients deja accueillis' },
          { label: 'Prochaine table', value: reservations[0]?.table?.numero || '-', note: reservations[0] ? reservations[0].reservation_time : 'Aucune reservation' },
          { label: 'Prochaine arrivee', value: reservations[0] ? formatDateTime(`${reservations[0].reservation_date} ${reservations[0].reservation_time}`) : '-', note: 'Ordre de prise en charge' },
        ]}
      />
      <Panel title="Accueil clients" subtitle="Reservations confirmees a prendre en charge">
        {loading ? <LoadingBlock label="Chargement des reservations..." /> : null}
        {!loading && reservations.length === 0 ? (
          <EmptyBlock label="Aucune reservation a venir." />
        ) : (
          <div className="list-scroll max-h-[30rem] space-y-4 overflow-y-auto pr-3">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-charcoal/10 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="font-semibold">
                    {reservation.prenom} {reservation.nom}
                  </div>
                  <div className="mt-1 text-sm text-charcoal/65">
                    {formatDateTime(`${reservation.reservation_date} ${reservation.reservation_time}`)} - {reservation.guest_count} couverts - table {reservation.table?.numero}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill tone={statusTone(reservation.status)}>{formatLabel(reservation.status)}</StatusPill>
                  {reservation.status !== 'arrived' ? (
                    <button onClick={() => api.put(`/server/reservations/${reservation.id}/arrive`).then(load)} className="rounded-full bg-tomato px-4 py-2 text-sm text-white">
                      Passer en occupee
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
