import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCart, removeFromCart, updateCartQuantity } from '../../utils/cart';

export default function CartPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getCart());
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const updateQty = (productId, quantity) => {
    setItems(updateCartQuantity(productId, quantity));
  };

  const removeItem = (productId) => {
    setItems(removeFromCart(productId));
  };

  return (
    <section className="container-shell py-16">
      <h1 className="font-display text-5xl">Panier</h1>
      <div className="mt-10 grid gap-6">
        {items.map((item) => (
          <div key={item.product_id} className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-soft md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold">{item.name}</div>
              <div className="text-sm text-charcoal/70">{item.price} EUR</div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="rounded-full border px-4 py-2">
                -
              </button>
              <div className="w-10 text-center font-semibold">{item.quantity}</div>
              <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="rounded-full border px-4 py-2">
                +
              </button>
              <button onClick={() => removeItem(item.product_id)} className="rounded-full bg-tomato px-4 py-2 text-white">
                Retirer
              </button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 ? <div className="mt-10 rounded-[2rem] bg-white p-8 shadow-soft">Votre panier est vide.</div> : null}
      <div className="mt-10 flex items-center justify-between rounded-[2rem] bg-charcoal p-8 text-cream">
        <div>Total</div>
        <div className="text-3xl font-semibold">{total.toFixed(2)} EUR</div>
      </div>
      <Link to="/paiement" className="mt-6 inline-flex rounded-full bg-tomato px-6 py-3 text-white">
        Passer au paiement
      </Link>
    </section>
  );
}
