import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, statusTone } from '../../utils/actorSpaces';

export default function AdminTablesPage() {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { statut: 'libre', is_active: true } });
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/admin/tables');
    setTables(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (values) => {
    await api.post('/admin/tables', { ...values, capacite: Number(values.capacite) });
    toast.success('Table ajoutee');
    reset({ statut: 'libre', is_active: true });
    load();
  };

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Administration" title="CRUD tables" description="Configuration des tables de salle avec capacite et statut." />
      <div className="grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="Nouvelle table" subtitle="Creation rapide">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('numero', { required: true })} placeholder="Numero" className="w-full rounded-2xl border p-3" />
            <input {...register('capacite', { required: true })} type="number" min="1" placeholder="Capacite" className="w-full rounded-2xl border p-3" />
            <select {...register('statut')} className="w-full rounded-2xl border p-3">
              <option value="libre">Libre</option>
              <option value="reservee">Reservee</option>
              <option value="occupee">Occupee</option>
              <option value="indisponible">Indisponible</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_active')} />
              Active
            </label>
            <button className="rounded-full bg-charcoal px-5 py-3 text-sm text-cream">Ajouter</button>
          </form>
        </Panel>
        <Panel title="Parc des tables" subtitle="Etat courant">
          {loading ? <LoadingBlock label="Chargement des tables..." /> : null}
          {!loading && tables.length === 0 ? (
            <EmptyBlock label="Aucune table." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tables.map((table) => (
                <div key={table.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Table {table.numero}</div>
                    <StatusPill tone={statusTone(table.statut)}>{formatLabel(table.statut)}</StatusPill>
                  </div>
                  <div className="mt-2 text-sm text-charcoal/65">{table.capacite} places</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
