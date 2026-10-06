import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, CheckCircle2, Search, Settings2, Rocket, LifeBuoy } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import NotFound from './NotFound';

interface Solution {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price?: number | string | null;
  cover_image_url?: string | null;
  gallery?: { url: string; caption?: string }[] | null;
  highlights?: string | null;
  ai_content?: {
    headline?: string;
    intro?: string;
    sections?: { title: string; body: string }[];
    bullets?: string[];
    images?: { url: string; alt: string }[];
  } | null;
}

const STEPS = [
  { icon: Search, title: 'Diagnóstico', text: 'Entendemos o cenário e os objetivos do seu negócio.' },
  { icon: Settings2, title: 'Planejamento', text: 'Desenhamos a implantação adequada à sua realidade.' },
  { icon: Rocket, title: 'Implantação', text: 'Executamos com acompanhamento próximo da nossa equipe.' },
  { icon: LifeBuoy, title: 'Suporte', text: 'Seguimos ao seu lado com suporte e evolução contínua.' },
];

const SolutionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;
    (async () => {
      try {
        const data = await api.get<Solution>(`/products/${id}`);
        if (!data || (data as any).message === 'Not found' || !(data as any).id) {
          if (active) setNotFound(true);
        } else if (active) setSolution(data);
      } catch (e: any) {
        const msg = e?.message || '';
        if (/404|not found|não encontrad/i.test(msg)) {
          if (active) setNotFound(true);
        } else if (active) setError(msg || 'Erro ao carregar solução');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (notFound) return <NotFound />;

  const highlights = (solution?.highlights || '').split('\n').map((h) => h.trim()).filter(Boolean);
  const gallery = Array.isArray(solution?.gallery) ? solution!.gallery!.filter((g) => g?.url) : [];

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
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-balance">
                    {solution.name}
                  </h1>
                  {solution.category && (
                    <span className="inline-block text-xs uppercase tracking-wider text-muted-foreground">
                      {solution.category}
                    </span>
                  )}
                </div>
              </div>

              {solution.cover_image_url && (
                <div className="mb-10 overflow-hidden rounded-2xl border border-border aspect-[16/9] bg-muted">
                  <img
                    src={solution.cover_image_url}
                    alt={solution.name}
                    fetchPriority="high"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {solution.ai_content ? (
                <div className="space-y-8 mb-8">
                  {solution.ai_content.headline && (
                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                      {solution.ai_content.headline}
                    </h2>
                  )}
                  {solution.ai_content.images?.[0] && (
                    <img
                      src={solution.ai_content.images[0].url}
                      alt={solution.ai_content.images[0].alt}
                      loading="lazy"
                      className="w-full rounded-xl border border-border object-cover max-h-80"
                    />
                  )}
                  {solution.ai_content.intro && (
                    <p className="text-base md:text-lg leading-relaxed text-foreground whitespace-pre-line">
                      {solution.ai_content.intro}
                    </p>
                  )}
                  {solution.ai_content.sections?.map((s, i) => (
                    <Card key={i}>
                      <CardContent className="py-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {solution.ai_content.bullets && solution.ai_content.bullets.length > 0 && (
                    <Card>
                      <CardContent className="py-6">
                        <ul className="space-y-2">
                          {solution.ai_content.bullets.map((b, i) => (
                            <li key={i} className="flex gap-2 text-foreground">
                              <span className="text-primary">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  {solution.ai_content.images?.[1] && (
                    <img
                      src={solution.ai_content.images[1].url}
                      alt={solution.ai_content.images[1].alt}
                      loading="lazy"
                      className="w-full rounded-xl border border-border object-cover max-h-80"
                    />
                  )}
                </div>
              ) : (
                <div className="mb-10 max-w-3xl space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">Sobre a solução</h2>
                  {(solution.description || 'Sem descrição disponível.')
                    .split(/\n\s*\n|\n/)
                    .filter((t) => t.trim())
                    .map((para, i) => (
                      <p key={i} className="text-base md:text-lg leading-8 text-muted-foreground text-pretty">
                        {para.trim()}
                      </p>
                    ))}
                </div>
              )}

              {highlights.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-6">Destaques</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {highlights.map((h, i) => (
                      <div key={i} className="flex gap-3 rounded-xl border border-border bg-card p-5">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                        <p className="text-foreground leading-relaxed">{h}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {gallery.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-semibold text-foreground mb-6">Galeria</h2>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {gallery.map((g, i) => (
                      <figure key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                        <div className="aspect-[4/3] bg-muted">
                          <img src={g.url} alt={g.caption || `${solution.name} – imagem ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                        </div>
                        {g.caption && (
                          <figcaption className="px-4 py-3 text-sm text-muted-foreground">{g.caption}</figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                </section>
              )}

              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-foreground mb-6">Como trabalhamos</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {STEPS.map((step, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <step.icon className="h-5 w-5 text-primary" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Etapa {i + 1}</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 md:p-10 text-center">
                <h2 className="text-2xl font-semibold text-primary-foreground mb-2">Quer levar {solution.name} para sua empresa?</h2>
                <p className="text-primary-foreground/80 mb-6">Fale com nossa equipe e receba uma proposta sob medida.</p>
                <Link
                  to="/orcamento"
                  className="inline-flex items-center px-6 py-3 rounded-md bg-background text-foreground hover:bg-background/90 transition-colors font-medium"
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