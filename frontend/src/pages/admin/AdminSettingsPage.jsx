import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingBlock, PageIntro, Panel } from '../../components/space/SpaceUI';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => setSettings(data));
  }, []);

  const updateValue = (index, value) => {
    const next = [...settings];
    next[index] = { ...next[index], value };
    setSettings(next);
  };

  const save = async () => {
    const { data } = await api.put('/admin/settings', { settings });
    setSettings(data);
    toast.success('Parametres sauvegardes');
  };

  if (!settings) {
    return <LoadingBlock label="Chargement des parametres..." />;
  }

  return (
    <div className="space-y-8">
      <PageIntro eyebrow="Administration" title="Parametres" description="Horaires, regles de livraison et configuration Stripe." />
      <Panel title="Configuration generale" subtitle="Edition des reglages">
        <div className="grid gap-4">
          {settings.map((setting, index) => (
            <div key={setting.id || setting.key} className="rounded-[1.5rem] border border-charcoal/10 p-5">
              <div className="text-sm uppercase tracking-[0.3em] text-tomato">{setting.group}</div>
              <div className="mt-2 font-semibold">{setting.key}</div>
              <input value={setting.value || ''} onChange={(event) => updateValue(index, event.target.value)} className="mt-4 w-full rounded-2xl border p-3" />
            </div>
          ))}
        </div>
      </Panel>
      <button onClick={save} className="rounded-full bg-charcoal px-6 py-3 text-cream">
        Enregistrer
      </button>
    </div>
  );
}
