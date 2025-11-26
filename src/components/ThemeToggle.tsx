import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  isScrolled?: boolean;
}

export function ThemeToggle({ isScrolled = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Add fade effect during theme transition
    document.documentElement.style.setProperty('transition', 'opacity 0.3s ease');
    document.documentElement.style.opacity = '0.95';
    
    setTimeout(() => {
      setTheme(theme === "dark" ? "light" : "dark");
      setTimeout(() => {
        document.documentElement.style.opacity = '1';
      }, 50);
    }, 150);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "rounded-full",
        isScrolled 
          ? "text-foreground hover:bg-accent" 
          : "text-white hover:bg-white/10"
      )}
      aria-label="Alternar tema"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
