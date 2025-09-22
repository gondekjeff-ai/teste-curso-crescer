
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import ITServices from '@/components/ITServices';
import Projects from '@/components/Projects';
import WhyOptiStrat from '@/components/WhyOptiStrat';
import BlogPreview from '@/components/BlogPreview';
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
      <WhyOptiStrat />
      <Projects />
      <BlogPreview />
    </PageLayout>
  );
};

export default Index;
