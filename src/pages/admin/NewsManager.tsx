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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Rss, RefreshCw, Globe } from 'lucide-react';

interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  published: boolean;
  created_at: string;
}

interface NewsSource {
  id: string;
  name: string;
  url: string;
  active: boolean;
  created_at: string;
  last_fetched_at?: string | null;
  last_status?: string | null;
  last_error?: string | null;
  last_imported_count?: number | null;
  fetch_interval_minutes?: number;
}

const NewsManager = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [editingSource, setEditingSource] = useState<NewsSource | null>(null);
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadNews(); loadSources(); }, []);

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

  const loadSources = async () => {
    try {
      const data = await api.get('/admin/news-sources');
      setSources(data || []);
    } catch (error) {
      // Silent — table may not exist yet on first deploy
    }
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource) return;
    try {
      const payload = {
        name: editingSource.name,
        url: editingSource.url,
        active: editingSource.active,
        fetch_interval_minutes: Number(editingSource.fetch_interval_minutes ?? 0),
      };
      if (editingSource.id) {
        await api.put(`/admin/news-sources/${editingSource.id}`, payload);
      } else {
        await api.post('/admin/news-sources', payload);
      }
      toast({ title: 'Sucesso', description: 'Fonte salva com sucesso' });
      setSourceDialogOpen(false);
      setEditingSource(null);
      loadSources();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Não foi possível salvar', variant: 'destructive' });
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm('Excluir esta fonte de notícias?')) return;
    try {
      await api.del(`/admin/news-sources/${id}`);
      toast({ title: 'Fonte excluída' });
      loadSources();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleFetchNow = async () => {
    setFetching(true);
    try {
      const res = await api.post('/fetch-tech-news');
      toast({ title: 'Importação concluída', description: res?.message || 'Notícias atualizadas' });
      loadNews();
      loadSources();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Falha ao importar notícias', variant: 'destructive' });
    } finally {
      setFetching(false);
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
      <div>
        <h1 className="text-2xl font-bold">Notícias / Blog</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie artigos e fontes de notícias (RSS)</p>
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList>
          <TabsTrigger value="articles"><Newspaper className="h-4 w-4 mr-2" />Artigos ({news.length})</TabsTrigger>
          <TabsTrigger value="sources"><Rss className="h-4 w-4 mr-2" />Fontes ({sources.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4 mt-4">
          <div className="flex justify-end">
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
        </TabsContent>

        <TabsContent value="sources" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Cadastre feeds RSS. As notícias coletadas serão exibidas aleatoriamente no site.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleFetchNow} disabled={fetching}>
                <RefreshCw className={`h-4 w-4 mr-2 ${fetching ? 'animate-spin' : ''}`} />
                {fetching ? 'Importando...' : 'Importar agora'}
              </Button>
              <Button onClick={() => { setEditingSource({ id: '', name: '', url: '', active: true, created_at: '', fetch_interval_minutes: 0 }); setSourceDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Nova Fonte
              </Button>
            </div>
          </div>

          {sources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Rss className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Nenhuma fonte cadastrada — usando feeds padrão</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sources.map((src) => (
                <Card key={src.id}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{src.name}</h3>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          src.active ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                        }`}>
                          {src.active ? 'Ativo' : 'Inativo'}
                        </span>
                        {src.last_status && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            src.last_status === 'success'
                              ? 'bg-green-500/10 text-green-600'
                              : src.last_status === 'empty'
                              ? 'bg-yellow-500/10 text-yellow-600'
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {src.last_status === 'success' ? 'OK' : src.last_status === 'empty' ? 'Vazio' : 'Erro'}
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                          {!src.fetch_interval_minutes
                            ? 'Manual'
                            : src.fetch_interval_minutes < 60
                            ? `A cada ${src.fetch_interval_minutes}min`
                            : `A cada ${Math.round(src.fetch_interval_minutes / 60)}h`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{src.url}</p>
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <p>
                          Última importação:{' '}
                          {src.last_fetched_at
                            ? `${new Date(src.last_fetched_at).toLocaleString('pt-BR')} — ${src.last_imported_count ?? 0} novo(s)`
                            : 'nunca'}
                        </p>
                        {src.last_error && (
                          <p className="text-destructive break-words">Erro: {src.last_error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingSource(src); setSourceDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteSource(src.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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

      <Dialog open={sourceDialogOpen} onOpenChange={setSourceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSource?.id ? 'Editar Fonte' : 'Nova Fonte de Notícias'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSource} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={editingSource?.name || ''}
                onChange={(e) => setEditingSource(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Ex.: TecMundo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>URL do Feed RSS *</Label>
              <Input
                type="url"
                value={editingSource?.url || ''}
                onChange={(e) => setEditingSource(prev => prev ? { ...prev, url: e.target.value } : null)}
                placeholder="https://exemplo.com/feed/"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editingSource?.active ?? true}
                onCheckedChange={(checked) => setEditingSource(prev => prev ? { ...prev, active: checked } : null)}
              />
              <Label>Ativo</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSourceDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsManager;
