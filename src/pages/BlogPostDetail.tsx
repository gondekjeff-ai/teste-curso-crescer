import { useParams, Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsDetail {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  created_at: string;
}

const BlogPostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('id, title, content, excerpt, image_url, created_at')
          .eq('id', id)
          .eq('published', true)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="w-full pt-24 pb-12 bg-gradient-to-b from-background to-secondary">
          <div className="container mx-auto px-4 max-w-4xl">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-64 mb-8" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!post) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Notícia não encontrada</h1>
          <p className="text-muted-foreground mb-8">A notícia que você procura não existe ou foi removida.</p>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <PageLayout>
      <SEO
        title={`${post.title} - OptiStrat`}
        description={post.excerpt || post.content.substring(0, 160)}
        imageUrl={post.image_url || undefined}
        keywords={['tecnologia', 'TI', 'OptiStrat']}
        isBlogPost={true}
        publishDate={new Date(post.created_at).toISOString()}
        author="OptiStrat"
        type="article"
      />

      <article className="w-full pt-16 pb-16">
        <div className="h-64 sm:h-80 md:h-96 relative bg-gradient-to-b from-primary/20 to-background">
          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-8 max-w-4xl">
            <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors text-sm">
              <ArrowLeft className="mr-2 h-3 w-3" />
              Voltar ao Blog
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <div className="text-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        </div>
      </article>
    </PageLayout>
  );
};

export default BlogPostDetail;
