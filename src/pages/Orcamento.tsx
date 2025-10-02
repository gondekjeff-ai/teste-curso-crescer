import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const services = [
  "Consultoria em TI",
  "Gerenciamento de Rede",
  "Segurança Cibernética",
  "Cloud Computing",
  "Backup Automático",
  "Suporte Técnico 24h",
  "Desenvolvimento de Software",
  "Infraestrutura de TI",
];

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  services: z.array(z.string()).min(1, "Selecione pelo menos um serviço"),
  implementation_deadline: z.string().min(1, "Selecione um prazo"),
});

const Orcamento = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      services: [],
      implementation_deadline: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Save to Supabase
      const { error: dbError } = await supabase.from("orders").insert({
        name: values.name,
        email: values.email,
        services: values.services,
        implementation_deadline: values.implementation_deadline,
      });

      if (dbError) throw dbError;

      // Send email
      const { error: emailError } = await supabase.functions.invoke(
        "send-order-email",
        {
          body: {
            name: values.name,
            email: values.email,
            services: values.services,
            implementation_deadline: values.implementation_deadline,
          },
        }
      );

      if (emailError) {
        console.error("Email error:", emailError);
        toast.error("Orçamento salvo, mas houve erro ao enviar email");
      } else {
        toast.success("Orçamento enviado com sucesso!");
      }

      form.reset();
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao enviar orçamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center">
            Solicite seu Orçamento
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Preencha o formulário abaixo e nossa equipe entrará em contato com uma proposta personalizada.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="services"
                render={() => (
                  <FormItem>
                    <FormLabel>Serviços de Interesse</FormLabel>
                    <div className="space-y-3 mt-2">
                      {services.map((service) => (
                        <FormField
                          key={service}
                          control={form.control}
                          name="services"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={service}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(service)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            service,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== service
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {service}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="implementation_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo de Implantação</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o prazo desejado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="urgente">Urgente (até 1 semana)</SelectItem>
                        <SelectItem value="1-mes">Até 1 mês</SelectItem>
                        <SelectItem value="2-3-meses">2 a 3 meses</SelectItem>
                        <SelectItem value="3-6-meses">3 a 6 meses</SelectItem>
                        <SelectItem value="flexivel">Flexível</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Solicitar Orçamento"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
};

export default Orcamento;
