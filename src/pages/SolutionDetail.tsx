import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';

interface Solution {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price?: number | string | null;
}

const SolutionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;
    (async () => {
      try {
        const data = await api.get<Solution>(`/products/${id}`);
        if (active) setSolution(data);
      } catch (e: any) {
        if (active) setError(e?.message || 'Erro ao carregar solução');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  return (
    <PageLayout>
      <SEO
        title={solution ? `${solution.name} | OptiStrat` : 'Solução | OptiStrat'}
        description={solution?.description || 'Soluções OptiStrat'}
      />
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o início
          </Link>

          {loading && (
            <div className="animate-pulse space-y-4">
              <div className="h-10 w-2/3 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-5/6 bg-muted rounded" />
            </div>
          )}

          {error && !loading && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          )}

          {solution && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start gap-4 mb-8">
                <div className="flex-shrink-0 p-3 rounded-xl bg-primary/10">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {solution.name}
                  </h1>
                  {solution.category && (
                    <span className="inline-block text-xs uppercase tracking-wider text-muted-foreground">
                      {solution.category}
                    </span>
                  )}
                </div>
              </div>

              <Card className="mb-8">
                <CardContent className="py-8">
                  <p className="text-base md:text-lg leading-relaxed text-foreground whitespace-pre-line">
                    {solution.description || 'Sem descrição disponível.'}
                  </p>
                </CardContent>
              </Card>

              <div className="text-center">
                <Link
                  to="/orcamento"
                  className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Solicitar orçamento
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default SolutionDetail;