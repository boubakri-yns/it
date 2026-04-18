import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { addToCart, canUseCart } from '../../utils/cart';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cartVisible = canUseCart(user);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
  }, [id]);

  if (!product) return <div className="container-shell py-16">Chargement...</div>;

  return (
    <section className="container-shell py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <img src={product.image} alt={product.name} className="h-[480px] w-full rounded-[2rem] object-cover shadow-soft" />
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-olive">{product.category?.name}</p>
          <h1 className="mt-4 font-display text-5xl">{product.name}</h1>
          <p className="mt-6 text-lg text-charcoal/70">{product.description}</p>
          <div className="mt-6 text-3xl font-semibold text-tomato">{product.price} MAD</div>
          {cartVisible ? (
            <button
              onClick={() => {
                addToCart(product, 1, user);
                toast.success('Plat ajoute au panier');
                navigate('/paiement');
              }}
              className="mt-8 rounded-full bg-charcoal px-6 py-3 text-cream"
            >
              Ajouter au panier
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
