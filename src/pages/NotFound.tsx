
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [maskedUrl, setMaskedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setChecking(true);
    setMaskedUrl(null);
    (async () => {
      try {
        const res = await fetch(
          `/api/redirects/lookup?path=${encodeURIComponent(location.pathname)}`
        );
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data?.destination_url) {
            setMaskedUrl(data.destination_url);
            return;
          }
        }
      } catch {
        // Ignore — fall back to 404 UI.
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [location.pathname]);

  useEffect(() => {
    if (!checking && !maskedUrl) {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
      );
    }
  }, [checking, maskedUrl, location.pathname]);

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (maskedUrl) {
    // URL Masking: render destination in a full-viewport iframe while
    // the browser address bar keeps the original mask URL.
    return (
      <>
        <SEO title="OptiStrat" description="OptiStrat" />
        <iframe
          src={maskedUrl}
          title="Conteúdo"
          className="fixed inset-0 w-screen h-screen border-0"
          allow="fullscreen; clipboard-read; clipboard-write; geolocation; camera; microphone; autoplay"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </>
    );
  }

  return (
    <PageLayout>
      <SEO
        title="Página não encontrada (404) | OptiStrat"
        description="A página que você procura não existe ou foi removida."
      />
      <section className="min-h-[70vh] flex items-center justify-center px-4 py-24">
        <div className="max-w-xl w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Search className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight text-foreground mb-2">
            404
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-foreground mb-3">
            Página não encontrada
          </p>
          <p className="text-muted-foreground mb-2">
            O endereço acessado não existe, foi removido ou está temporariamente indisponível.
          </p>
          {location.pathname && (
            <p className="text-xs text-muted-foreground mb-8 font-mono break-all">
              {location.pathname}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Voltar para o início
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Página anterior
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default NotFound;
