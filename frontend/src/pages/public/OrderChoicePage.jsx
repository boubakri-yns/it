import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { canUseCart, getCart } from '../../utils/cart';

export default function OrderChoicePage() {
  const { user } = useAuth();
  const items = getCart(user);

  if (!canUseCart(user)) {
    return <Navigate to="/connexion" replace />;
  }

  if (items.length === 0) {
    return <Navigate to="/panier" replace />;
  }

  return (
    <section className="container-shell py-16">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-charcoal/10 bg-white p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.35em] text-olive">Commande</p>
        <h1 className="mt-4 font-display text-5xl">Produit ajoute a votre panier</h1>
        <p className="mt-5 text-base leading-7 text-charcoal/70">
          Choisissez la suite: garder cette commande comme brouillon dans le panier ou aller directement au paiement.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            to="/panier"
            className="rounded-[1.6rem] border border-charcoal/12 bg-cream p-6 transition hover:border-olive/40"
          >
            <div className="text-xl font-semibold text-charcoal">Voir le panier</div>
            <p className="mt-2 text-sm leading-6 text-charcoal/65">
              Conserver la commande en brouillon, modifier les quantites ou retirer des articles.
            </p>
          </Link>

          <Link
            to="/paiement"
            className="rounded-[1.6rem] bg-tomato p-6 text-white transition hover:bg-tomato/90"
          >
            <div className="text-xl font-semibold">Aller au paiement</div>
            <p className="mt-2 text-sm leading-6 text-white/85">
              Continuer tout de suite vers la validation et le paiement de votre commande.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
