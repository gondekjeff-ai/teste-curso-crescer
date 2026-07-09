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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { newsSchema, sanitizeObject } from '@/lib/inputValidation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Rss, RefreshCw, Globe, CheckCircle2, AlertTriangle, Loader2, Trash } from 'lucide-react';

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
  const [health, setHealth] = useState<{ ok: boolean; message: string; total?: number } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(true);
  const [retentionDays, setRetentionDays] = useState<number>(0);
  const [savingRetention, setSavingRetention] = useState(false);
  const [pendingDeleteNews, setPendingDeleteNews] = useState<string | null>(null);
  const [pendingDeleteSource, setPendingDeleteSource] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { (async () => {
    const ok = await checkHealth();
    if (ok) { loadNews(); loadSources(); loadSettings(); }
    else { setLoading(false); }
  })(); }, []);

  const checkHealth = async () => {
    setCheckingHealth(true);
    try {
      const data = await api.get('/admin/news/health');
      setHealth({ ok: !!data?.ok, message: data?.message || 'OK', total: data?.total });
      return !!data?.ok;
    } catch (err: any) {
      setHealth({ ok: false, message: err?.message || 'Recurso de notícias indisponível' });
      return false;
    } finally {
      setCheckingHealth(false);
    }
  };

  const loadSettings = async () => {
    try {
      const s = await api.get('/admin/news/settings');
      setRetentionDays(Number(s?.retention_days ?? 0));
    } catch { /* ignore */ }
  };

  const saveRetention = async () => {
    setSavingRetention(true);
    try {
      const res = await api.put('/admin/news/settings', { retention_days: Number(retentionDays) || 0 });
      toast({
        title: 'Configuração salva',
        description: res?.pruned
          ? `${res.pruned} notícia(s) antigas removidas`
          : 'Tempo de retenção atualizado',
      });
      loadNews();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Falha ao salvar', variant: 'destructive' });
    } finally {
      setSavingRetention(false);
    }
  };

  const runCleanupNow = async () => {
    try {
      const res = await api.post('/admin/news/cleanup');
      toast({ title: 'Limpeza concluída', description: `${res?.pruned || 0} notícia(s) removidas` });
      loadNews();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Falha na limpeza', variant: 'destructive' });
    }
  };

  const guardCrud = (): boolean => {
    if (!health?.ok) {
      toast({
        title: 'Recurso indisponível',
        description: 'Verifique o status do recurso de notícias antes de continuar.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

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

  const handleDeleteSource = (id: string) => setPendingDeleteSource(id);

  const confirmDeleteSource = async () => {
    const id = pendingDeleteSource;
    if (!id) return;
    setPendingDeleteSource(null);
    const snapshot = sources;
    setSources(prev => prev.filter(s => s.id !== id));
    try {
      await api.del(`/admin/news-sources/${id}`);
      toast({ title: 'Fonte excluída' });
    } catch (error: any) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
      setSources(snapshot);
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
    if (!guardCrud()) return;

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

  const handleDelete = (id: string) => {
    if (!guardCrud()) return;
    setPendingDeleteNews(id);
  };

  const confirmDeleteNews = async () => {
    const id = pendingDeleteNews;
    if (!id) return;
    setPendingDeleteNews(null);
    const snapshot = news;
    setNews(prev => prev.filter(n => n.id !== id));
    try {
      await api.del(`/admin/news/${id}`);
      toast({ title: 'Notícia excluída' });
    } catch (error: any) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
      setNews(snapshot);
    }
  };

  const openNew = () => {
    if (!guardCrud()) return;
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

      {/* Health validator + retention settings */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              {checkingHealth ? (
                <><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /><span className="text-muted-foreground">Verificando recurso de notícias…</span></>
              ) : health?.ok ? (
                <><CheckCircle2 className="h-4 w-4 text-green-600" /><span className="text-green-600 font-medium">Recurso operacional</span><span className="text-muted-foreground">— {health.total ?? 0} notícia(s) no banco</span></>
              ) : (
                <><AlertTriangle className="h-4 w-4 text-destructive" /><span className="text-destructive font-medium">Recurso indisponível</span><span className="text-muted-foreground truncate max-w-xs">{health?.message}</span></>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={checkHealth} disabled={checkingHealth}>
              <RefreshCw className={`h-4 w-4 mr-2 ${checkingHealth ? 'animate-spin' : ''}`} />
              Revalidar
            </Button>
          </div>

          <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="retention">Tempo limite de armazenamento (dias)</Label>
              <Input
                id="retention"
                type="number"
                min={0}
                max={3650}
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                disabled={!health?.ok}
              />
              <p className="text-xs text-muted-foreground">
                Notícias mais antigas que este valor são excluídas automaticamente. Use 0 para desativar.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveRetention} disabled={!health?.ok || savingRetention}>
                {savingRetention ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Salvar
              </Button>
              <Button variant="outline" onClick={runCleanupNow} disabled={!health?.ok || !retentionDays}>
                <Trash className="h-4 w-4 mr-2" />
                Limpar agora
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <div className="space-y-2">
              <Label>Importação automática</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editingSource?.fetch_interval_minutes ?? 0}
                onChange={(e) => setEditingSource(prev => prev ? { ...prev, fetch_interval_minutes: Number(e.target.value) } : null)}
              >
                <option value={0}>Manual (não importar automaticamente)</option>
                <option value={60}>A cada 1 hora</option>
                <option value={360}>A cada 6 horas</option>
                <option value={720}>A cada 12 horas</option>
                <option value={1440}>A cada 24 horas</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Ao desativar a fonte, suas notícias deixam de aparecer no site automaticamente.
              </p>
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
