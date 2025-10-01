
import PageLayout from '@/components/PageLayout';
import { ArrowLeft, Mail, Linkedin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { useEffect } from 'react';

const Careers = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen bg-white">
      <PageLayout showContact={false}>
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
                Junte-se à Nossa Equipe
              </motion.h1>
              
              <div className="prose prose-lg max-w-none">
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ duration: 0.5, delay: 0.2 }} 
                  className="text-xl text-gray-600 mb-4"
                >
                  Procuramos profissionais apaixonados por tecnologia para nos ajudar a transformar a gestão de TI no Brasil.
                </motion.p>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-xl text-gray-600 mb-12"
                >
                  Valorizamos tanto profissionais experientes quanto talentos iniciantes que desejam crescer na área de TI.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.6 }}
                  className="mb-16"
                >
                  <h2 className="text-3xl font-bold mb-6">Por Que Trabalhar na OptiStrat?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                      {
                        title: "Crescimento Profissional",
                        description: "Desenvolva suas habilidades em um ambiente desafiador e em constante evolução."
                      },
                      {
                        title: "Impacto Real",
                        description: "Trabalhe em projetos que fazem diferença real para empresas de diversos setores."
                      },
                      {
                        title: "Ambiente Colaborativo",
                        description: "Faça parte de uma equipe engajada e focada em resultados."
                      }
                    ].map((benefit, i) => (
                      <div key={i} className="bg-gray-50 p-6 rounded-lg border border-gray-100 h-full">
                        <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mt-12">
                    <h3 className="font-bold text-xl mb-6">Entre em Contato</h3>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <p className="text-gray-600 mb-4">
                        Interessado em fazer parte da equipe OptiStrat? Entre em contato conosco!
                      </p>
                      <div className="flex flex-col space-y-3">
                        <a href="mailto:comercial@optistrat.com.br" className="flex items-center text-gray-700 hover:text-primary transition-colors">
                          <Mail className="w-5 h-5 mr-2" />
                          comercial@optistrat.com.br
                        </a>
                        <p className="text-sm text-gray-600 mt-4">
                          Envie seu currículo e conte-nos sobre sua experiência e interesse em trabalhar com tecnologia.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </PageLayout>
    </div>
  );
};

export default Careers;
