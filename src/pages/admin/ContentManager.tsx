import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { heroContentSchema, sanitizeObject } from '@/lib/inputValidation';

interface HeroContent {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  secondaryButtonText: string;
}

const ContentManager = () => {
  const [content, setContent] = useState<HeroContent>({
    title: '',
    subtitle: '',
    primaryButtonText: '',
    secondaryButtonText: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('section', 'hero')
        .single();

      if (error) throw error;
      if (data && data.content) {
        const contentData = data.content as any;
        setContent({
          title: contentData.title || '',
          subtitle: contentData.subtitle || '',
          primaryButtonText: contentData.primaryButtonText || '',
          secondaryButtonText: contentData.secondaryButtonText || '',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar conteúdo',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      // Sanitize all text inputs
      const sanitizedContent = sanitizeObject(content);

      // Validate content
      const validation = heroContentSchema.safeParse(sanitizedContent);
      
      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || 'Dados inválidos';
        toast({
          title: 'Erro de validação',
          description: errorMessage,
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('site_content')
        .update({ content: validation.data as any })
        .eq('section', 'hero');

      if (error) throw error;

      toast({
        title: 'Conteúdo salvo',
        description: 'As alterações foram salvas com sucesso e já estão visíveis no site.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Conteúdo</h1>
        <p className="text-muted-foreground mt-2">
          Edite os textos da seção Hero da página inicial
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seção Hero</CardTitle>
          <CardDescription>
            Atualize o título, subtítulo e textos dos botões
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título Principal</Label>
            <Input
              id="title"
              value={content.title}
              onChange={(e) =>
                setContent({ ...content, title: e.target.value })
              }
              placeholder="Título da página"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo</Label>
            <Textarea
              id="subtitle"
              value={content.subtitle}
              onChange={(e) =>
                setContent({ ...content, subtitle: e.target.value })
              }
              placeholder="Descrição da página"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryButton">Botão Primário</Label>
              <Input
                id="primaryButton"
                value={content.primaryButtonText}
                onChange={(e) =>
                  setContent({ ...content, primaryButtonText: e.target.value })
                }
                placeholder="Texto do botão principal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryButton">Botão Secundário</Label>
              <Input
                id="secondaryButton"
                value={content.secondaryButtonText}
                onChange={(e) =>
                  setContent({
                    ...content,
                    secondaryButtonText: e.target.value,
                  })
                }
                placeholder="Texto do botão secundário"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={saveContent} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Pré-visualização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{content.title}</h2>
            <p className="text-muted-foreground">{content.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button>{content.primaryButtonText}</Button>
            <Button variant="outline">{content.secondaryButtonText}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManager;
