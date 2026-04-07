import { useEffect, useState } from 'react';
import api from '../../api/axios';
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

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Espace service" title="Pilotage de la salle" description="Reservations a venir, etat des tables et commandes sur place a servir." />
      <StatGrid
        items={[
          { label: 'Reservations', value: reservations.length, note: 'A venir' },
          { label: 'Tables', value: tables.length, note: 'Plan de salle' },
          { label: 'Pretes a servir', value: readyOrders.length, note: 'Sorties cuisine' },
          { label: 'Commandes salle', value: onsiteOrders.length, note: 'Historique recent' },
        ]}
      />
      {loading ? <LoadingBlock label="Chargement du dashboard salle..." /> : null}
      <div className="grid gap-8 xl:grid-cols-2">
        <Panel title="Reservations a venir" subtitle="Prochaines arrivees">
          {reservations.length === 0 ? (
            <EmptyBlock label="Aucune reservation a venir." />
          ) : (
            <div className="space-y-4">
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
        <Panel title="Commandes pretes" subtitle="A prendre en charge">
          {readyOrders.length === 0 ? (
            <EmptyBlock label="Aucune commande prete a servir." />
          ) : (
            <div className="space-y-4">
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
    </div>
  );
}
