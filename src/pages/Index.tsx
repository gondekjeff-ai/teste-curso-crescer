
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import ITServices from '@/components/ITServices';
import Projects from '@/components/Projects';
import WhyOptiStrat from '@/components/WhyOptiStrat';
import BlogPreview from '@/components/BlogPreview';
import ProductPlatform from '@/components/ProductPlatform';
import ChatBot from '@/components/ChatBot';
import ContactForm from '@/components/ContactForm';
import MiniContactForm from '@/components/MiniContactForm';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useEffect } from 'react';

const Index = () => {
  // Fix any ID conflicts when the page loads
  useEffect(() => {
    const contactElements = document.querySelectorAll('[id="contact"]');
    if (contactElements.length > 1) {
      // If there are multiple elements with id="contact", rename one
      contactElements[1].id = 'contact-footer';
    }
  }, []);

  return (
    <PageLayout>
      <SEO 
        title="OptiStrat - Expert IT Management Solutions" 
        description="OptiStrat delivers comprehensive IT management services including cloud infrastructure, cybersecurity, network management, and 24/7 support for growing businesses."
        imageUrl="/src/assets/optistrat-logo-full.png"
        keywords={['IT management', 'cloud infrastructure', 'cybersecurity', 'network management', 'IT support', 'business technology', 'system optimization']}
      />
      <Hero />
      <ITServices />
      <ProductPlatform />
      <WhyOptiStrat />
      <Projects />
      <BlogPreview />
      <div id="contact" className="bg-gradient-to-b from-background to-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <ContactForm />
            </div>
            <div className="flex justify-center lg:justify-end">
              <MiniContactForm />
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ChatBot />
    </PageLayout>
  );
};

export default Index;
