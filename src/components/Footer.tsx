
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
    <footer id="contact" className="bg-gradient-to-r from-primary to-secondary text-white pt-16 pb-8 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-10 border-b border-white/20">
          <div>
            <img 
              src={optiStratLogo} 
              alt="OptiStrat IT Management" 
              className="h-10 w-auto mb-6 brightness-0 invert"
            />
            <p className="text-white/90 mb-6 max-w-md">
              A OptiStrat oferece soluções abrangentes de gestão de TI que transformam sua infraestrutura tecnológica em vantagem competitiva.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.linkedin.com/company/optistrat/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="LinkedIn da OptiStrat"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              >
                <Linkedin size={20} />
              </a>
              <button 
                onClick={() => {
                  const chatBotButton = document.querySelector('[data-chatbot-trigger]') as HTMLButtonElement;
                  if (chatBotButton) chatBotButton.click();
                }}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                title="Atendimento Virtual"
                aria-label="Abrir atendimento virtual"
              >
                <MessageCircle size={20} />
              </button>
            </div>
          </div>
          
          <div className="md:text-right">
            <h3 className="text-lg font-bold mb-4 text-white">Inscreva-se</h3>
            <form className="space-y-4 md:ml-auto md:max-w-sm" onSubmit={handleSubscribe}>
              <div>
                <input 
                  type="email" 
                  placeholder="Seu email" 
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder-white/60"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <button 
                type="submit" 
                className="w-full px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
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
        
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center border-t border-white/20">
          <p className="text-white/60 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} OptiStrat Gestão de TI. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-sm text-white/60 hover:text-white transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
