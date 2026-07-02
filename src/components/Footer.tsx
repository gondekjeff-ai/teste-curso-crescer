
import { ArrowRight, Linkedin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import optiStratLogo from "@/assets/optistrat-logo-full.webp";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, insira seu endereço de email.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await api.post('/send-contact-email', {
        name: "Website Subscriber",
        email: email,
        message: "",
        type: 'subscription'
      });
      
      toast({
        title: "Sucesso!",
        description: "Obrigado por se inscrever em nossa newsletter.",
        variant: "default"
      });
      
      setEmail("");
    } catch (error: any) {
      console.error("Error sending subscription:", error);
      
      toast({
        title: "Erro",
        description: error.message || "Houve um problema ao se inscrever. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="bg-gradient-to-r from-primary to-secondary text-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 pb-10 md:pb-12 border-b border-white/20">
          <div className="text-center md:text-left">
            <img
              src={optiStratLogo}
              alt="OptiStrat IT Management"
              className="h-10 w-auto mb-6 mx-auto md:mx-0 brightness-0 invert"
            />
            <p className="text-white/90 text-base mb-6 max-w-md mx-auto md:mx-0 leading-relaxed">
              A OptiStrat oferece soluções abrangentes de gestão de TI que transformam sua infraestrutura tecnológica em vantagem competitiva.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="https://www.linkedin.com/company/optistrat/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn da OptiStrat"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <Linkedin size={20} />
              </a>
              <button
                onClick={() => {
                  const chatBotButton = document.querySelector('[data-chatbot-trigger]') as HTMLButtonElement;
                  if (chatBotButton) chatBotButton.click();
                }}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                title="Atendimento Virtual"
                aria-label="Abrir atendimento virtual"
              >
                <MessageCircle size={20} />
              </button>
            </div>
          </div>

          <div className="text-center md:text-right">
            <h3 className="text-lg md:text-xl font-bold mb-4 text-white">Inscreva-se na newsletter</h3>
            <p className="text-white/80 text-sm mb-4 md:max-w-sm md:ml-auto">
              Receba novidades, conteúdos e insights sobre gestão de TI diretamente no seu email.
            </p>
            <form className="space-y-3 md:max-w-sm md:ml-auto" onSubmit={handleSubscribe}>
              <div>
                <label htmlFor="footer-email" className="sr-only">Seu email</label>
                <input
                  id="footer-email"
                  type="email"
                  placeholder="Seu email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder-white/60 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-white text-primary font-medium rounded-md hover:bg-white/90 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Inscrevendo..." : (
                  <>
                    Inscrever-se
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 md:pt-10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <p className="text-white/70 text-sm text-center md:text-left">
            © {new Date().getFullYear()} OptiStrat Gestão de TI. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 md:gap-6 text-sm">
            <Link to="/privacy-policy" className="text-white/70 hover:text-white transition-colors">Política de Privacidade</Link>
            <span className="hidden md:inline text-white/30">|</span>
            <Link to="/cookie-policy" className="text-white/70 hover:text-white transition-colors">Política de Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
