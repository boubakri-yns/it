import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { EmptyBlock, LoadingBlock, PageIntro, Panel, StatusPill } from '../../components/space/SpaceUI';

export default function AdminUsersPage() {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { role: 'client', is_active: true } });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/admin/users');
    setUsers(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (values) => {
    await api.post('/admin/users', values);
    toast.success('Utilisateur cree');
    reset({ role: 'client', is_active: true });
    load();
  };

  const toggleActive = async (user) => {
    await api.put(`/admin/users/${user.id}`, { is_active: !user.is_active });
    load();
  };

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Administration" title="CRUD utilisateurs" description="Creation et gestion des comptes clients et des comptes acteurs." />
      <div className="grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="Nouvel utilisateur" subtitle="Creation rapide de compte">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('prenom', { required: true })} placeholder="Prenom" className="w-full rounded-2xl border p-3" />
            <input {...register('nom', { required: true })} placeholder="Nom" className="w-full rounded-2xl border p-3" />
            <input {...register('email', { required: true })} placeholder="Email" type="email" className="w-full rounded-2xl border p-3" />
            <input {...register('telephone')} placeholder="Telephone" className="w-full rounded-2xl border p-3" />
            <input {...register('password', { required: true })} placeholder="Mot de passe" type="password" className="w-full rounded-2xl border p-3" />
            <select {...register('role')} className="w-full rounded-2xl border p-3">
              <option value="client">Client</option>
              <option value="cook">Cook</option>
              <option value="delivery">Delivery</option>
              <option value="server">Server</option>
              <option value="admin">Admin</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('is_active')} />
              Actif
            </label>
            <button className="rounded-full bg-charcoal px-5 py-3 text-sm text-cream">Creer</button>
          </form>
        </Panel>
        <Panel title="Annuaire" subtitle="Comptes existants">
          {loading ? <LoadingBlock label="Chargement des utilisateurs..." /> : null}
          {!loading && users.length === 0 ? (
            <EmptyBlock label="Aucun utilisateur." />
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-charcoal/10 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold">
                      {user.prenom} {user.nom}
                    </div>
                    <div className="mt-1 text-sm text-charcoal/65">
                      {user.email} - {user.role}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill tone={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'Actif' : 'Inactif'}</StatusPill>
                    <button onClick={() => toggleActive(user)} className="rounded-full bg-stone-100 px-4 py-2 text-sm">
                      Basculer
                    </button>
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
