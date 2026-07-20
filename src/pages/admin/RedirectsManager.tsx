import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Pencil, Plus, X, ExternalLink } from 'lucide-react';

interface Redirect {
  id: string;
  mask_path: string;
  destination_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const SITE_ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'https://www.optistrat.com.br';

export default function RedirectsManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mask, setMask] = useState('');
  const [dest, setDest] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await api.get<Redirect[]>('/admin/redirects');
      setItems(rows);
    } catch (err) {
      toast({ title: 'Erro ao carregar', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditingId(null);
    setMask('');
    setDest('');
    setActive(true);
  };

  const startEdit = (r: Redirect) => {
    setEditingId(r.id);
    setMask(r.mask_path);
    setDest(r.destination_url);
    setActive(r.active);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedMask = mask.trim().startsWith('/') ? mask.trim() : `/${mask.trim()}`;
    if (!normalizedMask || normalizedMask === '/') {
      toast({ title: 'URL Máscara inválida', description: 'Ex: /hotspot/demo', variant: 'destructive' });
      return;
    }
    if (!/^https?:\/\//i.test(dest.trim())) {
      toast({ title: 'URL de destino inválida', description: 'Deve começar com http:// ou https://', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = { mask_path: normalizedMask, destination_url: dest.trim(), active };
      if (editingId) {
        await api.put(`/admin/redirects/${editingId}`, payload);
        toast({ title: 'Redirecionamento atualizado' });
      } else {
        await api.post('/admin/redirects', payload);
        toast({ title: 'Redirecionamento criado' });
      }
      reset();
      await load();
    } catch (err) {
      toast({ title: 'Erro ao salvar', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await api.del(`/admin/redirects/${id}`);
      toast({ title: 'Redirecionamento removido' });
      if (editingId === id) reset();
      await load();
    } catch (err) {
      toast({ title: 'Erro ao remover', description: (err as Error).message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Redirecionamentos (URL Masking)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cadastre uma URL Máscara (caminho após o domínio) e o site exibirá o conteúdo da URL de destino
          sem alterar o endereço no navegador do usuário.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>{editingId ? 'Editar redirecionamento' : 'Novo redirecionamento'}</span>
            {editingId && (
              <Button type="button" size="sm" variant="ghost" onClick={reset}>
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="mask">URL Máscara</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                  {SITE_ORIGIN}
                </span>
                <Input
                  id="mask"
                  placeholder="/hotspot/demo"
                  value={mask}
                  onChange={(e) => setMask(e.target.value)}
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                O domínio é ignorado no cadastro — informe apenas o caminho (ex: <code>/hotspot/demo</code>).
              </p>
            </div>

            <div>
              <Label htmlFor="dest">URL de destino</Label>
              <Input
                id="dest"
                placeholder="https://exemplo.com/pagina?param=1"
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch id="active" checked={active} onCheckedChange={setActive} />
              <Label htmlFor="active" className="cursor-pointer">Ativo</Label>
            </div>

            <Button type="submit" disabled={saving}>
              {editingId ? <Pencil className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cadastrados ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum redirecionamento cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {items.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 rounded-lg border border-border bg-card"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm font-mono text-primary truncate">{r.mask_path}</code>
                      {!r.active && (
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          inativo
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{r.destination_url}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover redirecionamento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            A máscara <code>{r.mask_path}</code> deixará de redirecionar.
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(r.id)}>Remover</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}