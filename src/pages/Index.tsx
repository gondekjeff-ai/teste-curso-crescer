import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import ITServices from '@/components/ITServices';
import WhyOptiStrat from '@/components/WhyOptiStrat';
import BlogPreview from '@/components/BlogPreview';
import ProductPlatform from '@/components/ProductPlatform';
import ChatBot from '@/components/ChatBot';
import MiniContactForm from '@/components/MiniContactForm';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { IndexPopup } from '@/components/IndexPopup';
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
      <IndexPopup />
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
      <BlogPreview />
      <div id="contact" className="bg-gradient-to-b from-background to-secondary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <MiniContactForm />
        </div>
      </div>
      <Footer />
      <ChatBot />
    </PageLayout>
  );
};

export default Index;
