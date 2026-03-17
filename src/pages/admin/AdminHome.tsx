import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, FileText, Package, Newspaper, Eye, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Stats {
  carouselImages: number;
  contacts: number;
  pageViews: number;
  chatbotInteractions: number;
  products: number;
  news: number;
}

interface TopPage {
  page_path: string;
  views: number;
}

const AdminHome = () => {
  const [stats, setStats] = useState<Stats>({ carouselImages: 0, contacts: 0, pageViews: 0, chatbotInteractions: 0, products: 0, news: 0 });
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since = thirtyDaysAgo.toISOString();

      const [carousel, contacts, pageViews, chatbot, products, news, pvData] = await Promise.all([
        supabase.from('carousel_images').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('contacts').select('*', { count: 'exact', head: true }),
        supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', since),
        supabase.from('chatbot_interactions').select('*', { count: 'exact', head: true }).gte('created_at', since),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('page_views').select('page_path').gte('created_at', since),
      ]);

      if (pvData.data) {
        const pageCounts: Record<string, number> = {};
        pvData.data.forEach((v) => { pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1; });
        setTopPages(
          Object.entries(pageCounts)
            .map(([page_path, views]) => ({ page_path, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 5)
        );
      }

      setStats({
        carouselImages: carousel.count || 0,
        contacts: contacts.count || 0,
        pageViews: pageViews.count || 0,
        chatbotInteractions: chatbot.count || 0,
        products: products.count || 0,
        news: news.count || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Visitas (30d)', value: stats.pageViews, icon: Eye, color: 'text-blue-500', link: '' },
    { title: 'Chatbot', value: stats.chatbotInteractions, icon: MessageSquare, color: 'text-green-500', link: '' },
    { title: 'Contatos', value: stats.contacts, icon: Users, color: 'text-purple-500', link: '/admin/contacts' },
    { title: 'Carrossel', value: stats.carouselImages, icon: Image, color: 'text-orange-500', link: '/admin/carousel' },
    { title: 'Produtos', value: stats.products, icon: Package, color: 'text-cyan-500', link: '/admin/products' },
    { title: 'Notícias', value: stats.news, icon: Newspaper, color: 'text-pink-500', link: '/admin/news' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel Geral</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do site OptiStrat</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((stat) => {
          const Wrapper = stat.link ? Link : 'div';
          const wrapperProps = stat.link ? { to: stat.link } : {};
          return (
            <Wrapper key={stat.title} {...(wrapperProps as any)} className={stat.link ? 'block hover:scale-[1.02] transition-transform' : ''}>
              <Card className="h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.title}</p>
                </CardContent>
              </Card>
            </Wrapper>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Páginas Mais Visitadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length > 0 ? (
              <div className="space-y-2">
                {topPages.map((page, i) => (
                  <div key={page.page_path} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="truncate max-w-[200px]">{page.page_path}</span>
                    </div>
                    <span className="text-muted-foreground">{page.views}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Sem dados ainda</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Atalhos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { label: 'Carrossel', icon: Image, to: '/admin/carousel' },
              { label: 'Conteúdo', icon: FileText, to: '/admin/content' },
              { label: 'Notícias', icon: Newspaper, to: '/admin/news' },
              { label: 'Produtos', icon: Package, to: '/admin/products' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
