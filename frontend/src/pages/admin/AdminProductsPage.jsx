import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
import { formatMoney } from '../../utils/actorSpaces';

export default function AdminProductsPage() {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { is_available: true, is_featured: false, preparation_time: 15 } });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: productsData }, { data: categoriesData }] = await Promise.all([api.get('/admin/products'), api.get('/admin/categories')]);
    setProducts(productsData.data || []);
    setCategories(categoriesData.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (values) => {
    await api.post('/admin/products', { ...values, price: Number(values.price), category_id: Number(values.category_id), preparation_time: Number(values.preparation_time) });
    toast.success('Plat ajoute');
    reset({ is_available: true, is_featured: false, preparation_time: 15 });
    load();
  };

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Administration" title="CRUD plats" description="Catalogue des plats avec categorie, prix et disponibilite." />
      <div className="grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="Nouveau plat" subtitle="Ajout au catalogue">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <select {...register('category_id', { required: true })} className="w-full rounded-2xl border p-3">
              <option value="">Categorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input {...register('name', { required: true })} placeholder="Nom du plat" className="w-full rounded-2xl border p-3" />
            <textarea {...register('description', { required: true })} placeholder="Description" className="min-h-24 w-full rounded-2xl border p-3" />
            <input {...register('price', { required: true })} type="number" step="0.01" placeholder="Prix" className="w-full rounded-2xl border p-3" />
            <input {...register('preparation_time', { required: true })} type="number" min="1" placeholder="Temps preparation" className="w-full rounded-2xl border p-3" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_available')} />
              Disponible
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_featured')} />
              Mis en avant
            </label>
            <button className="rounded-full bg-charcoal px-5 py-3 text-sm text-cream">Ajouter</button>
          </form>
        </Panel>
        <Panel title="Carte restaurant" subtitle="Produits existants">
          {loading ? <LoadingBlock label="Chargement des plats..." /> : null}
          {!loading && products.length === 0 ? (
            <EmptyBlock label="Aucun plat." />
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-charcoal/10 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold">{product.name}</div>
                    <div className="mt-1 text-sm text-charcoal/65">{product.category?.name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill tone={product.is_available ? 'success' : 'danger'}>{product.is_available ? 'Disponible' : 'Indisponible'}</StatusPill>
                    <span className="font-semibold">{formatMoney(product.price)}</span>
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
