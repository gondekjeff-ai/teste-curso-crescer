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

/**
 * Per-platform metadata: drives the admin form (placeholder, example, hint, brand color,
 * default rótulo, allowed domains and ícone preview) and reinforces a coerente UX.
 */
interface PlatformMeta {
  value: string;          // slug salvo no banco
  label: string;          // nome exibido
  iconSlug: string;       // slug em simpleicons.org
  brand: string;          // cor da marca (hex) p/ preview
  domains: string[];      // domínios aceitos (validação leve no front)
  placeholder: string;    // placeholder do input
  example: string;        // exemplo mostrado abaixo do input
  defaultLabel: string;   // sugestão de rótulo
  urlHint: string;        // dica/formato esperado
}

const PLATFORMS: PlatformMeta[] = [
  { value: 'linkedin',  label: 'LinkedIn',     iconSlug: 'linkedin',  brand: '#0A66C2', domains: ['linkedin.com'],
    placeholder: 'https://www.linkedin.com/company/optistrat',
    example:    'https://www.linkedin.com/company/<sua-empresa>',
    defaultLabel: 'OptiStrat no LinkedIn',
    urlHint: 'Use o link da página da empresa (/company/...) ou perfil (/in/...).' },
  { value: 'instagram', label: 'Instagram',    iconSlug: 'instagram', brand: '#E4405F', domains: ['instagram.com'],
    placeholder: 'https://www.instagram.com/optistrat',
    example:    'https://www.instagram.com/<usuario>',
    defaultLabel: '@optistrat',
    urlHint: 'Use a URL completa do perfil, não apenas o @.' },
  { value: 'facebook',  label: 'Facebook',     iconSlug: 'facebook',  brand: '#1877F2', domains: ['facebook.com', 'fb.com'],
    placeholder: 'https://www.facebook.com/optistrat',
    example:    'https://www.facebook.com/<pagina>',
    defaultLabel: 'OptiStrat no Facebook',
    urlHint: 'Aceita facebook.com e fb.com.' },
  { value: 'x',         label: 'X (Twitter)',  iconSlug: 'x',         brand: '#000000', domains: ['x.com', 'twitter.com'],
    placeholder: 'https://x.com/optistrat',
    example:    'https://x.com/<usuario>',
    defaultLabel: '@optistrat no X',
    urlHint: 'Aceita x.com e twitter.com.' },
  { value: 'tiktok',    label: 'TikTok',       iconSlug: 'tiktok',    brand: '#000000', domains: ['tiktok.com'],
    placeholder: 'https://www.tiktok.com/@optistrat',
    example:    'https://www.tiktok.com/@<usuario>',
    defaultLabel: '@optistrat no TikTok',
    urlHint: 'O usuário deve começar com @.' },
  { value: 'youtube',   label: 'YouTube',      iconSlug: 'youtube',   brand: '#FF0000', domains: ['youtube.com', 'youtu.be'],
    placeholder: 'https://www.youtube.com/@optistrat',
    example:    'https://www.youtube.com/@<canal>  ou  /channel/<id>',
    defaultLabel: 'Canal OptiStrat',
    urlHint: 'Aceita @handle, /channel/, /c/ ou /user/.' },
  { value: 'whatsapp',  label: 'WhatsApp',     iconSlug: 'whatsapp',  brand: '#25D366', domains: ['wa.me', 'whatsapp.com', 'api.whatsapp.com'],
    placeholder: 'https://wa.me/5511999999999',
    example:    'https://wa.me/<DDI+DDD+numero>',
    defaultLabel: 'Fale no WhatsApp',
    urlHint: 'Prefira wa.me/<número> sem espaços nem símbolos.' },
  { value: 'telegram',  label: 'Telegram',     iconSlug: 'telegram',  brand: '#26A5E4', domains: ['t.me', 'telegram.me'],
    placeholder: 'https://t.me/optistrat',
    example:    'https://t.me/<usuario_ou_canal>',
    defaultLabel: 'OptiStrat no Telegram',
    urlHint: 'Aceita t.me e telegram.me.' },
  { value: 'discord',   label: 'Discord',      iconSlug: 'discord',   brand: '#5865F2', domains: ['discord.gg', 'discord.com'],
    placeholder: 'https://discord.gg/xxxxxxx',
    example:    'https://discord.gg/<convite>',
    defaultLabel: 'Comunidade no Discord',
    urlHint: 'Use um convite permanente (discord.gg/...).' },
  { value: 'github',    label: 'GitHub',       iconSlug: 'github',    brand: '#181717', domains: ['github.com'],
    placeholder: 'https://github.com/optistrat',
    example:    'https://github.com/<organizacao>',
    defaultLabel: 'OptiStrat no GitHub',
    urlHint: 'Use a URL da organização ou usuário.' },
  { value: 'kawai',     label: 'Kawai',        iconSlug: 'kakaotalk', brand: '#FFCD00', domains: ['kawai.com', 'kakao.com', 'kakaotalk.com'],
    placeholder: 'https://kawai.com/optistrat',
    example:    'https://kawai.com/<perfil>',
    defaultLabel: 'OptiStrat no Kawai',
    urlHint: 'Ícone exibido herda o estilo Kakao/Kawai.' },
  { value: 'pinterest', label: 'Pinterest',    iconSlug: 'pinterest', brand: '#BD081C', domains: ['pinterest.com', 'pin.it'],
    placeholder: 'https://www.pinterest.com/optistrat',
    example:    'https://www.pinterest.com/<usuario>',
    defaultLabel: 'OptiStrat no Pinterest',
    urlHint: 'Aceita pinterest.com e pin.it.' },
  { value: 'threads',   label: 'Threads',      iconSlug: 'threads',   brand: '#000000', domains: ['threads.net', 'threads.com'],
    placeholder: 'https://www.threads.net/@optistrat',
    example:    'https://www.threads.net/@<usuario>',
    defaultLabel: '@optistrat no Threads',
    urlHint: 'O usuário deve começar com @.' },
  { value: 'reddit',    label: 'Reddit',       iconSlug: 'reddit',    brand: '#FF4500', domains: ['reddit.com'],
    placeholder: 'https://www.reddit.com/r/optistrat',
    example:    'https://www.reddit.com/r/<subreddit>  ou  /user/<usuario>',
    defaultLabel: 'OptiStrat no Reddit',
    urlHint: 'Aceita subreddits (/r/) e usuários (/user/).' },
  { value: 'twitch',    label: 'Twitch',       iconSlug: 'twitch',    brand: '#9146FF', domains: ['twitch.tv'],
    placeholder: 'https://www.twitch.tv/optistrat',
    example:    'https://www.twitch.tv/<canal>',
    defaultLabel: 'Canal OptiStrat na Twitch',
    urlHint: 'Use o link direto do canal.' },
  { value: 'spotify',   label: 'Spotify',      iconSlug: 'spotify',   brand: '#1DB954', domains: ['spotify.com', 'open.spotify.com'],
    placeholder: 'https://open.spotify.com/user/optistrat',
    example:    'https://open.spotify.com/<artist|user|show>/<id>',
    defaultLabel: 'OptiStrat no Spotify',
    urlHint: 'Aceita perfil de artista, usuário ou podcast.' },
  { value: 'snapchat',  label: 'Snapchat',     iconSlug: 'snapchat',  brand: '#FFFC00', domains: ['snapchat.com'],
    placeholder: 'https://www.snapchat.com/add/optistrat',
    example:    'https://www.snapchat.com/add/<usuario>',
    defaultLabel: 'OptiStrat no Snapchat',
    urlHint: 'Use o link "Adicionar amigo".' },
  { value: 'medium',    label: 'Medium',       iconSlug: 'medium',    brand: '#000000', domains: ['medium.com'],
    placeholder: 'https://medium.com/@optistrat',
    example:    'https://medium.com/@<usuario>  ou  /<publicacao>',
    defaultLabel: 'Blog no Medium',
    urlHint: 'Aceita @usuário ou publicação.' },
  { value: 'behance',   label: 'Behance',      iconSlug: 'behance',   brand: '#1769FF', domains: ['behance.net'],
    placeholder: 'https://www.behance.net/optistrat',
    example:    'https://www.behance.net/<usuario>',
    defaultLabel: 'Portfólio no Behance',
    urlHint: 'Use a URL pública do portfólio.' },
  { value: 'dribbble',  label: 'Dribbble',     iconSlug: 'dribbble',  brand: '#EA4C89', domains: ['dribbble.com'],
    placeholder: 'https://dribbble.com/optistrat',
    example:    'https://dribbble.com/<usuario>',
    defaultLabel: 'Portfólio no Dribbble',
    urlHint: 'Use a URL pública do perfil.' },
];

