import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PopupItem {
  id: string;
  image_url: string;
  text: string;
  display_order: number;
}

export const IndexPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupItems, setPopupItems] = useState<PopupItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchPopups = async () => {
      const { data, error } = await supabase
        .from("index_popup")
        .select("id, image_url, text, display_order")
        .eq("active", true)
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        setPopupItems(data);
        setIsOpen(true);
      }
    };

    fetchPopups();
  }, []);

  // Auto-close after 5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? popupItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === popupItems.length - 1 ? 0 : prev + 1));
  };

  if (popupItems.length === 0) return null;

  const currentItem = popupItems[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="bg-transparent border-none shadow-none max-w-2xl p-0 overflow-hidden"
      >
        <div className="relative bg-background/80 backdrop-blur-md rounded-xl border border-border/30 overflow-hidden">
          {/* Close button */}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/50 hover:bg-background/80 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>

          {/* Image */}
          {currentItem.image_url && (
            <div className="w-full h-48 md:h-64 overflow-hidden">
              <img
                src={currentItem.image_url}
                alt="Anúncio"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Text content */}
          <div className="p-6">
            <p className="text-foreground text-center text-lg">
              {currentItem.text}
            </p>
          </div>

          {/* Carousel navigation (only if multiple items) */}
          {popupItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80 rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              {/* Dots indicator */}
              <div className="flex justify-center gap-2 pb-4">
                {popupItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentIndex
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
