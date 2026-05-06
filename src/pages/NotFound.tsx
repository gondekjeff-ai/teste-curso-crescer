
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

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
