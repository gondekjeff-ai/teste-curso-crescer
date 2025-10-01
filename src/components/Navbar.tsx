
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import optiStratLogo from "@/assets/optistrat-logo-full.png";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full", isScrolled ? "bg-white shadow-sm" : "bg-gradient-to-r from-primary to-secondary")} initial={{
      opacity: 1,
      y: 0
    }} animate={{
      opacity: 1,
      y: 0
    }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center justify-between h-16">
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center">
            <img src={optiStratLogo} alt="OptiStrat" className={cn("h-16 w-auto", isScrolled ? "" : "brightness-0 invert")} />
          </Link>
        </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu className={cn(isScrolled ? "" : "text-white")}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/">
                     <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-foreground hover:text-primary" : "text-gray-100 hover:text-white bg-transparent hover:bg-gray-800")}>
                       Início
                     </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/about">
                     <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-foreground hover:text-primary" : "text-gray-100 hover:text-white bg-transparent hover:bg-gray-800")}>
                       Sobre Nós
                     </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(isScrolled ? "text-foreground hover:text-primary" : "text-gray-100 hover:text-white bg-transparent hover:bg-gray-800")}>
                    Serviços de TI
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[400px]">
                      <li>
                        <button onClick={() => scrollToSection('services')} className="block w-full text-left p-3 space-y-1 rounded-md hover:bg-accent">
                          <div className="font-medium">Infraestrutura em Nuvem</div>
                          <p className="text-sm text-muted-foreground">Migração e gerenciamento abrangente em nuvem</p>
                        </button>
                      </li>
                      <li>
                        <button onClick={() => scrollToSection('services')} className="block w-full text-left p-3 space-y-1 rounded-md hover:bg-accent">
                          <div className="font-medium">Cibersegurança</div>
                          <p className="text-sm text-muted-foreground">Detecção e proteção avançada contra ameaças</p>
                        </button>
                      </li>
                      <li>
                        <button onClick={() => scrollToSection('services')} className="block w-full text-left p-3 space-y-1 rounded-md hover:bg-accent">
                          <div className="font-medium">Gerenciamento de Rede</div>
                          <p className="text-sm text-muted-foreground">Monitoramento e otimização 24/7</p>
                        </button>
                      </li>
                      <li>
                        <button onClick={() => scrollToSection('services')} className="block w-full text-left p-3 space-y-1 rounded-md hover:bg-accent">
                          <div className="font-medium">Gestão de Dados</div>
                          <p className="text-sm text-muted-foreground">Backup seguro e soluções de recuperação</p>
                        </button>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(isScrolled ? "text-foreground hover:text-primary" : "text-gray-100 hover:text-white bg-transparent hover:bg-gray-800")}>
                    Soluções
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[400px]">
                      <li>
                        <Link to="/tech-details" className="block p-3 space-y-1 rounded-md hover:bg-accent">
                          <div className="font-medium">Consultoria de TI</div>
                          <p className="text-sm text-muted-foreground">Planejamento estratégico e avaliação de TI</p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/development-process" className="block p-3 space-y-1 rounded-md hover:bg-accent">
                          <div className="font-medium">Processo de Implementação</div>
                          <p className="text-sm text-muted-foreground">Nossa metodologia comprovada para transformação de TI</p>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <button onClick={() => scrollToSection('noticias')} className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-foreground hover:text-primary" : "text-gray-100 hover:text-white bg-transparent hover:bg-gray-800")}>
                    Notícias
                  </button>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/careers">
                     <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-foreground hover:text-primary" : "text-gray-100 hover:text-white bg-transparent hover:bg-gray-800")}>
                       Carreiras
                     </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <button onClick={() => scrollToSection('contact')} className={cn("px-4 py-2 rounded-md transition-colors", isScrolled ? "bg-primary text-white hover:bg-primary/90" : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm")}>
                    Contatos
                  </button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className={cn("focus:outline-none", isScrolled ? "text-gray-700" : "text-white")}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - Reduced height and simplified */}
      <div className={cn("md:hidden transition-all duration-300 overflow-hidden w-full", isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0")}>
        <div className={cn("px-3 pt-2 pb-3 space-y-1 shadow-sm overflow-y-auto max-h-80", isScrolled ? "bg-white" : "bg-gradient-to-r from-primary to-secondary")}>
          <Link to="/" className={cn("block px-3 py-1.5 rounded-md text-sm", isScrolled ? "text-foreground hover:bg-accent" : "text-gray-200 hover:bg-primary/30")} onClick={() => {
            setIsMenuOpen(false);
            window.scrollTo(0, 0);
          }}>
            Início
          </Link>
          
          <Link to="/about" className={cn("block px-3 py-1.5 rounded-md text-sm", isScrolled ? "text-gray-700 hover:bg-gray-50" : "text-gray-200 hover:bg-primary/30")} onClick={() => {
            setIsMenuOpen(false);
            window.scrollTo(0, 0);
          }}>
            About Us
          </Link>
          
          <button onClick={() => scrollToSection('features')} className={cn("block w-full text-left px-3 py-1.5 rounded-md text-sm", isScrolled ? "text-gray-700 hover:bg-gray-50" : "text-gray-200 hover:bg-primary/30")}>
            IT Services
          </button>
          
          <Link to="/tech-details" className={cn("block px-3 py-1.5 rounded-md text-sm", isScrolled ? "text-gray-700 hover:bg-gray-50" : "text-gray-200 hover:bg-primary/30")} onClick={() => {
            setIsMenuOpen(false);
            window.scrollTo(0, 0);
          }}>
            Solutions
          </Link>
          
          <Link to="/blog" className={cn("block px-3 py-1.5 rounded-md text-sm", isScrolled ? "text-gray-700 hover:bg-gray-50" : "text-gray-200 hover:bg-primary/30")} onClick={() => {
            setIsMenuOpen(false);
            window.scrollTo(0, 0);
          }}>
            News
          </Link>
          
          <Link to="/careers" className={cn("block px-3 py-1.5 rounded-md text-sm", isScrolled ? "text-gray-700 hover:bg-gray-50" : "text-gray-200 hover:bg-primary/30")} onClick={() => {
            setIsMenuOpen(false);
            window.scrollTo(0, 0);
          }}>
            Careers
          </Link>
          
          <button onClick={() => scrollToSection('contact')} className={cn("block w-full text-left px-3 py-1.5 rounded-md text-sm", isScrolled ? "text-white bg-primary hover:bg-primary/90" : "text-white bg-white/10 hover:bg-white/20")}>
            Get Started
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
