import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Newspaper } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { newsSchema, sanitizeObject } from '@/lib/inputValidation';

interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  published: boolean;
  created_at: string;
}

const NewsManager = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadNews(); }, []);

  const loadNews = async () => {
    try {
      const data = await api.get('/admin/news');
      setNews(data || []);
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível carregar as notícias', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;

    try {
      const validatedData = newsSchema.parse({
        title: editingNews.title,
        excerpt: editingNews.excerpt || '',
        content: editingNews.content,
        image_url: editingNews.image_url || '',
        published: editingNews.published,
      });
      const sanitizedData = sanitizeObject(validatedData);

      if (editingNews.id) {
        await api.put(`/admin/news/${editingNews.id}`, sanitizedData);
      } else {
        await api.post('/admin/news', sanitizedData);
      }

      toast({ title: 'Sucesso', description: 'Notícia salva com sucesso' });
      setDialogOpen(false);
      setEditingNews(null);
      loadNews();
    } catch (error: any) {
      if (error.errors && Array.isArray(error.errors)) {
        toast({ title: 'Erro de validação', description: error.errors.map((e: any) => e.message).join(', '), variant: 'destructive' });
      } else {
        toast({ title: 'Erro', description: error.message || 'Não foi possível salvar', variant: 'destructive' });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta notícia?')) return;
    try {
      await api.del(`/admin/news/${id}`);
      toast({ title: 'Notícia excluída' });
      loadNews();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const openNew = () => {
    setEditingNews({ id: '', title: '', content: '', excerpt: '', image_url: '', published: false, created_at: '' });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notícias / Blog</h1>
          <p className="text-sm text-muted-foreground mt-1">{news.length} artigos cadastrados</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Nova Notícia
        </Button>
      </div>

      {news.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Nenhuma notícia cadastrada ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {news.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {item.image_url && (
                  <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="flex-1 p-4 flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{item.title}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        item.published ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                      }`}>
                        {item.published ? 'Publicada' : 'Rascunho'}
                      </span>
                    </div>
                    {item.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingNews(item); setDialogOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNews?.id ? 'Editar Notícia' : 'Nova Notícia'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={editingNews?.title || ''}
                onChange={(e) => setEditingNews(prev => prev ? { ...prev, title: e.target.value } : null)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Resumo</Label>
              <Textarea
                value={editingNews?.excerpt || ''}
                onChange={(e) => setEditingNews(prev => prev ? { ...prev, excerpt: e.target.value } : null)}
                rows={2}
                placeholder="Breve descrição"
              />
            </div>
            <div className="space-y-2">
              <Label>Imagem de Capa</Label>
              <ImageUpload
                currentUrl={editingNews?.image_url}
                onUpload={(url) => setEditingNews(prev => prev ? { ...prev, image_url: url } : null)}
                onRemove={() => setEditingNews(prev => prev ? { ...prev, image_url: '' } : null)}
                folder="news"
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo *</Label>
              <Textarea
                value={editingNews?.content || ''}
                onChange={(e) => setEditingNews(prev => prev ? { ...prev, content: e.target.value } : null)}
                rows={10}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editingNews?.published || false}
                onCheckedChange={(checked) => setEditingNews(prev => prev ? { ...prev, published: checked } : null)}
              />
              <Label>Publicar</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsManager;
