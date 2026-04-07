import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
import { formatDateTime, formatLabel, formatMoney, statusTone } from '../../utils/actorSpaces';

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/my/orders'), api.get('/my/reservations')]).then(([ordersRes, reservationsRes]) => {
      setOrders(ordersRes.data);
      setReservations(reservationsRes.data);
      setLoading(false);
    });
  }, []);

  const latestOrder = orders[0];
  const latestReservation = reservations[0];

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Espace client"
        title={`Bienvenue ${user?.prenom || ''}`}
        description="Retrouve ici ton profil, tes commandes, tes reservations et le suivi recent de ton activite."
      />
      <StatGrid
        items={[
          { label: 'Commandes', value: orders.length, note: 'Historique client' },
          { label: 'Reservations', value: reservations.length, note: 'Toutes tes reservations' },
          { label: 'Derniere commande', value: latestOrder ? formatMoney(latestOrder.total) : '0.00 EUR', note: latestOrder ? formatLabel(latestOrder.order_status) : 'Aucune commande' },
          { label: 'Prochaine reservation', value: latestReservation ? `${latestReservation.reservation_time}` : '-', note: latestReservation ? `${latestReservation.reservation_date}` : 'Aucune reservation' },
        ]}
      />
      {loading ? <LoadingBlock label="Chargement de l'espace client..." /> : null}
      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Dernieres commandes" subtitle="Suivi recent de tes achats">
          {!loading && orders.length === 0 ? (
            <EmptyBlock label="Aucune commande pour le moment." />
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 4).map((order) => (
                <div key={order.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-charcoal/10 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold">Commande #{order.id}</div>
                    <div className="mt-1 text-sm text-charcoal/65">
                      {formatLabel(order.order_type)} - {formatMoney(order.total)}
                    </div>
                  </div>
                  <StatusPill tone={statusTone(order.order_status)}>{formatLabel(order.order_status)}</StatusPill>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Reservations recentes" subtitle="Ta relation avec la salle">
          {!loading && reservations.length === 0 ? (
            <EmptyBlock label="Aucune reservation pour le moment." />
          ) : (
            <div className="space-y-4">
              {reservations.slice(0, 4).map((reservation) => (
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
    </div>
  );
}
