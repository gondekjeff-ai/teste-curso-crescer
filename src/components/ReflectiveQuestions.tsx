import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const questions = [
  {
    question: "Sua infraestrutura de TI acompanha o ritmo do seu negócio?",
    reflection: "Sistemas lentos, quedas frequentes e equipes ociosas custam mais do que você imagina. E se cada minuto de trabalho fosse aproveitado ao máximo?",
  },
  {
    question: "Quanto tempo sua equipe perde resolvendo problemas que não deveriam existir?",
    reflection: "Imagine ter especialistas dedicados monitorando, prevenindo e resolvendo incidentes antes que eles afetem sua operação.",
  },
  {
    question: "Seus dados estão realmente seguros — ou você só espera que estejam?",
    reflection: "Ataques cibernéticos crescem a cada dia. A pergunta não é mais 'se' vai acontecer, mas 'quando'. Você está preparado?",
  },
  {
    question: "E se a tecnologia deixasse de ser um problema e virasse o seu maior diferencial?",
    reflection: "Empresas que tratam TI como ativo estratégico crescem mais rápido. Está na hora de repensar como você enxerga sua infraestrutura.",
  },
];

const ReflectiveQuestions = () => {
  return (
    <section
      id="services"
      className="py-16 md:py-24 px-4 md:px-12 bg-gradient-to-b from-background via-muted/40 to-background"
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <HelpCircle className="w-4 h-4" />
            Reflita por um momento
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-foreground tracking-tight">
            Algumas perguntas que podem mudar o rumo do seu negócio
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Antes de falar sobre o que fazemos, queremos que você pense no que sua empresa
            realmente precisa.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {questions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="group relative"
            >
              <div className="h-full bg-card border border-border rounded-2xl p-7 md:p-8 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-semibold text-card-foreground mb-3 leading-snug">
                      {item.question}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.reflection}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <p className="text-foreground/80 text-lg mb-6 max-w-2xl mx-auto">
            Se alguma dessas perguntas fez você parar para pensar, é porque a OptiStrat
            pode ajudar.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground group"
          >
            <Link to="/orcamento">
              Vamos conversar sobre seu cenário
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ReflectiveQuestions;
