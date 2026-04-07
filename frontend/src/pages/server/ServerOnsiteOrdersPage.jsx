import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';
import { formatLabel, formatMoney, statusTone } from '../../utils/actorSpaces';

export default function ServerOnsiteOrdersPage() {
  const { user } = useAuth();
  const { register, handleSubmit, reset } = useForm();
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([{ product_id: '', quantity: 1 }]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: ordersData }, { data: tablesData }, { data: productsData }] = await Promise.all([
      api.get('/server/orders/onsite'),
      api.get('/server/tables'),
      api.get('/products'),
    ]);
    setOrders(ordersData);
    setTables(tablesData);
    setProducts(productsData.data || productsData);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const availableProducts = useMemo(() => products.filter((product) => product.is_available), [products]);

  const addItem = () => setSelectedItems((current) => [...current, { product_id: '', quantity: 1 }]);

  const updateItem = (index, key, value) => {
    setSelectedItems((current) => current.map((item, currentIndex) => (currentIndex === index ? { ...item, [key]: value } : item)));
  };

  const onSubmit = async (values) => {
    const items = selectedItems.filter((item) => item.product_id).map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) }));

    if (!items.length) {
      toast.error('Ajoute au moins un plat');
      return;
    }

    await api.post('/server/orders', {
      table_id: Number(values.table_id),
      order_type: 'sur_place',
      nom: user?.nom || 'Serveur',
      prenom: user?.prenom || 'Salle',
      email: user?.email || 'server@example.com',
      telephone: user?.telephone || '+212600000000',
      notes: values.notes || null,
      items,
    });

    toast.success('Commande sur place creee');
    reset({ table_id: '', notes: '' });
    setSelectedItems([{ product_id: '', quantity: 1 }]);
    load();
  };

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Service salle" title="Commandes sur place" description="Creation rapide de commandes par table et suivi des commandes salle existantes." />
      <div className="grid gap-8 xl:grid-cols-[1.1fr_1fr]">
        <Panel title="Nouvelle commande" subtitle="Saisie rapide par table">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <select {...register('table_id', { required: true })} className="w-full rounded-2xl border p-3">
              <option value="">Choisir une table</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table {table.numero}
                </option>
              ))}
            </select>
            {selectedItems.map((item, index) => (
              <div key={`${index}-${item.product_id}`} className="grid gap-3 md:grid-cols-[1fr_120px]">
                <select value={item.product_id} onChange={(event) => updateItem(index, 'product_id', event.target.value)} className="rounded-2xl border p-3">
                  <option value="">Choisir un plat</option>
                  {availableProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} className="rounded-2xl border p-3" />
              </div>
            ))}
            <button type="button" onClick={addItem} className="rounded-full bg-stone-100 px-4 py-2 text-sm">
              Ajouter un plat
            </button>
            <textarea {...register('notes')} placeholder="Notes de table" className="min-h-24 w-full rounded-2xl border p-3" />
            <button className="rounded-full bg-charcoal px-5 py-3 text-sm text-cream">Creer la commande</button>
          </form>
        </Panel>
        <Panel title="Commandes salle" subtitle="Historique recent des tickets sur place">
          {loading ? <LoadingBlock label="Chargement des commandes salle..." /> : null}
          {!loading && orders.length === 0 ? (
            <EmptyBlock label="Aucune commande sur place." />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-charcoal/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">Commande #{order.id}</div>
                    <StatusPill tone={statusTone(order.order_status)}>{formatLabel(order.order_status)}</StatusPill>
                  </div>
                  <div className="mt-2 text-sm text-charcoal/65">Table {order.table?.numero || '-'}</div>
                  <div className="mt-2 text-sm text-charcoal/65">{formatMoney(order.total)}</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
