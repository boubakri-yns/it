import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';

export default function AdminCategoriesPage() {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { is_active: true } });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/admin/categories');
    setCategories(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (values) => {
    await api.post('/admin/categories', values);
    toast.success('Categorie ajoutee');
    reset({ is_active: true, name: '', description: '' });
    load();
  };

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Administration" title="CRUD categories" description="Gestion des categories visibles dans le menu du restaurant." />
      <div className="grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="Nouvelle categorie" subtitle="Ajout rapide">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('name', { required: true })} placeholder="Nom" className="w-full rounded-2xl border p-3" />
            <textarea {...register('description')} placeholder="Description" className="min-h-24 w-full rounded-2xl border p-3" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_active')} />
              Visible
            </label>
            <button className="rounded-full bg-charcoal px-5 py-3 text-sm text-cream">Ajouter</button>
          </form>
        </Panel>
        <Panel title="Liste categories" subtitle="Categories existantes">
          {loading ? <LoadingBlock label="Chargement des categories..." /> : null}
          {!loading && categories.length === 0 ? (
            <EmptyBlock label="Aucune categorie." />
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div>
                    <div className="font-semibold">{category.name}</div>
                    <div className="mt-1 text-sm text-charcoal/65">{category.description || 'Sans description'}</div>
                  </div>
                  <StatusPill tone={category.is_active ? 'success' : 'danger'}>{category.is_active ? 'Visible' : 'Masquee'}</StatusPill>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
