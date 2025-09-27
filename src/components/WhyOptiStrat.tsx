import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Clock, Shield, Users, Award, Target, Zap, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

const AnimatedCounter = ({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
  decimals = 0
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const inView = useInView(countRef, {
    once: true,
    margin: "-100px"
  });
  useEffect(() => {
    if (!inView) return;
    let startTime: number;
    let animationFrame: number;
    const startAnimation = (timestamp: number) => {
      startTime = timestamp;
      animate(timestamp);
    };
    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentCount = progress * end;
      setCount(currentCount);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(startAnimation);
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, inView]);
  return <span ref={countRef} className="font-bold tabular-nums text-foreground">
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>;
};

const WhyOptiStrat = () => {
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
  return <section id="why-optistrat" className="relative py-16 md:py-24 bg-background overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-12 md:mb-16" initial="hidden" whileInView="visible" viewport={{
        once: true,
        margin: "-100px"
      }} variants={containerVariants}>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Por que Escolher a OptiStrat?
          </motion.h2>
          <motion.p variants={itemVariants} className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Em um mundo onde a complexidade de TI pode fazer ou quebrar seu negócio, a OptiStrat simplifica o gerenciamento de tecnologia para impulsionar seu sucesso
          </motion.p>
        </motion.div>
        
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16" initial="hidden" whileInView="visible" viewport={{
        once: true,
        margin: "-100px"
      }} variants={containerVariants}>
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary/5 to-secondary/10 p-6 rounded-xl border border-primary/20 text-center hover:shadow-lg transition-all">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-foreground text-2xl lg:text-3xl font-bold mb-3">
              <AnimatedCounter end={47} suffix="%" /> 
            </h3>
            <p className="text-muted-foreground">Aumento médio na eficiência operacional alcançado por nossos clientes nos primeiros 6 meses</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary/5 to-secondary/10 p-6 rounded-xl border border-primary/20 text-center hover:shadow-lg transition-all">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-foreground text-2xl lg:text-3xl font-bold mb-3">
              <AnimatedCounter end={24} suffix="/7" /> 
            </h3>
            <p className="text-muted-foreground">
              Monitoramento e suporte 24 horas por dia para garantir que seus sistemas nunca durmam quando seu negócio precisa deles
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary/5 to-secondary/10 p-6 rounded-xl border border-primary/20 text-center hover:shadow-lg transition-all">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-foreground text-2xl lg:text-3xl font-bold mb-3">
              <AnimatedCounter end={99.9} decimals={1} suffix="%" />
            </h3>
            <p className="text-muted-foreground">
              Tempo de atividade do sistema garantido através de monitoramento proativo e protocolos de resposta rápida a incidentes
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div className="mb-12" initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-100px"
        }} variants={containerVariants}>
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              O que a OptiStrat Entrega para Seu Negócio
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Transformamos seus desafios de TI em vantagens competitivas com resultados empresariais mensuráveis
            </p>
          </motion.div>
          
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10 hover:shadow-lg transition-all">
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full p-3 mr-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground mb-2">Custos Operacionais Reduzidos</h4>
                  <p className="text-muted-foreground">Otimize gastos com TI enquanto melhora o desempenho através do gerenciamento estratégico de infraestrutura.</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10 hover:shadow-lg transition-all">
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full p-3 mr-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground mb-2">Produtividade Aprimorada</h4>
                  <p className="text-muted-foreground">Elimine tempo de inatividade e otimize fluxos de trabalho com sistemas de TI confiáveis e otimizados.</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10 hover:shadow-lg transition-all">
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full p-3 mr-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground mb-2">Segurança à Prova de Balas</h4>
                  <p className="text-muted-foreground">Proteja seu negócio contra ameaças cibernéticas com soluções de segurança de nível empresarial.</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10 hover:shadow-lg transition-all">
              <div className="flex items-start">
                <div className="bg-primary/10 rounded-full p-3 mr-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground mb-2">Parceria Especializada</h4>
                  <p className="text-muted-foreground">Acesso a profissionais experientes em TI sem as despesas gerais de contratar equipe em tempo integral.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center mt-10">
            <Link 
              to="/development-process" 
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all group"
            >
              Descubra nossa metodologia comprovada de transformação de TI
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>;
};

export default WhyOptiStrat;