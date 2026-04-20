import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import brandLogo from '../../assets/logo-main.png';
import { siteContact } from '../../utils/siteMeta';

const menuLinks = [{ to: '/menu', label: 'Menu complet' }];

const serviceLinks = [
  { to: '/reservation', label: 'Reservation' },
  { to: '/contact', label: 'Contact' },
];

export default function SiteFooter() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = ({ email }) => {
    toast.success(`Adresse ${email} ajoutee a la newsletter.`);
    reset();
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-charcoal text-cream">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,164,92,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(192,57,43,0.22),_transparent_30%),linear-gradient(180deg,_rgba(31,27,24,0.96),_rgba(20,17,15,1))]" />
      <div className="container-shell relative py-16">
        <div className="grid gap-10 border-b border-white/10 pb-10 xl:grid-cols-[1.15fr_0.85fr_0.85fr_1.15fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src={brandLogo}
                alt="Italia logo"
                className="h-12 w-auto object-contain brightness-110 saturate-0"
                loading="lazy"
                decoding="async"
                draggable="false"
              />
              <div>
                <div className="font-display text-3xl uppercase tracking-[0.04em] text-white">Italia</div>
                <div className="text-xs uppercase tracking-[0.32em] text-gold/80">Ristorante</div>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-cream/72">
              L'authenticite italienne a votre table.
            </p>
          </div>

          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-gold">Navigation</div>
            <div className="mt-5 space-y-3">
              {menuLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block text-sm text-cream/78 transition hover:text-gold"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 text-sm uppercase tracking-[0.3em] text-gold">Services</div>
            <div className="mt-5 space-y-3">
              {serviceLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block text-sm text-cream/78 transition hover:text-gold"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-gold">Contact</div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-cream/78">
              <a href={siteContact.addressHref} target="_blank" rel="noreferrer" className="block transition hover:text-gold">
                {siteContact.addressLabel}
              </a>
              <a href={siteContact.phoneHref} className="block transition hover:text-gold">
                {siteContact.phoneLabel}
              </a>
              <a href={siteContact.emailHref} className="block transition hover:text-gold">
                {siteContact.email}
              </a>
              <div>{siteContact.openingHours}</div>
            </div>
          </div>

          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-gold">Newsletter</div>
            <p className="mt-5 max-w-md text-sm leading-7 text-cream/72">
              Abonnez-vous aux offres speciales et nouveautes du restaurant.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <input
                  {...register('email', {
                    required: "L'email est obligatoire.",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Entrez un email valide.',
                    },
                  })}
                  type="email"
                  placeholder="Votre email"
                  className="w-full rounded-full border border-white/12 bg-white px-5 py-3 text-sm text-charcoal outline-none transition focus:border-gold"
                />
                {errors.email ? <p className="mt-2 text-xs text-[#ffb4a9]">{errors.email.message}</p> : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-tomato px-5 py-3 text-sm font-semibold text-white transition hover:bg-tomato/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                S'abonner
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm text-cream/60 md:flex-row md:items-center md:justify-between">
          <div>© 2026 Italia Ristorante.</div>
          <div className="flex flex-wrap gap-5">
            <Link to="/a-propos" className="transition hover:text-gold">
              A propos
            </Link>
            <Link to="/contact" className="transition hover:text-gold">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
