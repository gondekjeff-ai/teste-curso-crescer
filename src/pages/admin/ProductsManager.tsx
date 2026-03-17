import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { productSchema, sanitizeObject } from '@/lib/inputValidation';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number | null;
  active: boolean;
}

const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível carregar os produtos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const validatedData = productSchema.parse({
        name: editingProduct.name,
        description: editingProduct.description,
        category: editingProduct.category,
        price: editingProduct.price,
        active: editingProduct.active,
      });
      const sanitizedData = sanitizeObject(validatedData);

      if (editingProduct.id) {
        const { error } = await supabase.from('products').update(sanitizedData).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([sanitizedData]);
        if (error) throw error;
      }
      toast({ title: 'Produto salvo com sucesso' });
      setDialogOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error: any) {
      if (error.errors) {
        toast({ title: 'Erro de validação', description: error.errors.map((e: any) => e.message).join(', '), variant: 'destructive' });
      } else {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Produto excluído' });
      loadProducts();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const openNew = () => {
    setEditingProduct({ id: '', name: '', description: '', category: '', price: null, active: true });
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
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} produtos cadastrados</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Novo Produto
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Nenhum produto cadastrado ainda</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className={!product.active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <span className="text-xs text-muted-foreground">{product.category}</span>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingProduct(product); setDialogOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                <div className="flex items-center justify-between">
                  {product.price != null ? (
                    <span className="font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sem preço</span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    product.active ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                  }`}>
                    {product.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct?.id ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={editingProduct?.name || ''} onChange={(e) => setEditingProduct(p => p ? { ...p, name: e.target.value } : null)} required />
            </div>
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Input value={editingProduct?.category || ''} onChange={(e) => setEditingProduct(p => p ? { ...p, category: e.target.value } : null)} required />
            </div>
            <div className="space-y-2">
              <Label>Preço</Label>
              <Input type="number" step="0.01" value={editingProduct?.price ?? ''} onChange={(e) => setEditingProduct(p => p ? { ...p, price: e.target.value ? parseFloat(e.target.value) : null } : null)} />
            </div>
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Textarea value={editingProduct?.description || ''} onChange={(e) => setEditingProduct(p => p ? { ...p, description: e.target.value } : null)} rows={4} required />
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={editingProduct?.active || false} onCheckedChange={(c) => setEditingProduct(p => p ? { ...p, active: c } : null)} />
              <Label>Produto Ativo</Label>
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

export default ProductsManager;
