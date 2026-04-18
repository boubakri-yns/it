import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
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
  const recentActivity = useMemo(() => {
    return [
      latestOrder
        ? {
            id: `order-${latestOrder.id}`,
            title: `Commande #${latestOrder.id}`,
            detail: `${formatLabel(latestOrder.order_type)} - ${formatMoney(latestOrder.total)}`,
            meta: formatLabel(latestOrder.order_status),
            tone: statusTone(latestOrder.order_status),
          }
        : null,
      latestReservation
        ? {
            id: `reservation-${latestReservation.id}`,
            title: `Reservation table ${latestReservation.table?.numero || '-'}`,
            detail: formatDateTime(`${latestReservation.reservation_date} ${latestReservation.reservation_time}`),
            meta: formatLabel(latestReservation.status),
            tone: statusTone(latestReservation.status),
          }
        : null,
    ].filter(Boolean);
  }, [latestOrder, latestReservation]);

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Espace client"
        title={`Bienvenue ${user?.prenom || ''}`}
        description="Retrouve ici ton profil, tes commandes, tes reservations et le suivi recent de ton activite."
        actions={[
          <Link key="orders" to="/client/commandes" className="rounded-full border border-charcoal/12 bg-white px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-olive/40 hover:text-olive">
            Voir mes commandes
          </Link>,
          <Link key="reservations" to="/client/reservations" className="rounded-full bg-tomato px-5 py-3 text-sm font-semibold text-white transition hover:bg-tomato/90">
            Voir mes reservations
          </Link>,
        ]}
      />
      <StatGrid
        items={[
          { label: 'Commandes', value: orders.length, note: 'Historique client' },
          { label: 'Reservations', value: reservations.length, note: 'Toutes tes reservations' },
          { label: 'Derniere commande', value: latestOrder ? formatMoney(latestOrder.total) : '0.00 MAD', note: latestOrder ? formatLabel(latestOrder.order_status) : 'Aucune commande' },
          { label: 'Prochaine reservation', value: latestReservation ? `${latestReservation.reservation_time}` : '-', note: latestReservation ? `${latestReservation.reservation_date}` : 'Aucune reservation' },
        ]}
      />
      {loading ? <LoadingBlock label="Chargement de l'espace client..." /> : null}
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Resume rapide" subtitle="Acces directs et statut du compte">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-cream p-5">
              <div className="text-sm uppercase tracking-[0.24em] text-tomato">Compte</div>
              <div className="mt-3 text-xl font-semibold text-charcoal">
                {user?.prenom} {user?.nom}
              </div>
              <div className="mt-2 text-sm text-charcoal/65">{user?.email}</div>
              <div className="mt-1 text-sm text-charcoal/65">{user?.telephone || 'Telephone non renseigne'}</div>
              <Link to="/client/profil" className="mt-5 inline-flex rounded-full border border-charcoal/12 bg-white px-4 py-2 text-sm font-semibold text-charcoal transition hover:border-olive/40 hover:text-olive">
                Mettre a jour mon profil
              </Link>
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-charcoal p-5 text-cream">
              <div className="text-sm uppercase tracking-[0.24em] text-gold">Priorite</div>
              <div className="mt-3 text-xl font-semibold">
                {latestOrder ? `Suivi de la commande #${latestOrder.id}` : 'Aucune commande en cours'}
              </div>
              <div className="mt-2 text-sm text-cream/75">
                {latestOrder
                  ? `${formatLabel(latestOrder.order_type)} - ${formatMoney(latestOrder.total)}`
                  : 'Ajoute un plat au panier pour commencer une nouvelle commande.'}
              </div>
              {latestOrder ? (
                <div className="mt-4">
                  <StatusPill tone={statusTone(latestOrder.order_status)}>{formatLabel(latestOrder.order_status)}</StatusPill>
                </div>
              ) : null}
            </div>
          </div>
        </Panel>
        <Panel title="Activite recente" subtitle="Les derniers mouvements de ton espace">
          {recentActivity.length === 0 ? (
            <EmptyBlock label="Aucune activite recente pour le moment." />
          ) : (
            <div className="list-scroll max-h-[24rem] space-y-4 overflow-y-auto pr-3">
              {recentActivity.map((entry) => (
                <div key={entry.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold text-charcoal">{entry.title}</div>
                      <div className="mt-1 text-sm text-charcoal/65">{entry.detail}</div>
                    </div>
                    <StatusPill tone={entry.tone}>{entry.meta}</StatusPill>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Dernieres commandes" subtitle="Suivi recent de tes achats">
          {!loading && orders.length === 0 ? (
            <EmptyBlock label="Aucune commande pour le moment." />
          ) : (
            <div className="list-scroll max-h-[24rem] space-y-4 overflow-y-auto pr-3">
              {orders.slice(0, 4).map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-semibold">Commande #{order.id}</div>
                      <div className="mt-1 text-sm text-charcoal/65">
                        {formatLabel(order.order_type)} - {formatMoney(order.total)}
                      </div>
                      <div className="mt-2 text-sm text-charcoal/55">{formatDateTime(order.created_at)}</div>
                    </div>
                    <StatusPill tone={statusTone(order.order_status)}>{formatLabel(order.order_status)}</StatusPill>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Reservations recentes" subtitle="Ta relation avec la salle">
          {!loading && reservations.length === 0 ? (
            <EmptyBlock label="Aucune reservation pour le moment." />
          ) : (
            <div className="list-scroll max-h-[24rem] space-y-4 overflow-y-auto pr-3">
              {reservations.slice(0, 4).map((reservation) => (
                <div key={reservation.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="font-semibold">Table {reservation.table?.numero || '-'}</div>
                      <div className="mt-1 text-sm text-charcoal/65">
                        {formatDateTime(`${reservation.reservation_date} ${reservation.reservation_time}`)}
                      </div>
                      <div className="mt-2 text-sm text-charcoal/55">{reservation.guest_count} personne(s)</div>
                    </div>
                    <StatusPill tone={statusTone(reservation.status)}>{formatLabel(reservation.status)}</StatusPill>
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
