
import { ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <PageLayout>
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Início
            </Link>
            
            <motion.h1 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }} 
              className="text-4xl font-bold mb-6"
            >
              Sobre a OptiStrat
            </motion.h1>
            
            <div className="prose prose-lg max-w-none">
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.5, delay: 0.2 }} 
                className="text-xl text-gray-600 mb-12"
              >
                Somos uma equipe dedicada a transformar a gestão de TI para empresas de todos os portes no Brasil.
              </motion.p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-bold">Nossa Missão</h2>
                  <p className="text-gray-600">
                    Na OptiStrat, nossa missão é otimizar a infraestrutura de TI das empresas, 
                    fornecendo soluções especializadas que aumentam o desempenho, fortalecem a segurança 
                    e impulsionam o crescimento empresarial.
                  </p>
                  <p className="text-gray-600">
                    Acreditamos que uma infraestrutura de TI bem gerenciada é a base para o sucesso 
                    no mundo digital de hoje.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
                >
                  <h3 className="text-2xl font-bold mb-4">Nossos Valores</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-700 mt-1 mr-3 flex-shrink-0" />
                      <span><strong>Excelência:</strong> Comprometidos com a qualidade em cada solução que entregamos.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-700 mt-1 mr-3 flex-shrink-0" />
                      <span><strong>Segurança:</strong> Proteção dos dados e sistemas dos nossos clientes em primeiro lugar.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-700 mt-1 mr-3 flex-shrink-0" />
                      <span><strong>Parceria:</strong> Trabalhamos lado a lado com nossos clientes para entender suas necessidades.</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-700 mt-1 mr-3 flex-shrink-0" />
                      <span><strong>Inovação:</strong> Sempre buscando as melhores tecnologias e práticas do mercado.</span>
                    </li>
                  </ul>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold mb-6">Nossa História</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                  <p className="text-gray-600 mb-4">
                    A OptiStrat nasceu da visão de profissionais experientes em TI que identificaram 
                    a necessidade de soluções de gestão de infraestrutura mais acessíveis e eficientes 
                    para empresas brasileiras.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Com anos de experiência no mercado corporativo, desenvolvemos uma metodologia própria 
                    que combina as melhores práticas internacionais com a realidade do mercado brasileiro, 
                    garantindo resultados reais e mensuráveis.
                  </p>
                  <p className="text-gray-600">
                    Hoje, atendemos empresas de diversos segmentos, desde startups até grandes corporações, 
                    sempre com o compromisso de entregar excelência em gestão de TI.
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-16"
              >
                <h2 className="text-3xl font-bold mb-6">Nossos Serviços</h2>
                <p className="text-gray-600 mb-8">
                  Oferecemos uma gama completa de serviços de TI, incluindo consultoria estratégica, 
                  gestão de infraestrutura em nuvem, cibersegurança, gerenciamento de redes e suporte técnico 24/7.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Consultoria de TI",
                      description: "Planejamento estratégico e avaliação de infraestrutura"
                    },
                    {
                      title: "Cloud Computing",
                      description: "Migração e gerenciamento de ambientes em nuvem"
                    },
                    {
                      title: "Cibersegurança",
                      description: "Proteção avançada contra ameaças digitais"
                    },
                    {
                      title: "Gestão de Redes",
                      description: "Monitoramento e otimização 24/7"
                    },
                    {
                      title: "Backup e Recovery",
                      description: "Soluções seguras de backup e recuperação de dados"
                    },
                    {
                      title: "Suporte Técnico",
                      description: "Atendimento especializado a qualquer momento"
                    }
                  ].map((service, i) => (
                    <Card key={i} className="bg-gray-50 border border-gray-100">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </div>
            
            <div className="mt-16 pt-8 border-t border-gray-200">
              <Link to="/careers" className="inline-flex items-center px-5 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all group">
                Junte-se à Nossa Equipe
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default About;
