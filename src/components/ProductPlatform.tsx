import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Database, Shield, Cloud, Settings, Headphones, Server } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
}

const ProductPlatform = () => {
  const [services, setServices] = useState<Product[]>([]);
  const [solutions, setSolutions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, category')
        .eq('active', true);

      if (error) throw error;

      if (data) {
        setServices(data.filter(product => product.category === 'service'));
        setSolutions(data.filter(product => product.category === 'solution'));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (index: number) => {
    const icons = [Database, Shield, Settings, Headphones, Server, Cloud];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="w-6 h-6 text-primary" />;
  };

  if (loading) {
    return (
      <section id="services" className="py-12 md:py-24 px-4 md:px-12 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-12 md:py-24 px-4 md:px-12 bg-muted">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Nossos Serviços e Soluções
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Oferecemos uma gama completa de serviços de TI e soluções personalizadas para otimizar sua infraestrutura tecnológica
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Services Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border h-full">
              <h3 className="text-2xl font-bold mb-6 text-card-foreground text-center">
                Serviços Especializados
              </h3>
              
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div
                    key={service.id}
                    className="bg-background rounded-lg p-4 border border-border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getServiceIcon(index)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">
                          {service.name}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Solutions Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border h-full">
              <h3 className="text-2xl font-bold mb-6 text-card-foreground text-center">
                Soluções Integradas
              </h3>
              
              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <div
                    key={solution.id}
                    className="bg-background rounded-lg p-4 border border-border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getServiceIcon(index)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">
                          {solution.name}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {solution.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            Precisa de uma solução personalizada? Entre em contato conosco para discutir suas necessidades específicas.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductPlatform;