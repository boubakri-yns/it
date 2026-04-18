import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatGrid, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, statusTone } from '../../utils/actorSpaces';

export default function ServerTablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/server/tables');
    setTables(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const freeTables = useMemo(() => tables.filter((table) => table.statut === 'libre'), [tables]);
  const occupiedTables = useMemo(() => tables.filter((table) => table.statut === 'occupee'), [tables]);
  const reservedTables = useMemo(() => tables.filter((table) => table.statut === 'reservee'), [tables]);

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Service salle" title="Liste des tables" description="Suivi automatique des tables reservees et passage manuel en occupee a l'arrivee." />
      <StatGrid
        items={[
          { label: 'Tables libres', value: freeTables.length, note: 'Disponibles pour accueil' },
          { label: 'Reservees', value: reservedTables.length, note: 'Attente client' },
          { label: 'Occupees', value: occupiedTables.length, note: 'En cours de service' },
          { label: 'Total', value: tables.length, note: 'Plan de salle complet' },
        ]}
      />
      <Panel title="Plan de salle" subtitle="Etat courant des tables">
        {loading ? <LoadingBlock label="Chargement des tables..." /> : null}
        {!loading && tables.length === 0 ? (
          <EmptyBlock label="Aucune table disponible." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tables.map((table) => (
              <div key={table.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Table {table.numero}</div>
                  <StatusPill tone={statusTone(table.statut)}>{formatLabel(table.statut)}</StatusPill>
                </div>
                <div className="mt-2 text-sm text-charcoal/65">{table.capacite} places</div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => api.put(`/server/tables/${table.id}/occupy`).then(load)}
                    disabled={table.statut === 'occupee'}
                    className="rounded-full bg-charcoal px-4 py-2 text-sm text-cream disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Occuper
                  </button>
                  <button
                    onClick={() => api.put(`/server/tables/${table.id}/free`).then(load)}
                    disabled={table.statut === 'libre'}
                    className="rounded-full bg-olive px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Liberer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
