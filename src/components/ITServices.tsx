import { useEffect, useRef, useState } from 'react';
import { Shield, Cloud, Server, Database, Monitor, Wifi, ArrowRight, MessageSquare, CheckCircle, Code, Settings, Users } from "lucide-react";
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from "@/components/ui/button";
import { useScrollHijack } from '@/hooks/useScrollHijack';

const ITServices = () => {
  const servicesRef = useRef<HTMLDivElement>(null);
  const hijackSectionRef = useRef<HTMLDivElement>(null);
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const services = [
    {
      icon: <Cloud className="w-10 h-10 text-white transition-transform duration-300 transform" />,
      title: "Cloud Infrastructure",
      description: "Comprehensive cloud migration and management services with AWS, Azure, and Google Cloud platforms for scalable business solutions.",
      image: "/lovable-uploads/48e540e5-6a25-44e4-b3f7-80f3bfc2777a.png"
    },
    {
      icon: <Shield className="w-10 h-10 text-white transition-transform duration-300 transform" />,
      title: "Cybersecurity",
      description: "Advanced threat detection, incident response, and comprehensive security audits to protect your digital assets and business data.",
      image: "/lovable-uploads/48ecf6e2-5a98-4a9d-af6f-ae2265cd4098.png"
    },
    {
      icon: <Server className="w-10 h-10 text-white transition-transform duration-300 transform" />,
      title: "Network Management",
      description: "24/7 network monitoring, optimization, and troubleshooting to ensure reliable connectivity and peak performance.",
      image: "/lovable-uploads/cf8966e3-de0d-445f-9fbd-ee6c48daa7ff.png"
    },
    {
      icon: <Database className="w-10 h-10 text-white transition-transform duration-300 transform" />,
      title: "Data Management",
      description: "Secure data backup, recovery solutions, and database optimization to protect and organize your critical business information.",
      image: "/lovable-uploads/6739bd63-bf19-4abd-bb23-0b613bbf7ac8.png"
    }
  ];

  const { isHijacked, currentIndex } = useScrollHijack(hijackSectionRef, services.length);

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact-info');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-in');
          (entry.target as HTMLElement).style.opacity = '1';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    if (servicesRef.current) {
      const elements = servicesRef.current.querySelectorAll('.service-item');
      elements.forEach(el => {
        if (!el.classList.contains('animate-slide-in')) {
          (el as HTMLElement).style.opacity = '0';
          observer.observe(el);
        }
      });
    }
    return () => observer.disconnect();
  }, []);

  const caseStudies = [{
    image: "/lovable-uploads/843446fe-638e-4efb-b885-ed3cd505325a.png",
    title: "Enterprise Cloud Migration",
    description: "Successfully migrated 500+ employee company to AWS, reducing IT costs by 40% while improving system reliability and performance."
  }, {
    image: "/lovable-uploads/5463c9c5-0946-4280-a14b-17636ff69a98.png",
    title: "Security Infrastructure Overhaul",
    description: "Implemented comprehensive cybersecurity framework for financial services company, achieving 99.9% threat prevention rate."
  }, {
    image: "/lovable-uploads/c5f8ee24-9815-4ebe-b65d-6f3d449feb8b.png",
    title: "Network Optimization",
    description: "Redesigned network infrastructure for manufacturing company, improving data transfer speeds by 300% and eliminating downtime."
  }];

  const processSteps = [{
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Consultation & Assessment",
    description: "Comprehensive analysis of your current IT infrastructure and business requirements"
  }, {
    icon: <Settings className="h-10 w-10 text-primary" />,
    title: "Strategic Planning",
    description: "Custom IT roadmap aligned with your business goals and growth objectives"
  }, {
    icon: <Code className="h-10 w-10 text-primary" />,
    title: "Implementation",
    description: "Expert deployment with minimal disruption to your daily operations"
  }, {
    icon: <Monitor className="h-10 w-10 text-primary" />,
    title: "Ongoing Support",
    description: "24/7 monitoring and maintenance to ensure optimal performance"
  }];

  return <>
      <section id="features" className="relative bg-white overflow-hidden py-10 md:py-[50px] w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8" ref={servicesRef}> 
          <div className="text-center mb-10 max-w-3xl mx-auto service-item">
            <div className="inline-block mb-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              IT Management Services
            </div>
            <h2 className="text-3xl font-bold mb-4">Complete IT Solutions</h2>
            <p className="text-gray-600 mt-4">
              OptiStrat delivers comprehensive IT management services that transform your technology infrastructure into a competitive advantage for your business.
            </p>
          </div>
          
          {/* Scroll-hijacked services section */}
          <div 
            ref={hijackSectionRef}
            className={cn(
              "relative transition-all duration-500",
              isHijacked ? "fixed inset-0 z-50 bg-primary" : "grid grid-cols-1 md:grid-cols-2 gap-5"
            )}
            style={{ height: isHijacked ? '100vh' : 'auto' }}
          >
            {isHijacked && (
              <div className="absolute top-4 right-4 z-10 text-white text-sm opacity-70">
                {currentIndex + 1} / {services.length}
              </div>
            )}
            
            {services.map((service, index) => (
              <div 
                key={index} 
                className={cn(
                  "service-item rounded-xl overflow-hidden transform transition-all duration-500 relative shadow-lg",
                  isHijacked 
                    ? cn(
                        "absolute inset-0 w-full h-full",
                        index === currentIndex 
                          ? "opacity-100 translate-x-0" 
                          : index < currentIndex 
                            ? "opacity-0 -translate-x-full" 
                            : "opacity-0 translate-x-full"
                      )
                    : "hover:-translate-y-1 h-[280px] bg-gradient-to-br from-primary to-secondary"
                )}
                style={{
                  transitionDelay: isHijacked ? '0ms' : `${index * 100}ms`
                }}
                onMouseEnter={() => !isHijacked && setHoveredService(index)} 
                onMouseLeave={() => !isHijacked && setHoveredService(null)}
              >
                <div className={cn(
                  "relative z-10 flex flex-col justify-center",
                  isHijacked 
                    ? "p-16 h-full text-center items-center" 
                    : "p-6 h-full justify-between"
                )}>
                  <div className={isHijacked ? "space-y-8" : ""}>
                    <div className={cn(
                      "inline-block p-3 bg-white/10 backdrop-blur-sm rounded-lg transition-all duration-300 transform",
                      isHijacked 
                        ? "mb-6 scale-150" 
                        : hoveredService === index 
                          ? "mb-4 hover:scale-110" 
                          : "mb-4"
                    )}>
                      <div className={`transform transition-transform duration-300 ${!isHijacked && hoveredService === index ? 'rotate-12' : ''}`}>
                        {service.icon}
                      </div>
                    </div>
                    <h3 className={cn(
                      "font-semibold text-white",
                      isHijacked ? "text-4xl mb-6" : "text-xl mb-2"
                    )}>
                      {service.title}
                    </h3>
                    <p className={cn(
                      "text-white/90",
                      isHijacked ? "text-lg max-w-2xl" : "text-sm"
                    )}>
                      {service.description}
                    </p>
                  </div>
                  {!isHijacked && (
                    <div className={`h-0.5 bg-white/70 mt-3 transition-all duration-500 ${hoveredService === index ? 'w-full' : 'w-0'}`}></div>
                  )}
                </div>
              </div>
            ))}
            
            {isHijacked && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
                <div className="flex space-x-2 mb-4">
                  {services.map((_, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index === currentIndex ? "bg-white w-8" : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm opacity-70">
                  {isMobile ? "Swipe" : "Scroll"} to continue • Press ESC to exit
                </p>
              </div>
            )}
          </div>

          <div className="mt-16 mb-8 service-item">
            <div className="text-center mb-8">
              <div className="inline-block mb-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Success Stories
              </div>
              <h3 className="text-2xl font-bold">Real Results for Real Businesses</h3>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                Discover how OptiStrat has transformed IT operations for companies across various industries.
                <span className="block text-sm mt-1 text-primary">Scroll horizontally to see more case studies →</span>
              </p>
            </div>
            
            <div className="rounded-xl overflow-hidden bg-white p-4 service-item">
              <Carousel className="w-full max-w-7xl mx-auto">
                <CarouselContent className="flex">
                  {caseStudies.map((study, index) => <CarouselItem key={index} className="md:basis-1/3 flex-shrink-0">
                      <Card className="border border-gray-100 shadow-md">
                        <CardContent className="p-0">
                          <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <div className="text-primary text-6xl font-bold opacity-20">
                              {index + 1}
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-lg">{study.title}</h4>
                            <p className="text-sm text-gray-600 mt-2">{study.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>)}
                </CarouselContent>
                <div className="flex justify-center mt-6 gap-2">
                  <CarouselPrevious className="relative static left-auto translate-y-0 hover:bg-gray-100" />
                  <CarouselNext className="relative static right-auto translate-y-0 hover:bg-gray-100" />
                </div>
              </Carousel>
              <div className="text-center mt-6 text-sm text-gray-600">
                <p className="font-medium">These examples showcase how OptiStrat delivers measurable business value through expert IT management</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-12 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button onClick={scrollToContact} className="inline-flex items-center px-4 sm:px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg shadow-md hover:shadow-lg transition-all group w-full sm:w-auto">
            Ready to Transform Your IT?
            <MessageSquare className="ml-2 w-4 h-4 group-hover:animate-pulse" />
          </Button>
          
          <Button onClick={() => window.scrollTo(0, 0)} className="inline-flex items-center px-4 sm:px-6 py-3 bg-white text-primary rounded-lg border border-primary hover:bg-primary/5 hover:shadow-md transition-all group w-full sm:w-auto">
            Learn About Our Process
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
      
      <section id="process" className="bg-gray-50 py-10 md:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Our Methodology
            </div>
            <h2 className="text-3xl font-bold mb-4">How OptiStrat Works</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our proven methodology ensures seamless IT transformation with minimal disruption to your business operations, 
              delivering measurable results every step of the way.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-10 transition-all duration-300 hover:shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-primary/10 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div className="text-sm text-primary font-semibold mb-2">STEP {index + 1}</div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free consultation and assessment</span>
                <span className="text-gray-300">•</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No hidden fees or surprises</span>
                <span className="text-gray-300">•</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Guaranteed results</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>;
};

export default ITServices;