import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
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

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Service salle" title="Liste des tables" description="Actions rapides pour occuper ou liberer les tables du restaurant." />
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
                  <button onClick={() => api.put(`/server/tables/${table.id}/occupy`).then(load)} className="rounded-full bg-charcoal px-4 py-2 text-sm text-cream">
                    Occuper
                  </button>
                  <button onClick={() => api.put(`/server/tables/${table.id}/free`).then(load)} className="rounded-full bg-olive px-4 py-2 text-sm text-white">
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
