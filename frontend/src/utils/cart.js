const LEGACY_CART_KEY = 'cart_items';
const GUEST_CART_KEY = 'cart_items_guest';
const CART_EVENT = 'cart:changed';

function readStoredUser() {
  const rawUser = localStorage.getItem('auth_user');

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function canUseCart(user = readStoredUser()) {
  return Boolean(user?.id) && user?.role === 'client';
}

function getActiveCartKey(user = readStoredUser()) {
  const activeUser = user ?? readStoredUser();

  if (!canUseCart(activeUser)) {
    return null;
  }

  return `cart_items_user_${activeUser.id}`;
}

function emitCartChange() {
  window.dispatchEvent(new Event(CART_EVENT));
}

function readCartItems(key) {
  if (!key) {
    return [];
  }

  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function cleanupLegacyCartStorage() {
  localStorage.removeItem(LEGACY_CART_KEY);
  localStorage.removeItem(GUEST_CART_KEY);
}

export function notifyCartContextChanged() {
  cleanupLegacyCartStorage();
  emitCartChange();
}

export function getCart(user) {
  return readCartItems(getActiveCartKey(user));
}

export function saveCart(items, user) {
  const activeKey = getActiveCartKey(user);

  if (!activeKey) {
    return [];
  }

  localStorage.setItem(activeKey, JSON.stringify(items));
  emitCartChange();

  return items;
}

export function addToCart(product, quantity = 1, user) {
  const activeKey = getActiveCartKey(user);

  if (!activeKey) {
    return null;
  }

  const items = readCartItems(activeKey);
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

  return saveCart(items, user);
}

export function updateCartQuantity(productId, quantity, user) {
  const normalized = Math.max(1, Number(quantity) || 1);
  const next = getCart(user).map((item) => (item.product_id === productId ? { ...item, quantity: normalized } : item));
  saveCart(next, user);
  return next;
}

export function removeFromCart(productId, user) {
  const next = getCart(user).filter((item) => item.product_id !== productId);
  saveCart(next, user);
  return next;
}

export function clearCart(user) {
  return saveCart([], user);
}

export function getCartEventName() {
  return CART_EVENT;
}
