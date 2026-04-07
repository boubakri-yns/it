import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (values) => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      await signup({ ...values, password_confirmation: values.password });
      navigate('/client/profil', { replace: true });
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Inscription impossible');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-shell py-16">
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg space-y-4 rounded-[2rem] bg-white p-8 shadow-soft">
        <h1 className="font-display text-4xl">Inscription</h1>
        {errorMessage ? (
          <div className="rounded-2xl border border-tomato/20 bg-tomato/5 p-4 text-sm text-tomato">{errorMessage}</div>
        ) : null}
        <input {...register('nom')} placeholder="Nom" className="w-full rounded-2xl border p-3" />
        <input {...register('prenom')} placeholder="Prenom" className="w-full rounded-2xl border p-3" />
        <input {...register('email')} type="email" placeholder="Email" className="w-full rounded-2xl border p-3" />
        <input {...register('telephone')} placeholder="Telephone" className="w-full rounded-2xl border p-3" />
        <input {...register('password')} type="password" placeholder="Mot de passe" className="w-full rounded-2xl border p-3" />
        <button disabled={submitting} className="w-full rounded-2xl bg-tomato px-5 py-3 text-white disabled:opacity-60">
          {submitting ? 'Creation...' : 'Creer mon compte'}
        </button>
      </form>
    </section>
  );
}
