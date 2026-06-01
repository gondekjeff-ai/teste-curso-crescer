import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';
import {
  ArrowLeft, Mail, Sparkles, Rocket, Users, HeartHandshake,
  Upload, CheckCircle2, FileText, Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import careersHero from '@/assets/careers-hero.jpg';
import careersCulture from '@/assets/careers-culture.jpg';
import careersGrowth from '@/assets/careers-growth.jpg';

const MAX_CV_BYTES = 5 * 1024 * 1024;
const UF_LIST = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB',
  'PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const BENEFITS = [
  {
    icon: Rocket,
    title: 'Crescimento real',
    description: 'Trilhas de carreira, certificações pagas e mentoria com profissionais sêniores.',
  },
  {
    icon: HeartHandshake,
    title: 'Cultura humana',
    description: 'Time colaborativo, feedback frequente e respeito ao seu tempo fora do trabalho.',
  },
  {
    icon: Sparkles,
    title: 'Projetos relevantes',
    description: 'Você atua em soluções que impactam empresas de diferentes setores no Brasil.',
  },
  {
    icon: Users,
    title: 'Diversidade & inclusão',
    description: 'Valorizamos pessoas de diferentes origens, formações e níveis de experiência.',
  },
];

const formatCep = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};
const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const Careers = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    full_name: '', city: '', state: '', cep: '', phone: '', email: '',
  });
  const [cv, setCv] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleFile = (file: File | null) => {
    if (!file) { setCv(null); return; }
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!isPdf) {
      toast({
        title: 'Formato inválido',
        description: 'Aceitamos apenas arquivos em formato PDF.',
        variant: 'destructive',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      toast({
        title: 'Arquivo muito grande',
        description: `O currículo deve ter no máximo 5MB. Enviado: ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
        variant: 'destructive',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setCv(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cv) {
      toast({ title: 'Anexe seu currículo', description: 'É necessário enviar um PDF com seu currículo.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('cv', cv);
      const res = await fetch('/api/careers/apply', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Falha ao enviar');
      setSubmitted(true);
      toast({ title: 'Candidatura enviada!', description: 'Recebemos seu currículo. Entraremos em contato em breve.' });
      setForm({ full_name: '', city: '', state: '', cep: '', phone: '', email: '' });
      setCv(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Não foi possível enviar.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageLayout showContact={false}>
        <SEO
          title="Carreiras na OptiStrat — Trabalhe com gestão de TI"
          description="Junte-se à OptiStrat. Envie seu currículo e descubra oportunidades para profissionais apaixonados por tecnologia."
        />

        {/* HERO */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <img
              src={careersHero}
              alt="Equipe OptiStrat colaborando em um escritório moderno"
              className="w-full h-full object-cover"
              width={1536}
              height={1024}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Início
            </Link>

            <div className="max-w-2xl">
              <motion.span
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-5"
              >
                <Sparkles className="h-3.5 w-3.5" /> Estamos contratando
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl font-bold mb-5 leading-tight"
              >
                Construa o futuro da TI com a gente.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-lg text-muted-foreground mb-8"
              >
                Na OptiStrat, juntamos pessoas curiosas e ambiciosas para transformar a forma
                como empresas brasileiras gerenciam tecnologia. Se você quer aprender, evoluir e
                deixar sua marca em projetos reais — esse é o seu lugar.
              </motion.p>
              <Button asChild size="lg" className="font-medium">
                <a href="#enviar-curriculo">
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar meu currículo
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-3">Por que a OptiStrat?</h2>
              <p className="text-muted-foreground">
                Mais do que um emprego, oferecemos um ambiente para você crescer rodeado de pessoas que se importam.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CULTURE STRIP */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden aspect-[4/3]"
            >
              <img src={careersCulture} alt="Time colaborando" className="w-full h-full object-cover" loading="lazy" width={1280} height={896} />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold mb-4">Pessoas no centro de tudo</h2>
              <p className="text-muted-foreground mb-4">
                Acreditamos que tecnologia boa nasce de times bons. Aqui você encontra autonomia,
                tempo para aprender, e colegas dispostos a te ajudar sempre que precisar.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  'Modelo híbrido com flexibilidade de horário',
                  'Plano de carreira claro e revisões periódicas',
                  'Apoio a certificações Microsoft, AWS, Cisco e outras',
                  'Programas de mentoria para iniciantes em TI',
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold mb-4">Aprenda com quem entende</h2>
              <p className="text-muted-foreground">
                Você terá acesso direto a especialistas em infraestrutura, segurança e cloud.
                Nossa cultura de mentoria garante que você nunca esteja sozinho — seja no
                primeiro dia ou em um projeto crítico.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:rh@optistrat.com.br" className="hover:text-primary transition-colors">
                  rh@optistrat.com.br
                </a>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 relative rounded-2xl overflow-hidden aspect-[4/3]"
            >
              <img src={careersGrowth} alt="Mentoria entre colegas" className="w-full h-full object-cover" loading="lazy" width={1280} height={896} />
            </motion.div>
          </div>
        </section>

        {/* APPLICATION FORM */}
        <section id="enviar-curriculo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-4">
                <FileText className="h-3.5 w-3.5" /> Cadastre seu currículo
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Envie seus dados</h2>
              <p className="text-muted-foreground">
                Preencha o formulário abaixo e anexe seu currículo em PDF (máx. 5MB). Entraremos em contato sempre que houver uma vaga compatível com seu perfil.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="h-14 w-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Candidatura enviada!</h3>
                  <p className="text-muted-foreground mb-6">
                    Recebemos seus dados e seu currículo. Nosso time de RH irá analisar com carinho e responder pelo e-mail informado.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>Enviar outra candidatura</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome completo *</Label>
                    <Input
                      id="full_name" required maxLength={150}
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="Como devemos te chamar?"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city" required maxLength={100}
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="Ex: São Paulo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado *</Label>
                      <Select
                        value={form.state}
                        onValueChange={(v) => setForm({ ...form, state: v })}
                      >
                        <SelectTrigger id="state"><SelectValue placeholder="UF" /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {UF_LIST.map((uf) => (
                            <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP *</Label>
                      <Input
                        id="cep" required inputMode="numeric"
                        value={form.cep}
                        onChange={(e) => setForm({ ...form, cep: formatCep(e.target.value) })}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone (WhatsApp) *</Label>
                      <Input
                        id="phone" required inputMode="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail de contato *</Label>
                    <Input
                      id="email" type="email" required maxLength={255}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="voce@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cv">Currículo (PDF, máx. 5MB) *</Label>
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        id="cv" type="file" accept="application/pdf,.pdf"
                        onChange={(e) => handleFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        required
                      />
                      <div className={`flex items-center gap-3 rounded-md border border-dashed px-4 py-5 transition-colors ${
                        cv ? 'border-primary/50 bg-primary/5' : 'border-input hover:border-primary/40'
                      }`}>
                        <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          {cv ? <FileText className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          {cv ? (
                            <>
                              <p className="text-sm font-medium truncate">{cv.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(cv.size / 1024).toFixed(0)} KB · clique para trocar
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium">Clique para selecionar seu currículo</p>
                              <p className="text-xs text-muted-foreground">Somente arquivos PDF até 5MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
                    ) : (
                      <>Enviar candidatura</>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Ao enviar, você concorda em compartilhar seus dados conosco para fins de recrutamento.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </PageLayout>
    </div>
  );
};

export default Careers;
