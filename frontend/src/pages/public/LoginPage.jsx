import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

const DEMO_ACCOUNTS = [
  { label: 'Client', email: 'client1@example.com', password: 'password' },
  { label: 'Cuisinier', email: 'cook1@example.com', password: 'password' },
  { label: 'Livreur', email: 'driver1@example.com', password: 'password' },
  { label: 'Serveur', email: 'waiter1@example.com', password: 'password' },
  { label: 'Admin', email: 'admin@example.com', password: 'password' },
];

export default function LoginPage() {
  const { register, handleSubmit, setValue } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (values) => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const user = await login(values);
      const destination = '/';
      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Connexion impossible');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-shell py-16">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto max-w-2xl rounded-[2rem] border border-charcoal/10 bg-white p-7 shadow-soft sm:p-8"
      >
        <h1 className="font-display text-4xl uppercase tracking-[0.06em] text-charcoal">Connexion</h1>
        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-tomato/20 bg-tomato/5 p-4 text-sm text-tomato">{errorMessage}</div>
        ) : null}

        <div className="mt-6 space-y-3">
          <input
            {...register('email')}
            type="email"
            placeholder="Email"
            className="w-full rounded-[1.2rem] border border-charcoal/12 bg-cream px-4 py-4 text-charcoal outline-none transition placeholder:text-charcoal/45 focus:border-tomato"
          />
          <input
            {...register('password')}
            type="password"
            placeholder="Mot de passe"
            className="w-full rounded-[1.2rem] border border-charcoal/12 bg-cream px-4 py-4 text-charcoal outline-none transition placeholder:text-charcoal/45 focus:border-tomato"
          />
        </div>

        <button
          disabled={submitting}
          className="mt-5 w-full rounded-[1.2rem] bg-tomato px-5 py-4 text-sm font-semibold uppercase tracking-[0.04em] text-white transition hover:bg-tomato/90 disabled:opacity-60"
        >
          {submitting ? 'Connexion...' : 'Se connecter'}
        </button>

        <aside className="mt-6 rounded-[1.6rem] border border-charcoal/10 bg-cream p-4 sm:p-5">
          <div className="flex flex-col gap-2 text-sm text-charcoal sm:flex-row sm:items-center sm:justify-between">
            <div className="font-semibold uppercase tracking-[0.04em]">Comptes disponibles</div>
            <div className="text-charcoal/65">
              Mot de passe: <strong className="text-charcoal">password</strong>
            </div>
          </div>

          <div className="mt-4 space-y-3 rounded-[1.3rem] border border-charcoal/10 bg-white p-3">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setValue('email', account.email);
                  setValue('password', account.password);
                }}
                className="flex w-full items-center justify-between gap-3 rounded-[1rem] border border-charcoal/10 bg-white px-4 py-3 text-left transition hover:border-tomato/40 hover:bg-tomato/5"
              >
                <span className="font-semibold text-charcoal">{account.label}</span>
                <span className="text-sm text-charcoal/75">{account.email}</span>
              </button>
            ))}
          </div>
        </aside>

        <Link to="/inscription" className="mt-6 block text-sm text-charcoal/75">
          Pas de compte ? <span className="font-semibold text-tomato">Creez-en un</span>
        </Link>
      </form>
    </section>
  );
}
