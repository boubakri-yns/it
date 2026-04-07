import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { clearCart, getCart } from '../../utils/cart';

const stripePublishableKey = import.meta.env.VITE_STRIPE_KEY || '';
const stripeConfigured = Boolean(stripePublishableKey) && !stripePublishableKey.includes('your_key');
const stripePromise = stripeConfigured ? loadStripe(stripePublishableKey) : null;

function FieldError({ message }) {
  if (!message) return null;
  return <div className="text-sm text-tomato">{message}</div>;
}

function LocationPicker({ onSelect, disabled }) {
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (!mapElementRef.current || mapInstanceRef.current) return;

    const map = L.map(mapElementRef.current, {
      center: [33.5731, -7.5898],
      zoom: 12,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    map.on('click', async (event) => {
      const location = { lat: event.latlng.lat, lng: event.latlng.lng };
      setLoadingLocation(true);
      try {
        const address = await reverseGeocode(location.lat, location.lng);
        updateMarker(map, location);
        onSelect({ ...location, address });
      } catch {
        updateMarker(map, location);
        onSelect({ ...location, address: '' });
        toast.error('Position choisie, mais adresse non recuperee automatiquement');
      } finally {
        setLoadingLocation(false);
      }
    });

    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onSelect]);

  const updateMarker = (map, location) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lng]);
      return;
    }

    markerRef.current = L.circleMarker([location.lat, location.lng], {
      radius: 9,
      color: '#c44536',
      weight: 3,
      fillColor: '#c44536',
      fillOpacity: 0.35,
    }).addTo(map);
  };

  const reverseGeocode = async (lat, lng) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!response.ok) throw new Error('reverse_geocode_failed');
    const data = await response.json();
    return data?.display_name || '';
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('La geolocalisation n est pas disponible sur cet appareil');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        try {
          const address = await reverseGeocode(location.lat, location.lng);
          const map = mapInstanceRef.current;
          if (map) {
            map.setView([location.lat, location.lng], 15);
            updateMarker(map, location);
          }
          onSelect({ ...location, address });
          toast.success('Position actuelle selectionnee');
        } catch {
          onSelect({ ...location, address: '' });
          toast.error('Position ajoutee, mais adresse non recuperee automatiquement');
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        setLoadingLocation(false);
        toast.error('Impossible de recuperer votre position');
      },
    );
  };

  return (
    <div className={`rounded-[1.6rem] border border-charcoal/10 bg-cream p-4 ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-semibold text-charcoal">Choisir la localisation</div>
          <p className="mt-1 text-sm text-charcoal/65">
            Clique sur la carte ou utilise ta position actuelle pour remplir l adresse.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled || loadingLocation}
          onClick={useCurrentLocation}
          className="rounded-2xl border border-olive px-5 py-3 text-sm font-semibold text-olive disabled:opacity-60"
        >
          {loadingLocation ? 'Chargement...' : 'Utiliser ma localisation'}
        </button>
      </div>
      <div ref={mapElementRef} className="mt-4 h-72 rounded-[1.4rem] border border-charcoal/10" />
    </div>
  );
}

function CheckoutForm({ clientSecret, stripeReady, total }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [orderType, setOrderType] = useState('livraison');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      order_type: 'livraison',
      address: '',
      city: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    setValue('nom', user.nom || '');
    setValue('prenom', user.prenom || '');
    setValue('email', user.email || '');
    setValue('telephone', user.telephone || '');
  }, [setValue, user]);

  const submitOrder = async (values) => {
    const cart = getCart();
    const { data } = await api.post('/orders', {
      ...values,
      items: cart.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
      payment_confirmed: true,
      stripe_payment_intent_id: clientSecret ? clientSecret.split('_secret')[0] : 'pi_local_demo',
    });

    clearCart();
    toast.success('Commande payee et enregistree');
    navigate(`/client/commandes${data?.id ? `?highlight=${data.id}` : ''}`);
  };

  const onSubmit = async (values) => {
    try {
      setSubmitting(true);

      if (!user || user.role !== 'client') {
        toast.error('Connecte-toi avec un compte client pour finaliser la commande');
        navigate('/connexion');
        return;
      }

      if (!stripeReady) {
        await submitOrder(values);
        return;
      }

      if (!stripe || !elements) {
        toast.error('Le module de paiement Stripe n est pas pret');
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Paiement Stripe refuse');
        return;
      }

      await submitOrder(values);
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      const firstError = apiErrors ? Object.values(apiErrors).flat()[0] : null;
      toast.error(firstError || error?.response?.data?.message || 'Le paiement ou la commande a echoue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocationSelect = ({ lat, lng, address }) => {
    setValue('latitude', String(lat));
    setValue('longitude', String(lng));
    if (address) {
      setValue('address', address);
      const cityPart = address.split(',').map((part) => part.trim()).find((part) => part.length > 0);
      if (cityPart) setValue('city', cityPart);
    }
  };

  const isDelivery = orderType === 'livraison';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-[2rem] bg-white p-8 shadow-soft">
      <div className="rounded-[1.5rem] border border-charcoal/10 bg-cream p-4 text-sm text-charcoal/75">
        <div className="font-semibold text-charcoal">Montant a payer</div>
        <div className="mt-2 text-2xl font-semibold text-charcoal">{total.toFixed(2)} EUR</div>
      </div>

      {!user || user.role !== 'client' ? (
        <div className="rounded-[1.5rem] border border-tomato/20 bg-tomato/5 p-4 text-sm text-charcoal/75">
          Le paiement est reserve aux comptes client. Connecte-toi avant de valider ta commande.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <input
            {...register('nom', { required: 'Le nom est requis' })}
            placeholder="Nom"
            className="w-full rounded-2xl border p-3"
          />
          <FieldError message={errors.nom?.message} />
        </div>
        <div>
          <input
            {...register('prenom', { required: 'Le prenom est requis' })}
            placeholder="Prenom"
            className="w-full rounded-2xl border p-3"
          />
          <FieldError message={errors.prenom?.message} />
        </div>
      </div>

      <div>
        <input
          {...register('email', { required: 'L email est requis' })}
          type="email"
          placeholder="Email"
          className="w-full rounded-2xl border p-3"
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <input
          {...register('telephone', { required: 'Le telephone est requis' })}
          placeholder="Telephone"
          className="w-full rounded-2xl border p-3"
        />
        <FieldError message={errors.telephone?.message} />
      </div>

      <div>
        <select
          {...register('order_type', { required: true })}
          className="w-full rounded-2xl border p-3"
          onChange={(event) => setOrderType(event.target.value)}
        >
          <option value="livraison">Livraison</option>
          <option value="a_emporter">A emporter</option>
          <option value="sur_place">Sur place</option>
        </select>
      </div>

      <div>
        <input
          {...register('address', {
            validate: (value) => (!isDelivery || value?.trim() ? true : 'L adresse est requise pour une livraison'),
          })}
          placeholder="Choisis ta localisation ou saisis ton adresse complete"
          className="w-full rounded-2xl border p-3"
        />
        <FieldError message={errors.address?.message} />
      </div>

      <div>
        <input
          {...register('city', {
            validate: (value) => (!isDelivery || value?.trim() ? true : 'La ville est requise pour une livraison'),
          })}
          placeholder="Ville"
          className="w-full rounded-2xl border p-3"
        />
        <FieldError message={errors.city?.message} />
      </div>

      {isDelivery ? <LocationPicker onSelect={handleLocationSelect} disabled={submitting} /> : null}

      <div>
        <textarea {...register('notes')} placeholder="Notes de livraison" className="w-full rounded-2xl border p-3" rows="3" />
      </div>

      <input type="hidden" {...register('latitude')} />
      <input type="hidden" {...register('longitude')} />

      {stripeReady ? (
        <div className="rounded-[1.5rem] border p-4">
          <PaymentElement />
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-tomato/20 bg-tomato/5 p-4 text-sm text-charcoal/70">
          Stripe n est pas configure dans cet environnement. Le paiement fonctionne ici en mode demonstration pour te permettre de tester tout le flow jusqu a la creation de commande.
        </div>
      )}

      <button
        disabled={submitting || (stripeReady && !stripe)}
        className="rounded-2xl bg-tomato px-5 py-3 text-white disabled:opacity-60"
      >
        {submitting ? 'Traitement...' : 'Payer et commander'}
      </button>

      <p className="text-sm text-charcoal/60">
        Si vous n etes pas connecte en client, <Link to="/connexion" className="text-tomato">connectez-vous avant de commander</Link>.
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState('');
  const [paymentMode, setPaymentMode] = useState('loading');
  const cartItems = getCart();
  const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + 4.5, [cartItems]);

  useEffect(() => {
    if (total <= 0) {
      setPaymentMode('empty');
      return;
    }

    if (!stripeConfigured) {
      setPaymentMode('mock');
      return;
    }

    api
      .post('/checkout/create-payment-intent', { amount: total })
      .then(({ data }) => {
        if (data?.client_secret) {
          setClientSecret(data.client_secret);
          setPaymentMode('stripe');
        } else {
          setPaymentMode('mock');
        }
      })
      .catch(() => setPaymentMode('mock'));
  }, [total]);

  if (paymentMode === 'loading') return <div className="container-shell py-16">Initialisation du paiement...</div>;
  if (paymentMode === 'empty') return <div className="container-shell py-16">Votre panier est vide.</div>;

  return (
    <section className="container-shell py-16">
      <h1 className="font-display text-5xl">Paiement</h1>
      <p className="mt-4 text-charcoal/70">
        {paymentMode === 'stripe'
          ? `Paiement Stripe actif. Total: ${total.toFixed(2)} EUR`
          : `Mode demonstration actif. Total: ${total.toFixed(2)} EUR`}
      </p>
      {user?.role === 'client' ? null : (
        <div className="mt-4 rounded-[1.5rem] border border-tomato/20 bg-tomato/5 p-4 text-sm text-charcoal/75">
          Connecte-toi avec un compte client pour finaliser la commande et enregistrer correctement le paiement.
        </div>
      )}
      <div className="mt-10">
        {paymentMode === 'stripe' && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm clientSecret={clientSecret} stripeReady total={total} />
          </Elements>
        ) : (
          <CheckoutForm clientSecret={null} stripeReady={false} total={total} />
        )}
      </div>
    </section>
  );
}
