import { ArrowRight, Code, Server, Cloud, MessageSquare, Shield } from "lucide-react";
import optiStratLogo from "@/assets/optistrat-logo-full.png";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const isMobile = useIsMobile();
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
        duration: 0.8
      }
    }
  };
  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };
  
  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  
  return <motion.div className="relative w-full" initial="hidden" animate="visible" variants={containerVariants}>
      <div className="banner-container bg-gradient-to-br from-primary via-secondary to-primary/80 relative overflow-hidden h-[50vh] sm:h-[60vh] md:h-[500px] lg:h-[550px] xl:h-[600px] w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-primary w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20"></div>
        </div>
        
        <div className="banner-overlay bg-transparent pt-20 sm:pt-24 md:pt-32 w-full">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center h-full">
            <motion.div className="w-full max-w-4xl text-center" variants={itemVariants}>
              <motion.div className="mb-6" variants={itemVariants}>
                <img src={optiStratLogo} alt="OptiStrat IT Management" className="h-48 md:h-56 lg:h-64 xl:h-72 mx-auto mb-4" />
              </motion.div>
              <motion.h1 className="banner-title text-white" variants={itemVariants}>Otimize sua Infraestrutura de TI</motion.h1>
              <motion.p className="banner-subtitle text-primary-foreground/90 mt-4 sm:mt-6" variants={itemVariants}>
                Soluções especializadas em gestão de TI que otimizam desempenho, reforçam a segurança e impulsionam o crescimento empresarial.
              </motion.p>
              <motion.div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 justify-center items-center" variants={itemVariants}>
                {/* Styled as a button but using an anchor tag for project navigation */}
                <button 
                  className="w-full sm:w-auto min-h-[44px] px-6 sm:px-8 py-3 bg-white text-primary rounded-md hover:bg-primary-foreground transition-all shadow-lg hover:shadow-xl hover:shadow-white/20 flex items-center justify-center group text-sm sm:text-base font-medium"
                  onClick={e => {
                    e.preventDefault();
                    const servicesSection = document.getElementById('features');
                    if (servicesSection) {
                      servicesSection.scrollIntoView({
                        behavior: 'smooth'
                      });
                    }
                  }}
                >
                  Nossos Serviços
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  className="w-full sm:w-auto min-h-[44px] px-6 sm:px-8 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-md hover:bg-white/20 transition-all shadow-lg hover:shadow-xl hover:shadow-white/10 flex items-center justify-center group text-sm sm:text-base font-medium"
                  onClick={scrollToContact}
                >
                  Contatos
                  <MessageSquare className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <motion.div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4" variants={containerVariants} initial="hidden" animate="visible" transition={{
        delay: 0.6
      }}>
          <motion.div className="bg-card border-border p-4 md:p-5 rounded-xl shadow-sm transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md" variants={itemVariants}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 flex items-center justify-center rounded-lg text-primary mb-2 md:mb-3">
              <Cloud className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-card-foreground">Gestão em Nuvem</h3>
            <p className="text-muted-foreground text-xs md:text-sm">Gerenciamento perfeito de infraestrutura em nuvem e serviços de migração para desempenho otimizado.</p>
          </motion.div>
          
          <motion.div className="bg-card border-border p-4 md:p-5 rounded-xl shadow-sm transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md" variants={itemVariants}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 flex items-center justify-center rounded-lg text-primary mb-2 md:mb-3">
              <Shield className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-card-foreground">Soluções de Segurança</h3>
            <p className="text-muted-foreground text-xs md:text-sm">Estratégias abrangentes de cibersegurança para proteger seu negócio contra ameaças digitais.</p>
          </motion.div>
          
          <motion.div className="bg-card border-border p-4 md:p-5 rounded-xl shadow-sm transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md" variants={itemVariants}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 flex items-center justify-center rounded-lg text-primary mb-2 md:mb-3">
              <Server className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-card-foreground">Suporte de Infraestrutura</h3>
            <p className="text-muted-foreground text-xs md:text-sm">Monitoramento e suporte 24/7 para servidores, redes e sistemas críticos de negócios.</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>;
};

export default Hero;
