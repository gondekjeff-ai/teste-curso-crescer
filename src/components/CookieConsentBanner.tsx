import { useState, useEffect, useCallback, useRef, useId } from 'react';
import { Cookie, X, Shield, BarChart3, Megaphone, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

// Versão da Política de Cookies — atualize quando o texto/categorias mudarem
// para reabrir o banner e renovar o consentimento dos usuários.
const CONSENT_VERSION = '2026-06-12';
const STORAGE_KEY = 'optistrat-cookie-consent';

type Categories = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

type ConsentRecord = {
  version: string;
  timestamp: string;
  method: 'accept_all' | 'reject_all' | 'custom';
  categories: Categories;
};

const defaultCategories: Categories = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function readConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function applyConsent(categories: Categories) {
  // Atualiza Google Consent Mode v2 — scripts de Analytics/Marketing
  // permanecem em estado "denied" até que o usuário consinta.
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: categories.analytics ? 'granted' : 'denied',
      ad_storage: categories.marketing ? 'granted' : 'denied',
      ad_user_data: categories.marketing ? 'granted' : 'denied',
      ad_personalization: categories.marketing ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
    });
  }
  // Sinais legados utilizados pelo silktide manager existente
  try {
    localStorage.setItem('silktideCookieChoice_necessary', 'true');
    localStorage.setItem('silktideCookieChoice_analytics', String(categories.analytics));
    localStorage.setItem('silktideCookieChoice_marketing', String(categories.marketing));
  } catch {}
}

function saveConsent(method: ConsentRecord['method'], categories: Categories) {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    method,
    categories,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {}
  applyConsent(categories);
  window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: record }));
}

