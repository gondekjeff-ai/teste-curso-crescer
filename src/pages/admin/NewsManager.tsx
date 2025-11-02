import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { newsSchema, sanitizeObject } from '@/lib/inputValidation';

interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  published: boolean;
}

const NewsManager = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as notícias',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;

    try {
      // Validate and sanitize input
      const validatedData = newsSchema.parse({
        title: editingNews.title,
        excerpt: editingNews.excerpt || '',
        content: editingNews.content,
        image_url: editingNews.image_url || '',
        published: editingNews.published,
      });

      // Sanitize string fields
      const sanitizedData = sanitizeObject(validatedData);

      if (editingNews.id) {
        // Update existing
        const { error } = await supabase
          .from('news')
          .update({
            title: sanitizedData.title,
            content: sanitizedData.content,
            excerpt: sanitizedData.excerpt,
            image_url: sanitizedData.image_url,
            published: sanitizedData.published,
          })
          .eq('id', editingNews.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('news')
          .insert([{
            title: sanitizedData.title,
            content: sanitizedData.content,
            excerpt: sanitizedData.excerpt,
            image_url: sanitizedData.image_url,
            published: sanitizedData.published,
          }]);

        if (error) throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Notícia salva com sucesso',
      });

      setDialogOpen(false);
      setEditingNews(null);
      loadNews();
    } catch (error: any) {
      console.error('Erro ao salvar notícia:', error);
      
      // Show validation errors
      if (error.errors && Array.isArray(error.errors)) {
        const messages = error.errors.map((e: any) => e.message).join(', ');
        toast({
          title: 'Erro de validação',
          description: messages,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível salvar a notícia',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Notícia excluída com sucesso',
      });

      loadNews();
    } catch (error) {
      console.error('Erro ao excluir notícia:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a notícia',
        variant: 'destructive',
      });
    }
  };

  const openNewDialog = () => {
    setEditingNews({
      id: '',
      title: '',
      content: '',
      excerpt: '',
      image_url: '',
      published: false,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (newsItem: News) => {
    setEditingNews(newsItem);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Notícias</h1>
          <p className="text-muted-foreground mt-2">
            Adicione, edite ou remova notícias do blog
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Notícia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNews?.id ? 'Editar Notícia' : 'Nova Notícia'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={editingNews?.title || ''}
                  onChange={(e) =>
                    setEditingNews(prev => prev ? { ...prev, title: e.target.value } : null)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Resumo</Label>
                <Textarea
                  id="excerpt"
                  value={editingNews?.excerpt || ''}
                  onChange={(e) =>
                    setEditingNews(prev => prev ? { ...prev, excerpt: e.target.value } : null)
                  }
                  rows={2}
                  placeholder="Breve descrição da notícia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={editingNews?.image_url || ''}
                  onChange={(e) =>
                    setEditingNews(prev => prev ? { ...prev, image_url: e.target.value } : null)
                  }
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea
                  id="content"
                  value={editingNews?.content || ''}
                  onChange={(e) =>
                    setEditingNews(prev => prev ? { ...prev, content: e.target.value } : null)
                  }
                  rows={10}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={editingNews?.published || false}
                  onCheckedChange={(checked) =>
                    setEditingNews(prev => prev ? { ...prev, published: checked } : null)
                  }
                />
                <Label htmlFor="published">Publicar Notícia</Label>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {news.map((newsItem) => (
          <Card key={newsItem.id}>
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{newsItem.title}</span>
                    <span className={`text-xs px-2 py-1 rounded ${newsItem.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {newsItem.published ? 'Publicada' : 'Rascunho'}
                    </span>
                  </div>
                  {newsItem.excerpt && (
                    <p className="text-sm text-muted-foreground mt-2">{newsItem.excerpt}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(newsItem)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(newsItem.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{newsItem.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {news.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Nenhuma notícia cadastrada ainda</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewsManager;
