import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { siteContact } from '../../utils/siteMeta';

const contactDetails = [
  {
    label: 'Telephone',
    value: siteContact.phoneLabel,
    href: siteContact.phoneHref,
    note: 'Appelez directement le restaurant.',
  },
  {
    label: 'Email',
    value: siteContact.email,
    href: siteContact.emailHref,
    note: 'Reservations, reclamations et demandes generales.',
  },
  {
    label: 'Adresse',
    value: siteContact.addressLabel,
    href: siteContact.addressHref,
    note: 'Vue mer, acces simple depuis le centre de Casablanca.',
  },
  {
    label: 'Horaires',
    value: siteContact.openingHours,
    href: null,
    note: 'Cuisine en continu midi et soir.',
  },
];

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      subject: 'Reclamation',
      message: '',
    },
  });

  const onSubmit = async (values) => {
    const subject = `[Italia] ${values.subject} - ${values.fullName}`;
    const body = [
      `Nom: ${values.fullName}`,
      `Email: ${values.email}`,
      `Telephone: ${values.phone || '-'}`,
      '',
      'Message:',
      values.message,
    ].join('\n');

    window.location.href = `mailto:${siteContact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.success('Votre message est pret a etre envoye.');
    reset();
  };

  return (
    <div className="bg-cream">
      <section className="relative overflow-hidden bg-charcoal py-20 text-cream">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,164,92,0.14),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(192,57,43,0.3),_transparent_34%),linear-gradient(135deg,_rgba(91,107,45,0.78),_rgba(31,27,24,0.98))]" />
        <div className="container-shell relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Contact</p>
            <h1 className="mt-6 max-w-3xl font-display text-5xl leading-tight md:text-6xl">
              Contactez Italia pour reserver, signaler un probleme ou joindre rapidement l'equipe.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-cream/78">
              Toutes les informations essentielles sont accessibles ici, avec un formulaire simple pour adresser vos
              reclamations ou demandes aux administrateurs.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {contactDetails.map((item) => (
              <article
                key={item.label}
                className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-soft backdrop-blur"
              >
                <div className="text-xs uppercase tracking-[0.35em] text-gold">{item.label}</div>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="mt-4 block font-display text-2xl leading-snug text-white transition hover:text-gold"
                  >
                    {item.value}
                  </a>
                ) : (
                  <div className="mt-4 font-display text-2xl leading-snug text-white">{item.value}</div>
                )}
                <p className="mt-3 text-sm leading-6 text-cream/70">{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell py-20">
        <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-soft">
            <div className="text-sm uppercase tracking-[0.35em] text-tomato">Reclamation & Contact</div>
            <h2 className="mt-4 font-display text-4xl text-charcoal">Ecrire aux administrateurs</h2>
            <p className="mt-4 text-charcoal/70">
              Utilisez ce formulaire pour signaler un souci de commande, une reservation, un paiement ou une demande
              generale. Le message sera prepare pour l'email admin.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-charcoal">Nom complet</span>
                  <input
                    {...register('fullName', { required: 'Le nom est obligatoire.' })}
                    className="w-full rounded-2xl border border-charcoal/12 bg-cream px-4 py-3 text-charcoal outline-none transition focus:border-olive"
                    placeholder="Votre nom"
                  />
                  {errors.fullName ? <span className="mt-2 block text-sm text-tomato">{errors.fullName.message}</span> : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-charcoal">Email</span>
                  <input
                    {...register('email', {
                      required: "L'email est obligatoire.",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'Entrez un email valide.',
                      },
                    })}
                    className="w-full rounded-2xl border border-charcoal/12 bg-cream px-4 py-3 text-charcoal outline-none transition focus:border-olive"
                    placeholder="nom@email.com"
                  />
                  {errors.email ? <span className="mt-2 block text-sm text-tomato">{errors.email.message}</span> : null}
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-[0.72fr_0.28fr]">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-charcoal">Objet</span>
                  <select
                    {...register('subject', { required: "L'objet est obligatoire." })}
                    className="w-full rounded-2xl border border-charcoal/12 bg-cream px-4 py-3 text-charcoal outline-none transition focus:border-olive"
                  >
                    <option value="Reclamation">Reclamation</option>
                    <option value="Reservation">Reservation</option>
                    <option value="Commande">Commande</option>
                    <option value="Paiement">Paiement</option>
                    <option value="Contact general">Contact general</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-charcoal">Telephone</span>
                  <input
                    {...register('phone')}
                    className="w-full rounded-2xl border border-charcoal/12 bg-cream px-4 py-3 text-charcoal outline-none transition focus:border-olive"
                    placeholder="05..."
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-charcoal">Votre message</span>
                <textarea
                  {...register('message', {
                    required: 'Le message est obligatoire.',
                    minLength: {
                      value: 12,
                      message: 'Ajoutez un peu plus de detail dans votre message.',
                    },
                  })}
                  rows="7"
                  className="w-full rounded-[1.6rem] border border-charcoal/12 bg-cream px-4 py-4 text-charcoal outline-none transition focus:border-olive"
                  placeholder="Expliquez clairement votre demande ou votre reclamation..."
                />
                {errors.message ? <span className="mt-2 block text-sm text-tomato">{errors.message.message}</span> : null}
              </label>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <p className="max-w-lg text-sm leading-6 text-charcoal/60">
                  En validant, votre logiciel mail s'ouvrira avec un message deja pre-rempli a destination de
                  l'administration.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-tomato px-6 py-3 text-sm font-semibold text-white transition hover:bg-tomato/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Envoyer le message
                </button>
              </div>
            </form>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-charcoal/10 bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-5">
              <div>
                <div className="text-sm uppercase tracking-[0.35em] text-tomato">Localisation</div>
                <h2 className="mt-2 font-display text-3xl text-charcoal">Italia Casablanca</h2>
              </div>
              <a
                href={siteContact.addressHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-charcoal/12 px-4 py-2 text-sm font-semibold text-charcoal transition hover:border-olive/40 hover:text-olive"
              >
                Ouvrir dans Maps
              </a>
            </div>

            <div className="relative h-[520px] overflow-hidden bg-charcoal">
              <iframe
                title="Italia Casablanca map"
                src="https://www.google.com/maps?q=Boulevard%20de%20la%20Corniche%2C%20Ain%20Diab%2C%20Casablanca%2C%20Maroc&z=15&output=embed"
                className="h-full w-full grayscale contrast-[1.05] brightness-[0.78]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(31,27,24,0.14),rgba(31,27,24,0.22))]" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
