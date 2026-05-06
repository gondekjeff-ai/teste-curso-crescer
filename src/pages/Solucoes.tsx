import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
}

/**
 * "Honeycomb" (hive) grid of all active products.
 * Each cell links to the product detail page (/solucoes/:id).
 */
const Solucoes = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.get<Product[]>('/products');
        if (active) setProducts(Array.isArray(data) ? data : []);
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <PageLayout>
      <SEO
        title="Nossos Serviços | OptiStrat"
        description="Conheça todas as soluções e serviços da OptiStrat para otimizar a TI do seu negócio."
      />
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Nossos Serviços
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Selecione uma solução para conhecer os detalhes.
            </p>
          </div>

          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              Nenhum serviço cadastrado no momento.
            </div>
          )}

          {!loading && products.length > 0 && (
            <div
              className="grid gap-4 sm:gap-5"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              }}
            >
              {products.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  className={idx % 2 === 1 ? 'sm:translate-y-6' : ''}
                >
                  <Link
                    to={`/solucoes/${p.id}`}
                    className="group relative block aspect-square overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/20 to-primary/5 border border-primary/20 hover:border-primary/60 transition-all hover:shadow-xl hover:-translate-y-1"
                    style={{
                      clipPath:
                        'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                    }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <Package className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                      <h3 className="text-sm md:text-base font-semibold text-foreground line-clamp-2">
                        {p.name}
                      </h3>
                      {p.category && (
                        <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {p.category}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Solucoes;