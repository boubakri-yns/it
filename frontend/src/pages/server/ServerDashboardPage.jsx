import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
import { formatDateTime, formatLabel, statusTone } from '../../utils/actorSpaces';

export default function ServerDashboardPage() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [onsiteOrders, setOnsiteOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    const [reservationsRes, tablesRes, readyRes, onsiteRes] = await Promise.all([
      api.get('/server/reservations/today'),
      api.get('/server/tables'),
      api.get('/server/orders/ready'),
      api.get('/server/orders/onsite'),
    ]);

    setReservations(reservationsRes.data);
    setTables(tablesRes.data);
    setReadyOrders(readyRes.data);
    setOnsiteOrders(onsiteRes.data);

    if (showLoader) {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const intervalId = window.setInterval(() => {
      load(false);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  const occupiedTables = useMemo(() => tables.filter((table) => table.statut === 'occupee'), [tables]);
  const nextReservation = reservations[0];

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Espace service"
        title="Flux salle"
        description="L activite service est organisee en quatre blocs : accueil client, suivi des tables, passe cuisine et commandes sur place."
        actions={[
          <Link key="reservations" to="/server/reservations" className="rounded-full border border-charcoal/12 bg-white px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-olive/40 hover:text-olive">
            Voir l accueil clients
          </Link>,
          <Link key="ready" to="/server/ready" className="rounded-full bg-tomato px-5 py-3 text-sm font-semibold text-white transition hover:bg-tomato/90">
            Aller au passe cuisine
          </Link>,
        ]}
      />
      <StatGrid
        items={[
          { label: 'A accueillir', value: reservations.length, note: 'Reservations du jour' },
          { label: 'Tables occupees', value: occupiedTables.length, note: 'Salle actuellement prise' },
          { label: 'Pretes a servir', value: readyOrders.length, note: 'Sorties cuisine' },
          { label: 'Commandes sur place', value: onsiteOrders.length, note: 'Tickets salle' },
        ]}
      />
      {loading ? <LoadingBlock label="Chargement du dashboard salle..." /> : null}
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Priorite salle" subtitle="Le point de focus immediat du service">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-cream p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-tomato">Accueil</div>
              <div className="mt-3 text-3xl font-semibold text-charcoal">{reservations.length}</div>
              <div className="mt-2 text-sm text-charcoal/65">Clients a prendre en charge.</div>
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-tomato">Salle</div>
              <div className="mt-3 text-3xl font-semibold text-charcoal">{occupiedTables.length}</div>
              <div className="mt-2 text-sm text-charcoal/65">Tables marquees occupees.</div>
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-charcoal p-5 text-cream">
              <div className="text-xs uppercase tracking-[0.22em] text-gold">Prochaine arrivee</div>
              <div className="mt-3 text-xl font-semibold">{nextReservation ? `Table ${nextReservation.table?.numero || '-'}` : 'Aucune'}</div>
              <div className="mt-2 text-sm text-cream/75">
                {nextReservation ? formatDateTime(`${nextReservation.reservation_date} ${nextReservation.reservation_time}`) : 'Aucune reservation a venir.'}
              </div>
            </div>
          </div>
        </Panel>
        <Panel title="Passe cuisine" subtitle="Ce qui est pret a partir en salle">
          {readyOrders.length === 0 ? (
            <EmptyBlock label="Aucune commande prete a servir." />
          ) : (
            <div className="list-scroll max-h-[24rem] space-y-4 overflow-y-auto pr-3">
              {readyOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Commande #{order.id}</div>
                    <StatusPill tone={statusTone(order.order_status)}>{formatLabel(order.order_status)}</StatusPill>
                  </div>
                  <div className="mt-2 text-sm text-charcoal/65">Table {order.table?.numero || '-'}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Accueil clients" subtitle="Reservations a venir">
          {reservations.length === 0 ? (
            <EmptyBlock label="Aucune reservation a venir." />
          ) : (
            <div className="list-scroll max-h-[24rem] space-y-4 overflow-y-auto pr-3">
              {reservations.slice(0, 4).map((reservation) => (
                <div key={reservation.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="font-semibold">
                    {reservation.prenom} {reservation.nom}
                  </div>
                  <div className="mt-2 text-sm text-charcoal/65">
                    Table {reservation.table?.numero} - {formatDateTime(`${reservation.reservation_date} ${reservation.reservation_time}`)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Commandes sur place" subtitle="Tickets actuellement presents en salle">
          {onsiteOrders.length === 0 ? (
            <EmptyBlock label="Aucune commande sur place." />
          ) : (
            <div className="list-scroll max-h-[24rem] space-y-4 overflow-y-auto pr-3">
              {onsiteOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Commande #{order.id}</div>
                    <StatusPill tone={statusTone(order.order_status)}>{formatLabel(order.order_status)}</StatusPill>
                  </div>
                  <div className="mt-2 text-sm text-charcoal/65">Table {order.table?.numero || '-'}</div>
                  <div className="mt-1 text-sm text-charcoal/55">{formatLabel(order.order_type)}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
