import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Mail, User, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from "@/integrations/supabase/client";

// Updated schema with honeypot field validation
const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Por favor, insira um endereço de e-mail válido'),
  message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres'),
  honeypot: z.string().max(0, 'Bot detectado'), // Honeypot field must be empty
  timestamp: z.number() // To prevent automated quick submissions
});

type FormValues = z.infer<typeof formSchema>;

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStartTime] = useState<number>(Date.now()); // Track when form was opened
  
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      honeypot: '',
      timestamp: formStartTime
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Bot checks
      // 1. Honeypot check - should be caught by zod, but double-check
      if (data.honeypot) {
        console.log('Bot detected via honeypot');
        toast({
          title: "Erro",
          description: "Houve um problema com seu envio. Tente novamente.",
          variant: "destructive"
        });
        return;
      }
      
      // 2. Time-based check - Submission should take at least 3 seconds (too fast is likely a bot)
      const timeDiff = Date.now() - data.timestamp;
      if (timeDiff < 3000) {
        console.log(`Bot detected: Form submitted too quickly (${timeDiff}ms)`);
        toast({
          title: "Erro",
          description: "Por favor, reserve um momento para revisar sua mensagem antes de enviar.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log('Form submitted:', data);
      
      // Save contact to database
      const { error: dbError } = await supabase
        .from('contacts')
        .insert({
          name: data.name,
          email: data.email,
          message: data.message
        });

      if (dbError) {
        console.error('Error saving contact:', dbError);
        // Continue with email sending even if database save fails
      }

      // Send email
      const response = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: data.name,
          email: data.email,
          message: data.message,
          type: 'contact'
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Falha ao enviar mensagem');
      }
      
      console.log('Email sent successfully:', response);
      
      toast({
        title: "Mensagem enviada!",
        description: "Recebemos sua mensagem e entraremos em contato em breve.",
        variant: "default"
      });

      form.reset({
        name: '',
        email: '',
        message: '',
        honeypot: '',
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      
      toast({
        title: "Erro",
        description: error.message || "Houve um problema ao enviar sua mensagem. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return <section id="contact" className="bg-gradient-to-b from-background to-secondary text-foreground relative py-[25px]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mb-3 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
            Entre em Contato
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Fale Conosco Hoje
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tem dúvidas sobre nossas soluções de gestão de TI? Entre em contato com nossa equipe e vamos discutir como podemos ajudar a transformar sua infraestrutura tecnológica.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="bg-card rounded-xl shadow-xl p-8 border border-border">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="name" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-card-foreground">Nome</FormLabel>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input placeholder="Seu nome" className="pl-10" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="email" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-card-foreground">E-mail</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input type="email" placeholder="seu.email@exemplo.com" className="pl-10" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>} />
                
                <FormField control={form.control} name="message" render={({
                field
              }) => <FormItem>
                      <FormLabel className="text-card-foreground">Mensagem</FormLabel>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Textarea placeholder="Conte-nos sobre seu projeto ou consulta..." className="min-h-[120px] pl-10 resize-none" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>} />
                
                {/* Honeypot field - hidden from real users but bots will fill it */}
                <FormField control={form.control} name="honeypot" render={({
                field
              }) => <FormItem className="hidden">
                      <FormLabel>Deixe isso vazio</FormLabel>
                      <FormControl>
                        <Input {...field} tabIndex={-1} />
                      </FormControl>
                    </FormItem>} />
                
                {/* Hidden timestamp field */}
                <FormField control={form.control} name="timestamp" render={({
                field
              }) => <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>} />
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-md transition-colors flex items-center justify-center disabled:opacity-70">
                  {isSubmitting ? "Enviando..." : <>
                      Enviar Mensagem
                      <Send className="ml-2 h-4 w-4" />
                    </>}
                </button>
              </form>
            </Form>
          </div>
          
          <div className="space-y-8">
            <div className="bg-card p-6 rounded-lg shadow-md border border-border">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Envie-nos um E-mail</h3>
              <p className="text-muted-foreground mb-2">Para consultas gerais:</p>
              <a href="mailto:comercial@optistrat.com.br" className="text-primary hover:underline">comercial@optistrat.com.br</a>
              <p className="text-muted-foreground mt-2 mb-2">
            </p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};

export default ContactForm;