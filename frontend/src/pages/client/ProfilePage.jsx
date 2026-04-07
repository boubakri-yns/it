import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
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
      <PageIntro eyebrow="Espace client" title="Mon profil" description="Gere tes informations personnelles utilisees pour les commandes et reservations." />
      <StatGrid
        items={[
          { label: 'Nom', value: user?.nom || '-', note: 'Compte client' },
          { label: 'Prenom', value: user?.prenom || '-', note: 'Compte client' },
          { label: 'Telephone', value: user?.telephone || '-', note: 'Contact principal' },
          { label: 'Email', value: user?.email || '-', note: 'Connexion' },
        ]}
      />
      <Panel title="Informations personnelles" subtitle="Modification du profil client">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
          <input {...register('nom')} className="w-full rounded-2xl border p-3" placeholder="Nom" />
          <input {...register('prenom')} className="w-full rounded-2xl border p-3" placeholder="Prenom" />
          <input {...register('telephone')} className="w-full rounded-2xl border p-3" placeholder="Telephone" />
          <button className="rounded-full bg-charcoal px-5 py-3 text-sm text-cream">Enregistrer</button>
        </form>
      </Panel>
    </div>
  );
}
