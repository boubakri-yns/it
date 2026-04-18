import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { canUseCart, clearCart, getCart, getCartEventName } from '../../utils/cart';

const stripePublishableKey = import.meta.env.VITE_STRIPE_KEY || '';
const stripeConfigured = Boolean(stripePublishableKey) && !stripePublishableKey.includes('your_key');
const stripePromise = stripeConfigured ? loadStripe(stripePublishableKey) : null;
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f1b18',
      '::placeholder': {
        color: 'rgba(31, 27, 24, 0.45)',
      },
    },
    invalid: {
      color: '#c44536',
    },
  },
};

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

function CheckoutForm({
  clientSecret,
  stripeReady,
  total,
  orderType,
  setOrderType,
  paymentMethod,
  setPaymentMethod,
  showOnlinePaymentFields,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
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
      order_type: orderType,
      address: '',
      city: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    setValue('nom', user.nom || '');
    setValue('prenom', user.prenom || '');
    setValue('email', user.email || '');
    setValue('telephone', user.telephone || '');
    setValue('order_type', orderType);
  }, [orderType, setValue, user]);

  useEffect(() => {
    if (orderType === 'livraison') return;

    setValue('address', '');
    setValue('city', '');
    setValue('latitude', '');
    setValue('longitude', '');
  }, [orderType, setValue]);

  const submitOrder = async (values, options = {}) => {
    const cart = getCart(user);
    const { data } = await api.post('/orders', {
      ...values,
      payment_method: options.paymentMethod,
      items: cart.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
      payment_confirmed: options.paymentConfirmed ?? true,
      stripe_payment_intent_id: options.stripePaymentIntentId ?? null,
    });

    clearCart(user);
    toast.success(options.successMessage || 'Commande payee et enregistree');
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

      if (orderType === 'livraison' && paymentMethod === 'cash_on_delivery') {
        await submitOrder(values, {
          paymentMethod: 'cash_on_delivery',
          paymentConfirmed: false,
          stripePaymentIntentId: null,
          successMessage: 'Commande enregistree. Paiement a la livraison.',
        });
        return;
      }

      const stripePaymentIntentId = clientSecret ? clientSecret.split('_secret')[0] : 'pi_local_demo';

      if (!showOnlinePaymentFields || !stripeReady) {
        await submitOrder(values, {
          paymentMethod: 'stripe',
          paymentConfirmed: true,
          stripePaymentIntentId,
        });
        return;
      }

      if (!stripe || !elements) {
        toast.error('Le module de paiement Stripe n est pas pret');
        return;
      }

      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        toast.error('Le champ carte Stripe est indisponible');
        return;
      }

      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${values.prenom} ${values.nom}`.trim(),
            email: values.email,
            phone: values.telephone,
            address: {
              city: values.city || undefined,
              line1: values.address || undefined,
            },
          },
        },
      });

      if (error) {
        toast.error(error.message || 'Paiement Stripe refuse');
        return;
      }

      await submitOrder(values, {
        paymentMethod: 'stripe',
        paymentConfirmed: true,
        stripePaymentIntentId,
      });
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
        <div className="mt-2 text-2xl font-semibold text-charcoal">{total.toFixed(2)} MAD</div>
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
          onChange={(event) => {
            setOrderType(event.target.value);
            setValue('order_type', event.target.value);
          }}
        >
          <option value="livraison">Livraison</option>
          <option value="a_emporter">A emporter</option>
          <option value="sur_place">Sur place</option>
        </select>
      </div>

      {orderType === 'livraison' ? (
        <div className="rounded-[1.5rem] border border-charcoal/10 bg-cream p-4">
          <div className="font-semibold text-charcoal">Mode de paiement</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('online')}
              className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${
                paymentMethod === 'online'
                  ? 'border-tomato bg-tomato/8 text-tomato'
                  : 'border-charcoal/10 bg-white text-charcoal hover:border-olive/35'
              }`}
            >
              <div className="font-semibold">Paiement en ligne</div>
              <div className="mt-1 text-sm text-current/80">Payer maintenant puis finaliser la livraison.</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('cash_on_delivery')}
              className={`rounded-[1.3rem] border px-4 py-4 text-left transition ${
                paymentMethod === 'cash_on_delivery'
                  ? 'border-tomato bg-tomato/8 text-tomato'
                  : 'border-charcoal/10 bg-white text-charcoal hover:border-olive/35'
              }`}
            >
              <div className="font-semibold">Paiement a la livraison</div>
              <div className="mt-1 text-sm text-current/80">Le client paie apres l arrivee du livreur.</div>
            </button>
          </div>
          {paymentMethod === 'cash_on_delivery' ? (
            <div className="mt-4 rounded-[1.2rem] border border-olive/20 bg-olive/5 p-4 text-sm text-charcoal/75">
              Le paiement en ligne est desactive pour cette commande. Le client paiera apres l arrivee du livreur.
            </div>
          ) : null}
        </div>
      ) : null}

      {isDelivery ? (
        <>
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

          <LocationPicker onSelect={handleLocationSelect} disabled={submitting} />
        </>
      ) : null}

      <input type="hidden" {...register('latitude')} />
      <input type="hidden" {...register('longitude')} />

      {showOnlinePaymentFields && stripeReady ? (
        <div className="rounded-[1.5rem] border border-charcoal/10 bg-white p-5">
          <div className="font-semibold text-charcoal">Carte bancaire</div>
          <p className="mt-2 text-sm text-charcoal/65">
            Test Stripe simple. Utilise la carte <strong>4242 4242 4242 4242</strong>, une date future, n importe quel CVC et n importe quel code postal.
          </p>
          <div className="mt-4 rounded-[1rem] border border-charcoal/12 bg-cream px-4 py-4">
            <CardElement options={cardElementOptions} />
          </div>
        </div>
      ) : showOnlinePaymentFields ? (
        <div className="rounded-[1.5rem] border border-tomato/20 bg-tomato/5 p-4 text-sm text-charcoal/70">
          Stripe n est pas configure dans cet environnement. Le paiement fonctionne ici en mode demonstration pour te permettre de tester tout le flow jusqu a la creation de commande.
        </div>
      ) : null}

      <button
        disabled={submitting || (showOnlinePaymentFields && stripeReady && !stripe)}
        className="rounded-2xl bg-tomato px-5 py-3 text-white disabled:opacity-60"
      >
        {submitting
          ? 'Traitement...'
          : orderType === 'livraison' && paymentMethod === 'cash_on_delivery'
            ? 'Commander et payer a la livraison'
            : 'Payer et commander'}
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
  const [cartItems, setCartItems] = useState(() => getCart(user));
  const [orderType, setOrderType] = useState('livraison');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const total = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return subtotal + (cartItems.length > 0 ? 50 : 0);
  }, [cartItems]);
  const showOnlinePaymentFields = orderType !== 'livraison' || paymentMethod === 'online';

  useEffect(() => {
    const syncCart = () => {
      setCartItems(getCart(user));
    };

    syncCart();
    window.addEventListener(getCartEventName(), syncCart);

    return () => {
      window.removeEventListener(getCartEventName(), syncCart);
    };
  }, [user]);

  useEffect(() => {
    if (!canUseCart(user)) {
      setPaymentMode('empty');
      return;
    }

    if (total <= 0) {
      setPaymentMode('empty');
      return;
    }

    if (!showOnlinePaymentFields) {
      setClientSecret('');
      setPaymentMode('cash_on_delivery');
      return;
    }

    if (!stripeConfigured) {
      setClientSecret('');
      setPaymentMode('mock');
      return;
    }

    setPaymentMode('loading');
    api
      .post('/checkout/create-payment-intent', { amount: total, currency: 'mad' })
      .then(({ data }) => {
        if (data?.client_secret) {
          setClientSecret(data.client_secret);
          setPaymentMode('stripe');
        } else {
          setPaymentMode('mock');
        }
      })
      .catch(() => setPaymentMode('mock'));
  }, [paymentMethod, showOnlinePaymentFields, total, user]);

  if (!canUseCart(user)) {
    return <div className="container-shell py-16">Le paiement est reserve aux clients connectes.</div>;
  }

  if (paymentMode === 'loading') return <div className="container-shell py-16">Initialisation du paiement...</div>;
  if (paymentMode === 'empty') return <div className="container-shell py-16">Votre panier est vide.</div>;

  return (
    <section className="container-shell py-16">
      <h1 className="font-display text-5xl">Paiement</h1>
      <p className="mt-4 text-charcoal/70">
        {paymentMode === 'cash_on_delivery'
          ? `Paiement a la livraison. Total: ${total.toFixed(2)} MAD`
          : paymentMode === 'stripe'
          ? `Paiement Stripe actif. Total: ${total.toFixed(2)} MAD`
          : `Mode demonstration actif. Total: ${total.toFixed(2)} MAD`}
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          to="/panier"
          className="inline-flex rounded-full border border-charcoal/15 bg-white px-6 py-3 text-sm font-semibold text-charcoal transition hover:border-olive/40 hover:text-olive"
        >
          Garder dans le panier
        </Link>
        <Link
          to="/menu"
          className="inline-flex rounded-full border border-charcoal/15 bg-cream px-6 py-3 text-sm font-semibold text-charcoal transition hover:border-olive/40 hover:text-olive"
        >
          Ajouter d autres plats
        </Link>
      </div>
      {user?.role === 'client' ? null : (
        <div className="mt-4 rounded-[1.5rem] border border-tomato/20 bg-tomato/5 p-4 text-sm text-charcoal/75">
          Connecte-toi avec un compte client pour finaliser la commande et enregistrer correctement le paiement.
        </div>
      )}
      <div className="mt-10">
        <Elements stripe={stripePromise || null}>
          <CheckoutForm
            clientSecret={paymentMode === 'stripe' ? clientSecret : null}
            stripeReady={paymentMode === 'stripe'}
            total={total}
            orderType={orderType}
            setOrderType={setOrderType}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            showOnlinePaymentFields={showOnlinePaymentFields}
          />
        </Elements>
      </div>
    </section>
  );
}
