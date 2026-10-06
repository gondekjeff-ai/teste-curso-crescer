import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, Package, RefreshCw, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { notifyProductsUpdated } from '@/lib/productsSync';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { productSchema, sanitizeObject } from '@/lib/inputValidation';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number | null;
  active: boolean;
  ai_content?: any;
  cover_image_url?: string | null;
  gallery?: { url: string; caption: string }[];
  highlights?: string | null;
  ai_generated_at?: string | null;
}

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Máscara de moeda: usuário digita apenas dígitos, formata como R$ 0,00 */
const formatCurrencyInput = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return brl(Number(digits) / 100);
};
const parseCurrencyInput = (raw: string): number | null => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  return Number(digits) / 100;
};

const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await api.get('/admin/products');
      const normalized = (data || []).map((p: any) => ({
        ...p,
        price: p.price === null || p.price === undefined || p.price === ''
          ? null
          : Number(p.price),
      }));
      setProducts(normalized);
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível carregar os produtos', variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const interval = setInterval(() => loadProducts(true), 5000);
    return () => clearInterval(interval);
  }, [loadProducts]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const validatedData = productSchema.parse({
        name: editingProduct.name,
        description: editingProduct.description,
        category: editingProduct.category,
        price: editingProduct.price ?? undefined,
        active: editingProduct.active,
      });
      const sanitizedData = {
        ...sanitizeObject(validatedData),
        cover_image_url: editingProduct.cover_image_url || null,
        gallery: (editingProduct.gallery || []).filter(g => g.url),
        highlights: editingProduct.highlights || '',
      };

      if (editingProduct.id) {
        await api.put(`/admin/products/${editingProduct.id}`, sanitizedData);
      } else {
        await api.post('/admin/products', sanitizedData);
      }
      toast({ title: 'Produto salvo com sucesso' });
      setDialogOpen(false);
      setEditingProduct(null);
      await loadProducts(true);
      notifyProductsUpdated();
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
      await api.del(`/admin/products/${id}`);
      toast({ title: 'Produto excluído' });
      await loadProducts(true);
      notifyProductsUpdated();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  /** Ativa/desativa apenas o produto selecionado, sem tocar nos demais */
  const handleToggleActive = async (product: Product, active: boolean) => {
    setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, active } : p)));
    try {
      await api.put(`/admin/products/${product.id}`, {
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        active,
      });
      toast({ title: active ? 'Produto ativado' : 'Produto desativado' });
      await loadProducts(true);
      notifyProductsUpdated();
    } catch (error: any) {
      setProducts(prev => prev.map(p => (p.id === product.id ? { ...p, active: !active } : p)));
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleGenerateAiPage = async (product: Product) => {
    setGeneratingId(product.id);
    try {
      await api.post(`/admin/products/${product.id}/ai-page`, {});
      toast({ title: 'Página gerada pela IA', description: 'Conteúdo baseado exclusivamente na descrição cadastrada.' });
      await loadProducts(true);
    } catch (error: any) {
      toast({ title: 'Erro ao gerar página', description: error.message, variant: 'destructive' });
    } finally {
      setGeneratingId(null);
    }
  };

  const handleClearAiPage = async (product: Product) => {
    try {
      await api.del(`/admin/products/${product.id}/ai-page`);
      toast({ title: 'Conteúdo de IA removido' });
      await loadProducts(true);
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const openNew = () => {
    setEditingProduct({ id: '', name: '', description: '', category: '', price: null, active: true, cover_image_url: null, gallery: [], highlights: '' });
    setPriceInput('');
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct({ ...product, gallery: Array.isArray(product.gallery) ? product.gallery : [] });
    setPriceInput(product.price != null ? brl(product.price) : '');
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
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Produtos</h1>
            <p className="text-sm text-muted-foreground mt-1">{products.length} produtos cadastrados</p>
          </div>
          {refreshing && (
            <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
          )}
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
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(product)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                <div className="flex items-center justify-between">
                  {product.price != null && !Number.isNaN(product.price) ? (
                    <span className="font-bold text-primary">{brl(product.price)}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sem preço</span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {product.active ? 'No menu' : 'Fora do menu'}
                    </span>
                    <Switch
                      checked={product.active}
                      onCheckedChange={(c) => handleToggleActive(product, c)}
                      aria-label={product.active ? 'Desativar produto' : 'Ativar produto'}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={generatingId === product.id}
                    onClick={() => handleGenerateAiPage(product)}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-2" />
                    {generatingId === product.id
                      ? 'Gerando...'
                      : product.ai_content ? 'Regerar página IA' : 'Gerar página IA'}
                  </Button>
                  {product.ai_content && (
                    <Button variant="ghost" size="sm" onClick={() => handleClearAiPage(product)}>
                      Limpar
                    </Button>
                  )}
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
              <Label>Valor (R$)</Label>
              <Input
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={priceInput}
                onChange={(e) => {
                  setPriceInput(formatCurrencyInput(e.target.value));
                  const value = parseCurrencyInput(e.target.value);
                  setEditingProduct(p => (p ? { ...p, price: value } : null));
                }}
              />
              <p className="text-xs text-muted-foreground">Formato em Real brasileiro. Deixe vazio para não exibir preço.</p>
            </div>
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Textarea value={editingProduct?.description || ''} onChange={(e) => setEditingProduct(p => p ? { ...p, description: e.target.value } : null)} rows={4} required />
            </div>
            <div className="space-y-2">
              <Label>Destaques da solução</Label>
              <Textarea
                value={editingProduct?.highlights || ''}
                onChange={(e) => setEditingProduct(p => p ? { ...p, highlights: e.target.value } : null)}
                rows={4}
                placeholder={"Um destaque por linha\nEx.: Implantação em até 30 dias"}
              />
              <p className="text-xs text-muted-foreground">Cada linha vira um card de destaque na página.</p>
            </div>
            <div className="space-y-2">
              <Label>Imagem de capa</Label>
              <ImageUpload
                folder="products"
                currentUrl={editingProduct?.cover_image_url}
                onUpload={(url) => setEditingProduct(p => p ? { ...p, cover_image_url: url } : null)}
                onRemove={() => setEditingProduct(p => p ? { ...p, cover_image_url: null } : null)}
              />
              <p className="text-xs text-muted-foreground">Recomendado: imagem horizontal. O site ajusta o tamanho automaticamente.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Galeria de imagens</Label>
                <Button
                  type="button" variant="outline" size="sm"
                  disabled={(editingProduct?.gallery?.length || 0) >= 12}
                  onClick={() => setEditingProduct(p => p ? { ...p, gallery: [...(p.gallery || []), { url: '', caption: '' }] } : null)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
                </Button>
              </div>
              {(editingProduct?.gallery || []).map((g, i) => (
                <div key={i} className="rounded-md border border-border p-3 space-y-2">
                  <ImageUpload
                    folder="products"
                    currentUrl={g.url || null}
                    onUpload={(url) => setEditingProduct(p => p ? { ...p, gallery: (p.gallery || []).map((x, j) => j === i ? { ...x, url } : x) } : null)}
                    onRemove={() => setEditingProduct(p => p ? { ...p, gallery: (p.gallery || []).map((x, j) => j === i ? { ...x, url: '' } : x) } : null)}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Legenda (opcional)"
                      maxLength={200}
                      value={g.caption}
                      onChange={(e) => setEditingProduct(p => p ? { ...p, gallery: (p.gallery || []).map((x, j) => j === i ? { ...x, caption: e.target.value } : x) } : null)}
                    />
                    <Button
                      type="button" variant="ghost" size="icon" className="text-destructive"
                      onClick={() => setEditingProduct(p => p ? { ...p, gallery: (p.gallery || []).filter((_, j) => j !== i) } : null)}
                      aria-label="Remover imagem"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Até 12 imagens, exibidas em grade com tamanho padronizado.</p>
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
