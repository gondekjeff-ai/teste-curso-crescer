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

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      if (editingProduct.id) {
        // Update existing
        const { error } = await supabase
          .from('products')
          .update({
            name: editingProduct.name,
            description: editingProduct.description,
            category: editingProduct.category,
            price: editingProduct.price,
            active: editingProduct.active,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('products')
          .insert({
            name: editingProduct.name,
            description: editingProduct.description,
            category: editingProduct.category,
            price: editingProduct.price,
            active: editingProduct.active,
          });

        if (error) throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Produto salvo com sucesso',
      });

      setDialogOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o produto',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Produto excluído com sucesso',
      });

      loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o produto',
        variant: 'destructive',
      });
    }
  };

  const openNewDialog = () => {
    setEditingProduct({
      id: '',
      name: '',
      description: '',
      category: '',
      price: null,
      active: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
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
          <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
          <p className="text-muted-foreground mt-2">
            Adicione, edite ou remova produtos do site
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct?.id ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  value={editingProduct?.name || ''}
                  onChange={(e) =>
                    setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Input
                  id="category"
                  value={editingProduct?.category || ''}
                  onChange={(e) =>
                    setEditingProduct(prev => prev ? { ...prev, category: e.target.value } : null)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editingProduct?.price || ''}
                  onChange={(e) =>
                    setEditingProduct(prev => prev ? { ...prev, price: e.target.value ? parseFloat(e.target.value) : null } : null)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={editingProduct?.description || ''}
                  onChange={(e) =>
                    setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingProduct?.active || false}
                  onCheckedChange={(checked) =>
                    setEditingProduct(prev => prev ? { ...prev, active: checked } : null)
                  }
                />
                <Label htmlFor="active">Produto Ativo</Label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span className="text-lg">{product.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">{product.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-medium">Categoria: {product.category}</span>
                  <span className={`text-xs px-2 py-1 rounded ${product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {product.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {product.price && (
                  <p className="font-bold text-lg">R$ {product.price.toFixed(2)}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Nenhum produto cadastrado ainda</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductsManager;
