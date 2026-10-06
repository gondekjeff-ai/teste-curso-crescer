// Notifica alterações de produtos na mesma aba e em outras abas do navegador.
const CHANNEL = 'products-sync';
const STORAGE_KEY = 'products:updated-at';

export const notifyProductsUpdated = () => {
  window.dispatchEvent(new CustomEvent('products:updated'));
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage(Date.now());
    bc.close();
  } catch { /* não suportado */ }
  try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* ignore */ }
};

export const subscribeProductsUpdated = (cb: () => void) => {
  const onLocal = () => cb();
  const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) cb(); };
  window.addEventListener('products:updated', onLocal);
  window.addEventListener('storage', onStorage);
  let bc: BroadcastChannel | null = null;
  try { bc = new BroadcastChannel(CHANNEL); bc.onmessage = () => cb(); } catch { bc = null; }
  return () => {
    window.removeEventListener('products:updated', onLocal);
    window.removeEventListener('storage', onStorage);
    bc?.close();
  };
};