const getMeta = (slug: string): PlatformMeta =>
  PLATFORMS.find((p) => p.value === slug) ?? PLATFORMS[0];

/**
 * Mini-preview do ícone usando a mesma técnica do componente público
 * (CSS mask do simpleicons.org) — só que aqui pintado com a cor da marca,
 * para a pessoa do admin ter feedback visual imediato.
 */
const IconPreview = ({ slug, color, size = 28 }: { slug: string; color: string; size?: number }) => {
  const url = `https://cdn.simpleicons.org/${slug}/ffffff`;
  return (
    <span
      aria-hidden="true"
      style={{
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        backgroundColor: color,
        width: size,
        height: size,
        display: 'inline-block',
      }}
    />
  );
};

const empty: SocialLink = {
  id: '', platform: 'linkedin', url: '', label: '', display_order: 0, active: true,
};

const SocialLinksManager = () => {
  const [items, setItems] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [open, setOpen] = useState(false);
  const [urlWarning, setUrlWarning] = useState<string | null>(null);
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

  // Validação leve de domínio no front (o backend reforça via allowlist).
  useEffect(() => {
    if (!editing?.url) { setUrlWarning(null); return; }
    const meta = getMeta(editing.platform);
    try {
      const u = new URL(editing.url.startsWith('http') ? editing.url : `https://${editing.url}`);
      const host = u.hostname.toLowerCase().replace(/^www\./, '');
      const ok = meta.domains.some((d) => host === d || host.endsWith(`.${d}`));
      setUrlWarning(ok ? null : `Domínio fora do padrão para ${meta.label}. Esperado: ${meta.domains.join(', ')}`);
    } catch {
      setUrlWarning('URL inválida.');
    }
  }, [editing?.url, editing?.platform]);

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

  const platformLabel = (v: string) => getMeta(v).label;
  const currentMeta = editing ? getMeta(editing.platform) : PLATFORMS[0];

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
          {items.map((s) => {
            const meta = getMeta(s.platform);
            return (
            <Card key={s.id} className={!s.active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2 gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card flex-shrink-0">
                      <IconPreview slug={meta.iconSlug} color={meta.brand} size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{meta.label}</p>
                      {s.label && <p className="text-xs text-muted-foreground">{s.label}</p>}
                    </div>
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
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Editar Rede Social' : 'Nova Rede Social'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-card flex-shrink-0">
                <IconPreview slug={currentMeta.iconSlug} color={currentMeta.brand} size={28} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{currentMeta.label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  Cor da marca: <span style={{ color: currentMeta.brand }}>{currentMeta.brand}</span>
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Plataforma *</Label>
              <Select
                value={editing?.platform || 'linkedin'}
                onValueChange={(v) => setEditing((p) => {
                  if (!p) return p;
                  const next = getMeta(v);
                  // se o rótulo estava vazio ou era o sugerido anterior, atualiza com a sugestão nova
                  const prevSuggested = getMeta(p.platform).defaultLabel;
                  const newLabel = !p.label || p.label === prevSuggested ? next.defaultLabel : p.label;
                  return { ...p, platform: v, label: newLabel };
                })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{currentMeta.urlHint}</p>
            </div>
            <div className="space-y-2">
              <Label>URL do perfil *</Label>
              <Input
                type="url"
                placeholder={currentMeta.placeholder}
                value={editing?.url || ''}
                onChange={(e) => setEditing(p => p ? { ...p, url: e.target.value } : null)}
                required
              />
              <p className="text-[11px] text-muted-foreground">Exemplo: <code className="font-mono">{currentMeta.example}</code></p>
              {urlWarning && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">⚠ {urlWarning}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Rótulo (opcional)</Label>
              <Input
                placeholder={currentMeta.defaultLabel}
                value={editing?.label || ''}
                onChange={(e) => setEditing(p => p ? { ...p, label: e.target.value } : null)}
              />
              <p className="text-[11px] text-muted-foreground">Aparece como aria-label e tooltip do ícone na página de contatos.</p>
            </div>
            <div className="space-y-2">
              <Label>Ordem de exibição</Label>
              <Input
                type="number"
                value={editing?.display_order ?? 0}
                onChange={(e) => setEditing(p => p ? { ...p, display_order: parseInt(e.target.value) || 0 } : null)}
              />
              <p className="text-[11px] text-muted-foreground">Menor número aparece primeiro.</p>
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