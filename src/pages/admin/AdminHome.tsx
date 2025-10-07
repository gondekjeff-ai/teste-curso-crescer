import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, FileText, Shield, Users, Eye, MessageSquare, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [stats, setStats] = useState<Stats>({
    carouselImages: 0,
    contacts: 0,
    pageViews: 0,
    chatbotInteractions: 0,
    products: 0,
    news: 0,
  });
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load carousel images count
      const { count: carouselCount } = await supabase
        .from('carousel_images')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      // Load contacts count
      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      // Load page views count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: pageViewsCount } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Load chatbot interactions count (last 30 days)
      const { count: chatbotCount } = await supabase
        .from('chatbot_interactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Load products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Load news count
      const { count: newsCount } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true });

      // Load top pages
      const { data: pageViewsData } = await supabase
        .from('page_views')
        .select('page_path')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (pageViewsData) {
        const pageCounts: Record<string, number> = {};
        pageViewsData.forEach((view) => {
          pageCounts[view.page_path] = (pageCounts[view.page_path] || 0) + 1;
        });

        const sortedPages = Object.entries(pageCounts)
          .map(([page_path, views]) => ({ page_path, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);

        setTopPages(sortedPages);
      }

      setStats({
        carouselImages: carouselCount || 0,
        contacts: contactsCount || 0,
        pageViews: pageViewsCount || 0,
        chatbotInteractions: chatbotCount || 0,
        products: productsCount || 0,
        news: newsCount || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as estatísticas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Visualizações (30d)',
      value: stats.pageViews,
      icon: Eye,
      description: 'Visitas ao site',
      color: 'text-blue-500',
    },
    {
      title: 'Interações Chatbot',
      value: stats.chatbotInteractions,
      icon: MessageSquare,
      description: 'Últimos 30 dias',
      color: 'text-green-500',
    },
    {
      title: 'Contatos Recebidos',
      value: stats.contacts,
      icon: Users,
      description: 'Mensagens enviadas',
      color: 'text-purple-500',
    },
    {
      title: 'Carrossel Ativo',
      value: stats.carouselImages,
      icon: Image,
      description: 'Imagens ativas',
      color: 'text-orange-500',
    },
    {
      title: 'Produtos',
      value: stats.products,
      icon: Shield,
      description: 'Cadastrados',
      color: 'text-cyan-500',
    },
    {
      title: 'Notícias',
      value: stats.news,
      icon: FileText,
      description: 'Publicadas',
      color: 'text-pink-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo ao painel de administração do OptiStrat
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Páginas Mais Visitadas
            </CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {topPages.length > 0 ? (
              <div className="space-y-3">
                {topPages.map((page, index) => (
                  <div key={page.page_path} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{page.page_path}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{page.views} visitas</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum dado de navegação disponível
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Guia Rápido
            </CardTitle>
            <CardDescription>Como usar o painel administrativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Image className="h-4 w-4" />
                Gerenciar Carrossel
              </h3>
              <p className="text-xs text-muted-foreground">
                Adicione, edite ou remova imagens do carrossel da página inicial.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                Editar Conteúdo
              </h3>
              <p className="text-xs text-muted-foreground">
                Modifique textos, produtos e notícias do site.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4" />
                Segurança
              </h3>
              <p className="text-xs text-muted-foreground">
                Painel protegido por autenticação e 2FA.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
