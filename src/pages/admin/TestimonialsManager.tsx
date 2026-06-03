import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Quote } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Testimonial {
  id: string;
  opinion: string;
  person_name: string;
  company: string;
  display_order: number;
  active: boolean;
}

const empty: Testimonial = {
  id: '', opinion: '', person_name: '', company: '', display_order: 0, active: true,
};

const TestimonialsManager = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await api.get('/admin/testimonials');
      setItems(data || []);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar os depoimentos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const payload = {
      opinion: editing.opinion.trim(),
      person_name: editing.person_name.trim(),
      company: editing.company.trim(),
      display_order: Number(editing.display_order) || 0,
      active: editing.active,
    };
    if (!payload.opinion || !payload.person_name || !payload.company) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    try {
      if (editing.id) {
        await api.put(`/admin/testimonials/${editing.id}`, payload);
      } else {
        await api.post('/admin/testimonials', payload);
      }
      toast({ title: 'Depoimento salvo' });
      setOpen(false);
      setEditing(null);
      await load();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir este depoimento?')) return;
    try {
      await api.del(`/admin/testimonials/${id}`);
      toast({ title: 'Depoimento excluído' });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Opiniões de Clientes/Parceiros</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} depoimento(s) cadastrado(s)
          </p>
        </div>
        <Button onClick={() => { setEditing({ ...empty }); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Novo Depoimento
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Quote className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Nenhum depoimento cadastrado ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((t) => (
            <Card key={t.id} className={!t.active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Quote className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => { setEditing(t); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                      onClick={() => remove(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm italic text-foreground mb-3 line-clamp-4">
                  "{t.opinion}"
                </p>
                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{t.person_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.company}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    t.active ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                  }`}>
                    {t.active ? 'Ativo' : 'Inativo'}
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
            <DialogTitle>{editing?.id ? 'Editar Depoimento' : 'Novo Depoimento'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label>Opinião *</Label>
              <Textarea
                rows={5}
                value={editing?.opinion || ''}
                onChange={(e) => setEditing(p => p ? { ...p, opinion: e.target.value } : null)}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={editing?.person_name || ''}
                  onChange={(e) => setEditing(p => p ? { ...p, person_name: e.target.value } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Empresa / Parceiro *</Label>
                <Input
                  value={editing?.company || ''}
                  onChange={(e) => setEditing(p => p ? { ...p, company: e.target.value } : null)}
                  required
                />
              </div>
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

export default TestimonialsManager;