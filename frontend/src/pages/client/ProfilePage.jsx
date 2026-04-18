import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { PageIntro, Panel, StatGrid } from '../../components/space/SpaceUI';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { register, handleSubmit } = useForm({
    values: {
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      telephone: user?.telephone || '',
    },
  });

  const onSubmit = async (values) => {
    await api.put('/my/profile', values);
    await refreshUser();
    toast.success('Profil mis a jour');
  };

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Espace client"
        title="Mon profil"
        description="Gere tes informations personnelles utilisees pour les commandes et reservations."
        actions={[
          <Link key="orders" to="/client/commandes" className="rounded-full border border-charcoal/12 bg-white px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-olive/40 hover:text-olive">
            Voir mes commandes
          </Link>,
        ]}
      />
      <StatGrid
        items={[
          { label: 'Nom', value: user?.nom || '-', note: 'Compte client' },
          { label: 'Prenom', value: user?.prenom || '-', note: 'Compte client' },
          { label: 'Telephone', value: user?.telephone || '-', note: 'Contact principal' },
          { label: 'Email', value: user?.email || '-', note: 'Connexion' },
        ]}
      />
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Lecture rapide" subtitle="Informations de reference du compte">
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-cream p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-tomato">Identite</div>
              <div className="mt-2 text-xl font-semibold text-charcoal">
                {user?.prenom} {user?.nom}
              </div>
              <div className="mt-1 text-sm text-charcoal/65">{user?.email}</div>
            </div>
            <div className="rounded-[1.5rem] border border-charcoal/10 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-tomato">Contact</div>
              <div className="mt-2 text-sm text-charcoal/70">
                {user?.telephone || 'Aucun numero enregistre pour le moment.'}
              </div>
            </div>
          </div>
        </Panel>
        <Panel title="Informations personnelles" subtitle="Modification du profil client">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Nom</label>
              <input {...register('nom')} className="w-full rounded-2xl border p-3" placeholder="Nom" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">Prenom</label>
              <input {...register('prenom')} className="w-full rounded-2xl border p-3" placeholder="Prenom" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-charcoal">Telephone</label>
              <input {...register('telephone')} className="w-full rounded-2xl border p-3" placeholder="Telephone" />
            </div>
            <div className="md:col-span-2">
              <button className="rounded-full bg-charcoal px-5 py-3 text-sm text-cream">Enregistrer les modifications</button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
