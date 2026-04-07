const LEGACY_CART_KEY = 'cart_items';
const CART_EVENT = 'cart:changed';

function getActiveCartKey() {
  const rawUser = localStorage.getItem('auth_user');

  if (!rawUser) {
    return 'cart_items_guest';
  }

  try {
    const user = JSON.parse(rawUser);
    if (user?.id) {
      return `cart_items_user_${user.id}`;
    }
  } catch {
    // Ignore malformed auth_user and fallback to guest cart.
  }

  return 'cart_items_guest';
}

function isGuestCartKey(key) {
  return key === 'cart_items_guest';
}

function emitCartChange() {
  window.dispatchEvent(new Event(CART_EVENT));
}

export function getCart() {
  const activeKey = getActiveCartKey();
  const activeCart = localStorage.getItem(activeKey);
  if (activeCart) {
    return JSON.parse(activeCart);
  }

  if (isGuestCartKey(activeKey)) {
    return JSON.parse(localStorage.getItem(LEGACY_CART_KEY) || '[]');
  }

  return [];
}

export function saveCart(items) {
  localStorage.setItem(getActiveCartKey(), JSON.stringify(items));
  emitCartChange();
}

export function addToCart(product, quantity = 1) {
  const items = getCart();
  const existing = items.find((item) => item.product_id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
    });
  }
  saveCart(items);
}

export function updateCartQuantity(productId, quantity) {
  const normalized = Math.max(1, Number(quantity) || 1);
  const next = getCart().map((item) => (item.product_id === productId ? { ...item, quantity: normalized } : item));
  saveCart(next);
  return next;
}

export function removeFromCart(productId) {
  const next = getCart().filter((item) => item.product_id !== productId);
  saveCart(next);
  return next;
}

export function clearCart() {
  saveCart([]);
}

export function getCartEventName() {
  return CART_EVENT;
}
