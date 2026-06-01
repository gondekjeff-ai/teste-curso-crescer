import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Briefcase, Download, Trash2, Eye } from 'lucide-react';

interface CareerApplication {
  id: string;
  full_name: string;
  city: string;
  state: string;
  cep: string;
  phone: string;
  email: string;
  cv_filename: string;
  cv_mime: string;
  cv_size_bytes: number;
  notes: string | null;
  status: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  new: 'Nova',
  reviewing: 'Em análise',
  contacted: 'Contatado',
  hired: 'Contratado',
  rejected: 'Rejeitado',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  new: 'default',
  reviewing: 'secondary',
  contacted: 'secondary',
  hired: 'default',
  rejected: 'destructive',
};

const CareersManager = () => {
  const [items, setItems] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CareerApplication | null>(null);
  const [editStatus, setEditStatus] = useState<string>('new');
  const [editNotes, setEditNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await api.get('/admin/career-applications');
      setItems(data || []);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar os currículos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (item: CareerApplication) => {
    setSelected(item);
    setEditStatus(item.status);
    setEditNotes(item.notes || '');
  };

  const downloadCv = async (item: CareerApplication) => {
    try {
      const token = api.getToken();
      const res = await fetch(`/api/admin/career-applications/${item.id}/cv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Falha ao baixar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.cv_filename || 'curriculo.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível baixar o currículo', variant: 'destructive' });
    }
  };

  const viewCv = async (item: CareerApplication) => {
    try {
      const token = api.getToken();
      const res = await fetch(`/api/admin/career-applications/${item.id}/cv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Falha');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível abrir o currículo', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await api.put(`/admin/career-applications/${selected.id}`, {
        status: editStatus, notes: editNotes,
      });
      setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
      toast({ title: 'Atualizado', description: 'Candidatura atualizada com sucesso' });
      setSelected(null);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: CareerApplication) => {
    if (!confirm(`Excluir a candidatura de ${item.full_name}?`)) return;
    try {
      await api.del(`/admin/career-applications/${item.id}`);
      setItems(prev => prev.filter(i => i.id !== item.id));
      toast({ title: 'Excluído', description: 'Candidatura removida' });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível excluir', variant: 'destructive' });
    }
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
        <h1 className="text-2xl font-bold">Currículos Recebidos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Candidaturas enviadas pelo formulário da página de carreiras
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Nenhum currículo recebido ainda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Localidade</TableHead>
                  <TableHead className="hidden lg:table-cell">Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Recebido</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.full_name}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {item.city}/{item.state}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      <div>{item.email}</div>
                      <div className="text-muted-foreground">{item.phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[item.status] || 'secondary'}>
                        {STATUS_LABEL[item.status] || item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openDetail(item)} title="Detalhes">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => downloadCv(item)} title="Baixar CV">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(item)} title="Excluir">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.full_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Cidade:</span> {selected.city}</div>
                <div><span className="text-muted-foreground">UF:</span> {selected.state}</div>
                <div><span className="text-muted-foreground">CEP:</span> {selected.cep}</div>
                <div><span className="text-muted-foreground">Telefone:</span> {selected.phone}</div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">E-mail:</span>{' '}
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline">{selected.email}</a>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => viewCv(selected)}>
                  <Eye className="h-4 w-4 mr-1" /> Abrir CV
                </Button>
                <Button size="sm" variant="outline" onClick={() => downloadCv(selected)}>
                  <Download className="h-4 w-4 mr-1" /> Baixar CV
                </Button>
                <span className="text-xs text-muted-foreground self-center">
                  {(selected.cv_size_bytes / 1024).toFixed(0)} KB · {selected.cv_filename}
                </span>
              </div>
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABEL).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Anotações internas</label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Observações sobre a candidatura..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareersManager;