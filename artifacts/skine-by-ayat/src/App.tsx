import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Services } from '@/components/Services';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { ConsultationReviews } from '@/components/ConsultationReviews';
import { BeforeAfter } from '@/components/BeforeAfter';
import { Consultation } from '@/components/Consultation';
import { FAQ } from '@/components/FAQ';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { Admin } from '@/components/Admin';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const queryClient = new QueryClient();

const isAdmin =
  typeof window !== 'undefined' &&
  (window.location.pathname === '/admin' ||
    window.location.pathname.startsWith('/admin/'));

function MainSite() {
  return (
    <div className="min-h-screen w-full flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full">
        <Hero />
        <About />
        <Services />
        <ReviewsCarousel />
        <ConsultationReviews />
        <BeforeAfter />
        <Consultation />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="skine-theme">
        <LanguageProvider>
          {isAdmin ? <Admin /> : <MainSite />}
          <Toaster />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
