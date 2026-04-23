
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import optiStratLogo from "@/assets/optistrat-logo-full.png";
import { api } from "@/lib/api";

interface SolutionItem {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
}

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [solutions, setSolutions] = useState<SolutionItem[]>([]);

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

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.get('/products');
        if (!active || !Array.isArray(data)) return;
        const filtered = data.filter(
          (p: SolutionItem) => (p.category || '').toLowerCase() === 'solution'
        );
        setSolutions(filtered);
      } catch (err) {
        console.error('Failed to load solutions menu:', err);
        if (active) setSolutions([]);
      }
    })();
    return () => { active = false; };
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
            <img src={optiStratLogo} alt="OptiStrat" className={cn("h-28 w-auto", isScrolled ? "" : "brightness-0 invert")} />
          </Link>
        </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu className={cn(isScrolled ? "" : "text-white")}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-foreground hover:text-primary" : "text-gray-100 hover:text-white bg-transparent hover:bg-gray-800")}>
                    <Link to="/">Início</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-foreground hover:text-primary" : "text-gray-100 hover:text-white bg-transparent hover:bg-gray-800")}>
                    <Link to="/about">Sobre Nós</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(isScrolled ? "text-foreground hover:text-primary" : "text-gray-100 hover:text-white bg-transparent hover:bg-gray-800")}>
                    Soluções
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    {solutions.length === 0 ? (
                      <ul className="grid gap-3 p-4 w-[400px] bg-background">
                        <li className="text-sm text-muted-foreground p-3">
                          Nenhuma solução cadastrada no momento.
                        </li>
                      </ul>
                    ) : (
                      <ul className="grid gap-3 p-4 w-[400px] bg-background">
                        {solutions.map((s) => (
                          <li key={s.id}>
                            <Link
                              to="/#services"
                              className="block p-3 space-y-1 rounded-md hover:bg-accent"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <div className="font-medium">{s.name}</div>
                              {s.description && (
                                <p className="text-sm text-muted-foreground">{s.description}</p>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-foreground hover:text-primary" : "text-gray-100 hover:text-white bg-transparent hover:bg-gray-800")}>
                    <Link to="/blog">Notícias</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-foreground hover:text-primary" : "text-gray-100 hover:text-white bg-transparent hover:bg-gray-800")}>
                    <Link to="/careers">Carreiras</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle())}>
                    <Link to="/#contact" className={cn("px-4 py-2 rounded-md transition-colors", isScrolled ? "bg-primary text-white hover:bg-primary/90" : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm")}>
                      Contatos
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          {/* Theme Toggle - Desktop */}
          <div className="hidden md:flex items-center ml-2">
            <ThemeToggle isScrolled={isScrolled} />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle isScrolled={isScrolled} />
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
            Sobre Nós
          </Link>
          
          <Link to="/tech-details" className={cn("block px-3 py-1.5 rounded-md text-sm", isScrolled ? "text-gray-700 hover:bg-gray-50" : "text-gray-200 hover:bg-primary/30")} onClick={() => {
            setIsMenuOpen(false);
            window.scrollTo(0, 0);
          }}>
            Soluções
          </Link>
          
          <Link to="/blog" className={cn("block px-3 py-1.5 rounded-md text-sm", isScrolled ? "text-gray-700 hover:bg-gray-50" : "text-gray-200 hover:bg-primary/30")} onClick={() => {
            setIsMenuOpen(false);
            window.scrollTo(0, 0);
          }}>
            Notícias
          </Link>
          
          <Link to="/careers" className={cn("block px-3 py-1.5 rounded-md text-sm", isScrolled ? "text-gray-700 hover:bg-gray-50" : "text-gray-200 hover:bg-primary/30")} onClick={() => {
            setIsMenuOpen(false);
            window.scrollTo(0, 0);
          }}>
            Carreiras
          </Link>
          
          <Link to="/#contact" className={cn("block w-full text-left px-3 py-1.5 rounded-md text-sm", isScrolled ? "text-white bg-primary hover:bg-primary/90" : "text-white bg-white/10 hover:bg-white/20")} onClick={() => setIsMenuOpen(false)}>
            Contatos
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
