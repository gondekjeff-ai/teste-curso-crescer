import PageLayout from '@/components/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
  published: boolean;
}

const Blog = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: 'Erro ao carregar notícias',
        description: 'Não foi possível carregar as notícias. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-tech-news');
      
      if (error) throw error;
      
      toast({
        title: 'Notícias atualizadas',
        description: 'As últimas notícias de tecnologia foram carregadas.',
      });
      
      // Reload news after refresh
      await fetchNews();
    } catch (error) {
      console.error('Error refreshing news:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar as notícias.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const featuredPost = news[0];
  const otherPosts = news.slice(1);
  
  return (
    <PageLayout>
      <SEO 
        title="Notícias de TI e Telecomunicações - WRLDS Technologies" 
        description="Fique atualizado com as últimas notícias sobre tecnologia da informação e telecomunicações."
        imageUrl={featuredPost?.image_url || "/lovable-uploads/6b0637e9-4a7b-40d0-b219-c8b7f879f93e.png"}
        keywords={['tecnologia', 'TI', 'telecomunicações', 'notícias tech', 'inovação', 'tecnologia da informação']}
        type="website"
      />
      
      <div className="w-full pt-24 pb-12 bg-gradient-to-b from-black to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Notícias de Tecnologia</h1>
            <p className="text-xl text-muted-foreground mb-6">
              As últimas notícias sobre TI e Telecomunicações
            </p>
            <Button 
              onClick={refreshNews}
              disabled={refreshing}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Atualizar Notícias'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">Nenhuma notícia disponível no momento.</p>
            <Button onClick={refreshNews} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Carregar Notícias
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPost && (
              <a 
                href={featuredPost.image_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="col-span-1 md:col-span-2 lg:col-span-3"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="grid md:grid-cols-2 h-full">
                    <div className="bg-gray-200 h-64 md:h-full p-8 flex items-center justify-center">
                      <div className="text-center">
                        <span className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium inline-block mb-4">Destaque</span>
                        <h3 className="text-2xl md:text-3xl font-bold">{featuredPost.title}</h3>
                      </div>
                    </div>
                    <CardContent className="p-8">
                      <p className="text-muted-foreground text-sm mb-2">
                        {new Date(featuredPost.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-foreground mb-6">
                        {featuredPost.excerpt || featuredPost.content.substring(0, 200)}...
                      </p>
                      <Button variant="outline" className="group">
                        Ler mais 
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </a>
            )}
            
            {otherPosts.map((post) => (
              <a 
                key={post.id}
                href={post.image_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                  <div className="grid grid-rows-[200px,1fr]">
                    <div className="bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">Notícia</span>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground text-sm mb-2">
                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt || post.content.substring(0, 150)}...
                      </p>
                      <Button variant="outline" className="group mt-auto">
                        Ler mais 
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Blog;
