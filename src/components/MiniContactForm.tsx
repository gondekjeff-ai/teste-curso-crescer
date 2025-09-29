import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, User, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Por favor, insira um endereço de e-mail válido'),
  honeypot: z.string().max(0, 'Bot detectado'),
  timestamp: z.number()
});

type FormValues = z.infer<typeof formSchema>;

const MiniContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStartTime] = useState<number>(Date.now());
  
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      honeypot: '',
      timestamp: formStartTime
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Bot checks
      if (data.honeypot) {
        toast({
          title: "Erro",
          description: "Houve um problema com seu envio. Tente novamente.",
          variant: "destructive"
        });
        return;
      }
      
      const timeDiff = Date.now() - data.timestamp;
      if (timeDiff < 3000) {
        toast({
          title: "Erro", 
          description: "Por favor, reserve um momento para revisar suas informações antes de enviar.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Save contact to database
      const { error: dbError } = await supabase
        .from('contacts')
        .insert({
          name: data.name,
          email: data.email,
          message: `Interesse em contato via mini formulário - Nome: ${data.name}, Email: ${data.email}`
        });

      if (dbError) {
        console.error('Error saving contact:', dbError);
      }

      // Send email
      const response = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: data.name,
          email: data.email,
          message: `Interesse em contato via mini formulário`,
          type: 'mini-contact'
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Falha ao enviar contato');
      }
      
      toast({
        title: "Contato enviado!",
        description: "Recebemos suas informações e entraremos em contato em breve.",
        variant: "default"
      });

      form.reset({
        name: '',
        email: '',
        honeypot: '',
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error('Error sending contact:', error);
      
      toast({
        title: "Erro",
        description: error.message || "Houve um problema ao enviar seu contato. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-card-foreground mb-2">Entre em Contato</h3>
        <p className="text-muted-foreground text-sm">Deixe seus dados e entraremos em contato</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-card-foreground">Nome</FormLabel>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="Seu nome" className="pl-10" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-card-foreground">E-mail</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input type="email" placeholder="seu.email@exemplo.com" className="pl-10" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Honeypot field */}
          <FormField
            control={form.control}
            name="honeypot"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>Deixe isso vazio</FormLabel>
                <FormControl>
                  <Input {...field} tabIndex={-1} />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Hidden timestamp field */}
          <FormField
            control={form.control}
            name="timestamp"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input type="hidden" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md transition-colors flex items-center justify-center disabled:opacity-70 text-sm"
          >
            {isSubmitting ? "Enviando..." : (
              <>
                Enviar Contato
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </Form>
    </div>
  );
};

export default MiniContactForm;