/* ------------------------------------------------------------------ */
/*  Focus trap helpers                                                */
/* ------------------------------------------------------------------ */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
}

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [hasChoice, setHasChoice] = useState(false);
  const [preferences, setPreferences] = useState<Categories>(defaultCategories);

  const bannerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const floatingBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const bannerTitleId = useId();
  const bannerDescId = useId();
  const modalTitleId = useId();
  const modalDescId = useId();

  /* ---- initial load ------------------------------------------------ */
  useEffect(() => {
    const existing = readConsent();
    if (!existing) {
      setShowBanner(true);
      setHasChoice(false);
    } else {
      setHasChoice(true);
      setPreferences(existing.categories);
      applyConsent(existing.categories);
    }

    const openHandler = () => {
      const current = readConsent();
      setPreferences(current?.categories ?? defaultCategories);
      setShowPreferences(true);
      setShowBanner(false);
    };
    window.addEventListener('open-cookie-preferences', openHandler);
    return () => window.removeEventListener('open-cookie-preferences', openHandler);
  }, []);

  /* ---- focus management on open/close ------------------------------ */
  useEffect(() => {
    if (showPreferences) {
      lastFocusedRef.current = document.activeElement as HTMLElement;
      // Wait for render then focus the close button
      const timer = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showPreferences]);

  const restoreFocus = useCallback(() => {
    setTimeout(() => {
      if (lastFocusedRef.current && 'focus' in lastFocusedRef.current) {
        lastFocusedRef.current.focus();
      } else if (floatingBtnRef.current) {
        floatingBtnRef.current.focus();
      }
    }, 50);
  }, []);

  /* ---- Escape key -------------------------------------------------- */
  useEffect(() => {
    if (!showPreferences && !showBanner) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showPreferences) {
          setShowPreferences(false);
          restoreFocus();
        } else if (showBanner) {
          setShowBanner(false);
          setHasChoice(true);
          restoreFocus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showPreferences, showBanner, restoreFocus]);

  /* ---- focus trap inside modal ------------------------------------- */
  useEffect(() => {
    if (!showPreferences || !modalRef.current) return;

    const container = modalRef.current;

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusable(container);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showPreferences]);

  /* ---- lock body scroll when modal is open ----------------------- */
  useEffect(() => {
    if (showPreferences) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [showPreferences]);

  const acceptAll = useCallback(() => {
    const categories: Categories = { necessary: true, analytics: true, marketing: true };
    saveConsent('accept_all', categories);
    setPreferences(categories);
    setHasChoice(true);
    setShowBanner(false);
    setShowPreferences(false);
    restoreFocus();
  }, [restoreFocus]);

  const rejectAll = useCallback(() => {
    const categories: Categories = { necessary: true, analytics: false, marketing: false };
    saveConsent('reject_all', categories);
    setPreferences(categories);
    setHasChoice(true);
    setShowBanner(false);
    setShowPreferences(false);
    restoreFocus();
  }, [restoreFocus]);

  const savePrefs = useCallback(() => {
    saveConsent('custom', preferences);
    setHasChoice(true);
    setShowBanner(false);
    setShowPreferences(false);
    restoreFocus();
  }, [preferences, restoreFocus]);

  const closeModal = useCallback(() => {
    setShowPreferences(false);
    restoreFocus();
  }, [restoreFocus]);

  return (
    <>
      {/* Botão flutuante para reabrir preferências a qualquer momento */}
      {hasChoice && !showPreferences && !showBanner && (
        <button
          ref={floatingBtnRef}
          type="button"
          aria-label="Gerenciar preferências de cookies"
          onClick={() => {
            lastFocusedRef.current = document.activeElement as HTMLElement;
            setShowPreferences(true);
          }}
          className="fixed bottom-4 left-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-border transition hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Cookie className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {/* Banner inicial */}
      {showBanner && !showPreferences && (
        <div
          ref={bannerRef}
          role="dialog"
          aria-live="polite"
          aria-modal="false"
          aria-labelledby={bannerTitleId}
          aria-describedby={bannerDescId}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:p-6"
          data-testid="cookie-banner"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex flex-1 items-start gap-3">
              <div
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex"
                aria-hidden="true"
              >
                <Cookie className="h-5 w-5" />
              </div>
              <div>
                <h2 id={bannerTitleId} className="mb-1 text-base font-semibold text-foreground sm:text-lg">
                  Utilizamos cookies neste site
                </h2>
                <p id={bannerDescId} className="text-sm leading-relaxed text-muted-foreground">
                  Utilizamos cookies e tecnologias similares para garantir o funcionamento do site,
                  analisar o desempenho e personalizar conteúdo, conforme previsto pela{' '}
                  <strong>LGPD (Lei nº 13.709/2018)</strong> e pelo{' '}
                  <strong>Marco Civil da Internet (Lei nº 12.965/2014)</strong>. Você pode aceitar,
                  recusar os não essenciais ou configurar suas preferências. Consulte nossa{' '}
                  <Link to="/cookie-policy" className="font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
                    Política de Cookies
                  </Link>{' '}
                  e a{' '}
                  <Link to="/privacy-policy" className="font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  lastFocusedRef.current = document.activeElement as HTMLElement;
                  setShowPreferences(true);
                }}
              >
                <Sliders className="mr-2 h-4 w-4" aria-hidden="true" /> Configurar
              </Button>
              <Button variant="outline" size="sm" onClick={rejectAll}>
                Recusar
              </Button>
              <Button size="sm" onClick={acceptAll}>
                Aceitar todos
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de preferências granulares */}
      {showPreferences && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          aria-describedby={modalDescId}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur sm:items-center sm:p-4"
          data-testid="cookie-preferences-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            ref={modalRef}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card text-card-foreground shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h2 id={modalTitleId} className="text-lg font-semibold">
                  Preferências de cookies
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Versão da política: {CONSENT_VERSION}
                </p>
              </div>
              <Button
                ref={closeBtnRef}
                variant="ghost"
                size="icon"
                onClick={closeModal}
                aria-label="Fechar preferências de cookies"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <p id={modalDescId} className="text-sm text-muted-foreground">
                Escolha quais categorias de cookies deseja autorizar. Os cookies necessários não
                podem ser desativados, pois são essenciais ao funcionamento do site. Seu
                consentimento é registrado com data, hora e versão da política para fins de
                conformidade com a LGPD.
              </p>

              <CategoryRow
                icon={<Shield className="h-4 w-4" aria-hidden="true" />}
                title="Necessários"
                description="Indispensáveis para a operação do site, autenticação, segurança e preservação de suas escolhas. Base legal: legítimo interesse e execução de contrato (art. 7º, IX e V, LGPD)."
                checked
                disabled
              />
              <CategoryRow
                icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />}
                title="Analíticos"
                description="Permitem mensurar audiência, performance e melhorar a experiência (ex.: Google Analytics). Somente ativados mediante seu consentimento expresso."
                checked={preferences.analytics}
                onChange={(v) => setPreferences((p) => ({ ...p, analytics: v }))}
              />
              <CategoryRow
                icon={<Megaphone className="h-4 w-4" aria-hidden="true" />}
                title="Marketing"
                description="Utilizados para personalizar anúncios e mensurar campanhas em parceiros (ex.: Google Ads, Meta, LinkedIn). Ativados apenas após consentimento."
                checked={preferences.marketing}
                onChange={(v) => setPreferences((p) => ({ ...p, marketing: v }))}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-between">
              <Button variant="outline" size="sm" onClick={rejectAll}>
                Recusar não essenciais
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" size="sm" onClick={savePrefs}>
                  Salvar preferências
                </Button>
                <Button size="sm" onClick={acceptAll}>
                  Aceitar todos
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  CategoryRow                                                       */
/* ------------------------------------------------------------------ */
interface CategoryRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}

const CategoryRow = ({ icon, title, description, checked, disabled, onChange }: CategoryRowProps) => {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descId = `${baseId}-desc`;

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background/50 p-4">
      <div className="flex flex-1 items-start gap-3">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          aria-hidden="true"
        >
          {icon}
        </div>
        <div>
          <h3 id={titleId} className="text-sm font-semibold text-foreground">
            {title}
          </h3>
          <p id={descId} className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange?.(Boolean(v))}
        aria-labelledby={titleId}
        aria-describedby={descId}
      />
    </div>
  );
};

// Helper exportável para reabrir o banner a partir de qualquer página (ex.: Política de Cookies)
export function openCookiePreferences() {
  window.dispatchEvent(new Event('open-cookie-preferences'));
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export default CookieConsentBanner;