import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { sanitizeInput } from '@/lib/inputValidation';

interface CarouselImage {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  active: boolean;
}

const CarouselManager = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAltText, setNewAltText] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => { loadImages(); }, []);

  const loadImages = async () => {
    try {
      const data = await api.get('/admin/carousel');
      setImages(data || []);
    } catch (error: any) {
      toast({ title: 'Erro ao carregar imagens', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addImage = async () => {
    if (!newImageUrl) {
      toast({ title: 'Envie uma imagem primeiro', variant: 'destructive' });
      return;
    }
    try {
      await api.post('/admin/carousel', {
        image_url: newImageUrl,
        alt_text: sanitizeInput(newAltText || 'Imagem do carrossel'),
        display_order: images.length,
        active: true,
      });
      toast({ title: 'Imagem adicionada com sucesso' });
      setDialogOpen(false);
      setNewAltText('');
      setNewImageUrl('');
      loadImages();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const updateImage = async (id: string, updates: Partial<CarouselImage>) => {
    try {
      if (updates.alt_text) updates.alt_text = sanitizeInput(updates.alt_text);
      await api.put(`/admin/carousel/${id}`, updates);
      toast({ title: 'Atualizado' });
      loadImages();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const deleteImage = async (id: string) => {
    if (!confirm('Excluir esta imagem do carrossel?')) return;
    try {
      await api.del(`/admin/carousel/${id}`);
      toast({ title: 'Imagem excluída' });
      loadImages();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Carrossel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as imagens da página inicial ({images.length} imagens)
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Imagem
        </Button>
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Nenhuma imagem no carrossel. Adicione a primeira!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {images.map((image) => (
            <Card key={image.id} className={`overflow-hidden ${!image.active ? 'opacity-60' : ''}`}>
              <div className="aspect-video bg-muted relative">
                {image.image_url ? (
                  <img src={image.image_url} alt={image.alt_text} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="icon"
                    variant={image.active ? 'default' : 'secondary'}
                    className="h-7 w-7"
                    onClick={() => updateImage(image.id, { active: !image.active })}
                    title={image.active ? 'Desativar' : 'Ativar'}
                  >
                    {image.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7"
                    onClick={() => deleteImage(image.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3 space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs">Texto alternativo</Label>
                  <Input
                    value={image.alt_text || ''}
                    onChange={(e) => updateImage(image.id, { alt_text: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Ordem:</Label>
                  <Input
                    type="number"
                    value={image.display_order}
                    onChange={(e) => updateImage(image.id, { display_order: parseInt(e.target.value) || 0 })}
                    className="h-8 text-sm w-20"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Imagem do Carrossel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUpload
              currentUrl={newImageUrl || null}
              onUpload={(url) => setNewImageUrl(url)}
              onRemove={() => setNewImageUrl('')}
              folder="carousel"
            />
            <div className="space-y-2">
              <Label>Texto alternativo</Label>
              <Input
                value={newAltText}
                onChange={(e) => setNewAltText(e.target.value)}
                placeholder="Descrição da imagem"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={addImage} disabled={!newImageUrl}>Adicionar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarouselManager;
