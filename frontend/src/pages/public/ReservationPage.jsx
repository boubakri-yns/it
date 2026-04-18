import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

function FieldError({ message }) {
  if (!message) return null;
  return <div className="mt-2 text-sm text-tomato">{message}</div>;
}

export default function ReservationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      table_id: '',
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      reservation_date: '',
      reservation_time: '',
      guest_count: 2,
      notes: '',
    },
  });

  const reservationDate = watch('reservation_date');
  const reservationTime = watch('reservation_time');
  const guestCount = watch('guest_count');

  useEffect(() => {
    reset((current) => ({
      ...current,
      nom: user?.nom || current.nom || '',
      prenom: user?.prenom || current.prenom || '',
      email: user?.email || current.email || '',
      telephone: user?.telephone || current.telephone || '',
    }));
  }, [reset, user]);

  useEffect(() => {
    setLoadingTables(true);
    api
      .get('/tables/available', {
        params: {
          reservation_date: reservationDate || undefined,
          reservation_time: reservationTime || undefined,
          guest_count: guestCount || undefined,
        },
      })
      .then(({ data }) => setTables(data))
      .catch(() => {
        setTables([]);
        toast.error('Impossible de charger les tables disponibles');
      })
      .finally(() => setLoadingTables(false));
  }, [guestCount, reservationDate, reservationTime]);

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);
      const { data } = await api.post('/reservations', values);
      toast.success(`Reservation enregistree pour la table ${data.table?.numero || ''}`.trim());
      reset({
        table_id: '',
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        email: user?.email || '',
        telephone: user?.telephone || '',
        reservation_date: '',
        reservation_time: '',
        guest_count: 2,
        notes: '',
      });

      const refreshed = await api.get('/tables/available');
      setTables(refreshed.data);
      if (user?.role === 'client') {
        navigate('/client/reservations');
      }
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      const firstError = apiErrors ? Object.values(apiErrors).flat()[0] : null;
      toast.error(firstError || error?.response?.data?.message || 'Reservation impossible');
    } finally {
      setSubmitting(false);
    }
  };

  const matchingTablesLabel = useMemo(() => {
    if (loadingTables) return 'Recherche des tables disponibles...';
    if (tables.length === 0) return 'Aucune table disponible pour ce creneau.';
    return `${tables.length} table(s) disponible(s) pour ce creneau.`;
  }, [loadingTables, tables.length]);

  return (
    <section className="container-shell py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_460px]">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-tomato">Reservation</p>
          <h1 className="mt-4 font-display text-5xl">Choisissez votre table et votre horaire.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-charcoal/70">
            Renseigne le nombre de personnes, la date et l heure. L application affiche ensuite seulement les tables au statut libre.
            Quand une reservation est validee, la table passe automatiquement en reservee.
          </p>

          <div className="mt-8 rounded-[2rem] border border-charcoal/10 bg-white p-6 shadow-soft">
            <div className="text-sm font-semibold text-charcoal">{matchingTablesLabel}</div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {tables.map((table) => (
                <div key={table.id} className="rounded-3xl border border-charcoal/10 bg-cream p-5">
                  <div className="font-semibold text-charcoal">Table {table.numero}</div>
                  <div className="mt-2 text-sm text-charcoal/70">{table.capacite} personnes</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-olive">Statut libre</div>
                </div>
              ))}
              {!loadingTables && tables.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-charcoal/15 bg-cream p-5 text-sm text-charcoal/65">
                  Essaie un autre horaire ou un autre nombre de personnes.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-[2rem] bg-white p-8 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <input
                {...register('reservation_date', { required: 'La date est requise' })}
                type="date"
                className="w-full rounded-2xl border p-3"
              />
              <FieldError message={errors.reservation_date?.message} />
            </div>
            <div>
              <input
                {...register('reservation_time', { required: 'L heure est requise' })}
                type="time"
                className="w-full rounded-2xl border p-3"
              />
              <FieldError message={errors.reservation_time?.message} />
            </div>
          </div>

          <div>
            <input
              {...register('guest_count', {
                required: 'Le nombre de personnes est requis',
                min: { value: 1, message: 'Minimum 1 personne' },
              })}
              type="number"
              min="1"
              placeholder="Nombre de personnes"
              className="w-full rounded-2xl border p-3"
            />
            <FieldError message={errors.guest_count?.message} />
          </div>

          <div>
            <select {...register('table_id', { required: 'Choisis une table' })} className="w-full rounded-2xl border p-3">
              <option value="">Choisir une table</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table {table.numero} - {table.capacite} pers.
                </option>
              ))}
            </select>
            <FieldError message={errors.table_id?.message} />
          </div>

          <input {...register('nom', { required: 'Le nom est requis' })} placeholder="Nom" className="w-full rounded-2xl border p-3" />
          <FieldError message={errors.nom?.message} />

          <input {...register('prenom', { required: 'Le prenom est requis' })} placeholder="Prenom" className="w-full rounded-2xl border p-3" />
          <FieldError message={errors.prenom?.message} />

          <input {...register('email', { required: 'L email est requis' })} type="email" placeholder="Email" className="w-full rounded-2xl border p-3" />
          <FieldError message={errors.email?.message} />

          <input
            {...register('telephone', { required: 'Le telephone est requis' })}
            placeholder="Telephone"
            className="w-full rounded-2xl border p-3"
          />
          <FieldError message={errors.telephone?.message} />

          <textarea {...register('notes')} placeholder="Notes" className="w-full rounded-2xl border p-3" rows="4" />

          <button disabled={submitting} className="w-full rounded-2xl bg-tomato px-5 py-3 text-white disabled:opacity-60">
            {submitting ? 'Enregistrement...' : 'Confirmer la reservation'}
          </button>
        </form>
      </div>
    </section>
  );
}
