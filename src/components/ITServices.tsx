import { useEffect, useRef, useState } from 'react';
import { Shield, Cloud, Server, Database, Monitor, Wifi, ArrowRight, MessageSquare, CheckCircle, Code, Settings, Users } from "lucide-react";
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from "@/components/ui/button";
import { useScrollHijack } from '@/hooks/useScrollHijack';
import OrcamentoDialog from '@/components/OrcamentoDialog';

const ITServices = () => {
  const servicesRef = useRef<HTMLDivElement>(null);
  const hijackSectionRef = useRef<HTMLDivElement>(null);
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const [orcamentoDialogOpen, setOrcamentoDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const services = [
    {
      icon: <Cloud className="w-10 h-10 text-white transition-transform duration-300 transform" />,
      title: "Infraestrutura em Nuvem",
      description: "Serviços abrangentes de migração e gerenciamento em nuvem com plataformas AWS, Azure e Google Cloud para soluções empresariais escaláveis.",
      image: "/lovable-uploads/48e540e5-6a25-44e4-b3f7-80f3bfc2777a.png"
    },
    {
      icon: <Shield className="w-10 h-10 text-white transition-transform duration-300 transform" />,
      title: "Cibersegurança",
      description: "Detecção avançada de ameaças, resposta a incidentes e auditorias de segurança abrangentes para proteger seus ativos digitais e dados empresariais.",
      image: "/lovable-uploads/48ecf6e2-5a98-4a9d-af6f-ae2265cd4098.png"
    },
    {
      icon: <Server className="w-10 h-10 text-white transition-transform duration-300 transform" />,
      title: "Gerenciamento de Rede",
      description: "Monitoramento de rede 24/7, otimização e solução de problemas para garantir conectividade confiável e desempenho máximo.",
      image: "/lovable-uploads/cf8966e3-de0d-445f-9fbd-ee6c48daa7ff.png"
    },
    {
      icon: <Database className="w-10 h-10 text-white transition-transform duration-300 transform" />,
      title: "Gestão de Dados",
      description: "Backup seguro de dados, soluções de recuperação e otimização de banco de dados para proteger e organizar suas informações críticas de negócios.",
      image: "/lovable-uploads/6739bd63-bf19-4abd-bb23-0b613bbf7ac8.png"
    }
  ];

  const { isHijacked, currentIndex } = useScrollHijack(hijackSectionRef, services.length);

  const handleOrcamentoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOrcamentoDialogOpen(true);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-in');
          (entry.target as HTMLElement).style.opacity = '1';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    if (servicesRef.current) {
      const elements = servicesRef.current.querySelectorAll('.service-item');
      elements.forEach(el => {
        if (!el.classList.contains('animate-slide-in')) {
          (el as HTMLElement).style.opacity = '0';
          observer.observe(el);
        }
      });
    }
    return () => observer.disconnect();
  }, []);

  const caseStudies = [{
    image: "/lovable-uploads/843446fe-638e-4efb-b885-ed3cd505325a.png",
    title: "Migração Empresarial para Nuvem",
    description: "Migração bem-sucedida de empresa com 500+ funcionários para AWS, reduzindo custos de TI em 40% enquanto melhora a confiabilidade e desempenho do sistema."
  }, {
    image: "/lovable-uploads/5463c9c5-0946-4280-a14b-17636ff69a98.png",
    title: "Revisão de Infraestrutura de Segurança",
    description: "Implementação de framework abrangente de cibersegurança para empresa de serviços financeiros, alcançando 99,9% de taxa de prevenção de ameaças."
  }, {
    image: "/lovable-uploads/c5f8ee24-9815-4ebe-b65d-6f3d449feb8b.png",
    title: "Otimização de Rede",
    description: "Redesenho da infraestrutura de rede para empresa de manufatura, melhorando as velocidades de transferência de dados em 300% e eliminando tempo de inatividade."
  }];

  const processSteps = [{
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Consulta e Avaliação",
    description: "Análise abrangente da sua infraestrutura atual de TI e requisitos empresariais"
  }, {
    icon: <Settings className="h-10 w-10 text-primary" />,
    title: "Planejamento Estratégico",
    description: "Roadmap personalizado de TI alinhado com seus objetivos e metas de crescimento empresarial"
  }, {
    icon: <Code className="h-10 w-10 text-primary" />,
    title: "Implementação",
    description: "Implantação especializada com interrupção mínima às suas operações diárias"
  }, {
    icon: <Monitor className="h-10 w-10 text-primary" />,
    title: "Suporte Contínuo",
    description: "Monitoramento e manutenção 24/7 para garantir desempenho otimizado"
  }];

  return <>
      <section id="features" className="relative bg-background overflow-hidden py-10 md:py-[50px] w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8" ref={servicesRef}> 
          <div className="text-center mb-10 max-w-3xl mx-auto service-item">
            <div className="inline-block mb-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Serviços de Gestão de TI
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">Soluções Completas de TI</h2>
            <p className="text-muted-foreground mt-4">
              A OptiStrat oferece serviços abrangentes de gestão de TI que transformam sua infraestrutura tecnológica em uma vantagem competitiva para seu negócio.
            </p>
          </div>
          
          {/* Scroll-hijacked services section */}
          <div 
            ref={hijackSectionRef}
            className={cn(
              "relative transition-all duration-500",
              isHijacked ? "fixed inset-0 z-50 bg-primary" : "grid grid-cols-1 md:grid-cols-2 gap-5"
            )}
            style={{ height: isHijacked ? '100vh' : 'auto' }}
          >
            {isHijacked && (
              <div className="absolute top-4 right-4 z-10 text-white text-sm opacity-70">
                {currentIndex + 1} / {services.length}
              </div>
            )}
            
            {services.map((service, index) => (
              <div 
                key={index} 
                className={cn(
                  "service-item rounded-xl overflow-hidden transform transition-all duration-500 relative shadow-lg",
                  isHijacked 
                    ? cn(
                        "absolute inset-0 w-full h-full",
                        index === currentIndex 
                          ? "opacity-100 translate-x-0" 
                          : index < currentIndex 
                            ? "opacity-0 -translate-x-full" 
                            : "opacity-0 translate-x-full"
                      )
                    : "hover:-translate-y-1 h-[280px] bg-gradient-to-br from-primary to-secondary"
                )}
                style={{
                  transitionDelay: isHijacked ? '0ms' : `${index * 100}ms`
                }}
                onMouseEnter={() => !isHijacked && setHoveredService(index)} 
                onMouseLeave={() => !isHijacked && setHoveredService(null)}
              >
                <div className={cn(
                  "relative z-10 flex flex-col justify-center",
                  isHijacked 
                    ? "p-16 h-full text-center items-center" 
                    : "p-6 h-full justify-between"
                )}>
                  <div className={isHijacked ? "space-y-8" : ""}>
                    <div className={cn(
                      "inline-block p-3 bg-white/10 backdrop-blur-sm rounded-lg transition-all duration-300 transform",
                      isHijacked 
                        ? "mb-6 scale-150" 
                        : hoveredService === index 
                          ? "mb-4 hover:scale-110" 
                          : "mb-4"
                    )}>
                      <div className={`transform transition-transform duration-300 ${!isHijacked && hoveredService === index ? 'rotate-12' : ''}`}>
                        {service.icon}
                      </div>
                    </div>
                    <h3 className={cn(
                      "font-semibold text-white",
                      isHijacked ? "text-4xl mb-6" : "text-xl mb-2"
                    )}>
                      {service.title}
                    </h3>
                    <p className={cn(
                      "text-white/90",
                      isHijacked ? "text-lg max-w-2xl" : "text-sm"
                    )}>
                      {service.description}
                    </p>
                  </div>
                  {!isHijacked && (
                    <div className={`h-0.5 bg-white/70 mt-3 transition-all duration-500 ${hoveredService === index ? 'w-full' : 'w-0'}`}></div>
                  )}
                </div>
              </div>
            ))}
            
            {isHijacked && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
                <div className="flex space-x-2 mb-4">
                  {services.map((_, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index === currentIndex ? "bg-white w-8" : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm opacity-70">
                  {isMobile ? "Deslize" : "Role"} para continuar • Pressione ESC para sair
                </p>
              </div>
            )}
          </div>

          <div className="mt-16 mb-8 service-item">
            <div className="text-center mb-8">
              <div className="inline-block mb-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Histórias de Sucesso
              </div>
              <h3 className="text-2xl font-bold text-foreground">Resultados Reais para Negócios Reais</h3>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                Descubra como a OptiStrat transformou operações de TI para empresas de diversos setores.
                <span className="block text-sm mt-1 text-primary">Role horizontalmente para ver mais estudos de caso →</span>
              </p>
            </div>
            
            <div className="rounded-xl overflow-hidden bg-card border-border p-4 service-item">
              <Carousel className="w-full max-w-7xl mx-auto">
                <CarouselContent className="flex">
                  {caseStudies.map((study, index) => <CarouselItem key={index} className="md:basis-1/3 flex-shrink-0">
                      <Card className="border border-border shadow-md bg-card">
                        <CardContent className="p-0">
                          <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <div className="text-primary text-6xl font-bold opacity-20">
                              {index + 1}
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-lg text-card-foreground">{study.title}</h4>
                            <p className="text-sm text-muted-foreground mt-2">{study.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>)}
                </CarouselContent>
                <div className="flex justify-center mt-6 gap-2">
                  <CarouselPrevious className="relative static left-auto translate-y-0 hover:bg-accent" />
                  <CarouselNext className="relative static right-auto translate-y-0 hover:bg-accent" />
                </div>
              </Carousel>
              <div className="text-center mt-6 text-sm text-muted-foreground">
                <p className="font-medium">Estes exemplos mostram como a OptiStrat entrega valor empresarial mensurável através da gestão especializada de TI</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-12 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button onClick={handleOrcamentoClick} className="inline-flex items-center px-4 sm:px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all group w-full sm:w-auto">
            Pronto para Transformar sua TI?
            <MessageSquare className="ml-2 w-4 h-4 group-hover:animate-pulse" />
          </Button>
          
          <Button onClick={() => window.scrollTo(0, 0)} className="inline-flex items-center px-4 sm:px-6 py-3 bg-background text-primary rounded-lg border border-primary hover:bg-primary/5 hover:shadow-md transition-all group w-full sm:w-auto">
            Conheça Nosso Processo
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        <OrcamentoDialog open={orcamentoDialogOpen} onOpenChange={setOrcamentoDialogOpen} />
      </section>
      
      <section id="process" className="bg-secondary py-10 md:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Nossa Metodologia
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">Como a OptiStrat Funciona</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Nossa metodologia comprovada garante uma transformação de TI perfeita com interrupção mínima às suas operações empresariais, 
              entregando resultados mensuráveis a cada passo.
            </p>
          </div>
          
          <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-10 transition-all duration-300 hover:shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-primary/10 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div className="text-sm text-primary font-semibold mb-2">PASSO {index + 1}</div>
                  <h3 className="text-lg font-bold mb-2 text-card-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Consulta e avaliação gratuitas</span>
                <span className="text-muted-foreground/50">•</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Sem taxas ocultas ou surpresas</span>
                <span className="text-muted-foreground/50">•</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Resultados garantidos</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>;
};

export default ITServices;