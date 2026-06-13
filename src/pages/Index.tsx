import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import WhyOptiStrat from '@/components/WhyOptiStrat';
import BlogPreview from '@/components/BlogPreview';
import ReflectiveQuestions from '@/components/ReflectiveQuestions';
import ChatBot from '@/components/ChatBot';
import MiniContactForm from '@/components/MiniContactForm';
import SocialLinks from '@/components/SocialLinks';
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
        title="OptiStrat — Gestão de TI Especializada para Empresas" 
        description="Soluções completas de gestão de TI: infraestrutura em nuvem, cibersegurança, gestão de rede e suporte 24/7 para empresas em crescimento."
        imageUrl="/og-image.png"
        keywords={['gestão de TI', 'infraestrutura em nuvem', 'cibersegurança', 'gestão de rede', 'suporte de TI', 'tecnologia empresarial']}
      />
      <Hero />
      <ReflectiveQuestions />
      <WhyOptiStrat />
      <BlogPreview />
      <div id="contact" className="bg-gradient-to-b from-background to-secondary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <MiniContactForm />
          <SocialLinks />
        </div>
      </div>
      <Footer />
      <ChatBot />
    </PageLayout>
  );
};

export default Index;
