import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Share2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string | null;
  display_order: number;
  active: boolean;
}

const PLATFORMS: { value: string; label: string }[] = [
  { value: 'linkedin',  label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook',  label: 'Facebook' },
  { value: 'x',         label: 'X (Twitter)' },
  { value: 'tiktok',    label: 'TikTok' },
  { value: 'youtube',   label: 'YouTube' },
  { value: 'whatsapp',  label: 'WhatsApp' },
  { value: 'telegram',  label: 'Telegram' },
  { value: 'discord',   label: 'Discord' },
  { value: 'github',    label: 'GitHub' },
  { value: 'kawai',     label: 'Kawai' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'threads',   label: 'Threads' },
  { value: 'reddit',    label: 'Reddit' },
  { value: 'twitch',    label: 'Twitch' },
  { value: 'spotify',   label: 'Spotify' },
  { value: 'snapchat',  label: 'Snapchat' },
  { value: 'medium',    label: 'Medium' },
  { value: 'behance',   label: 'Behance' },
  { value: 'dribbble',  label: 'Dribbble' },
];

const empty: SocialLink = {
  id: '', platform: 'linkedin', url: '', label: '', display_order: 0, active: true,
};

const SocialLinksManager = () => {
  const [items, setItems] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await api.get('/admin/social-links');
      setItems(data || []);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar as redes sociais', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const payload = {
      platform: editing.platform,
      url: editing.url.trim(),
      label: editing.label?.trim() || null,
      display_order: Number(editing.display_order) || 0,
      active: editing.active,
    };
    if (!payload.platform || !payload.url) {
      toast({ title: 'Preencha plataforma e URL', variant: 'destructive' });
      return;
    }
    try {
      if (editing.id) {
        await api.put(`/admin/social-links/${editing.id}`, payload);
      } else {
        await api.post('/admin/social-links', payload);
      }
      toast({ title: 'Rede social salva' });
      setOpen(false);
      setEditing(null);
      await load();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir esta rede social?')) return;
    try {
      await api.del(`/admin/social-links/${id}`);
      toast({ title: 'Rede social excluída' });
      await load();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const platformLabel = (v: string) => PLATFORMS.find(p => p.value === v)?.label || v;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Redes Sociais</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} link(s) cadastrado(s) — exibidos na seção de contatos do site
          </p>
        </div>
        <Button onClick={() => { setEditing({ ...empty }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Nova Rede Social
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Share2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Nenhuma rede social cadastrada ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((s) => (
            <Card key={s.id} className={!s.active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{platformLabel(s.platform)}</p>
                    {s.label && <p className="text-xs text-muted-foreground">{s.label}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => { setEditing(s); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                      onClick={() => remove(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 break-all">
                  <ExternalLink className="h-3 w-3 flex-shrink-0" /> {s.url}
                </a>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-muted-foreground">Ordem: {s.display_order}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    s.active ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                  }`}>
                    {s.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Editar Rede Social' : 'Nova Rede Social'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label>Plataforma *</Label>
              <Select
                value={editing?.platform || 'linkedin'}
                onValueChange={(v) => setEditing(p => p ? { ...p, platform: v } : null)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">O ícone é obtido automaticamente conforme a plataforma.</p>
            </div>
            <div className="space-y-2">
              <Label>URL do perfil *</Label>
              <Input
                type="url"
                placeholder="https://www.linkedin.com/company/optistrat"
                value={editing?.url || ''}
                onChange={(e) => setEditing(p => p ? { ...p, url: e.target.value } : null)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Rótulo (opcional)</Label>
              <Input
                placeholder="Ex.: @optistrat"
                value={editing?.label || ''}
                onChange={(e) => setEditing(p => p ? { ...p, label: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ordem de exibição</Label>
              <Input
                type="number"
                value={editing?.display_order ?? 0}
                onChange={(e) => setEditing(p => p ? { ...p, display_order: parseInt(e.target.value) || 0 } : null)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={editing?.active ?? true}
                onCheckedChange={(c) => setEditing(p => p ? { ...p, active: c } : null)}
              />
              <Label>Ativo</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialLinksManager;