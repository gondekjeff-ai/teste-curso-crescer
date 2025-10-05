import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

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
  const { toast } = useToast();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar imagens',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateImage = async (id: string, updates: Partial<CarouselImage>) => {
    try {
      const { error } = await supabase
        .from('carousel_images')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Imagem atualizada',
        description: 'As alterações foram salvas com sucesso.',
      });
      loadImages();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteImage = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      const { error } = await supabase
        .from('carousel_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Imagem excluída',
        description: 'A imagem foi removida com sucesso.',
      });
      loadImages();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Carrossel</h1>
          <p className="text-muted-foreground mt-2">
            Adicione ou edite as imagens do carrossel da página inicial
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Imagem
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((image) => (
          <Card key={image.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Imagem {image.display_order}</CardTitle>
                  <CardDescription>{image.alt_text}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteImage(image.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={image.image_url}
                  alt={image.alt_text}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`alt-${image.id}`}>Texto Alternativo</Label>
                <Input
                  id={`alt-${image.id}`}
                  value={image.alt_text}
                  onChange={(e) =>
                    updateImage(image.id, { alt_text: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor={`active-${image.id}`}>
                  {image.active ? 'Ativa' : 'Inativa'}
                </Label>
                <Switch
                  id={`active-${image.id}`}
                  checked={image.active}
                  onCheckedChange={(checked) =>
                    updateImage(image.id, { active: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`order-${image.id}`}>Ordem de Exibição</Label>
                <Input
                  id={`order-${image.id}`}
                  type="number"
                  value={image.display_order}
                  onChange={(e) =>
                    updateImage(image.id, {
                      display_order: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CarouselManager;
