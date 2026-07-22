import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { Pricing } from '@/components/Pricing';
import { Consultation } from '@/components/Consultation';
import { Location } from '@/components/Location';
import { WhatsAppSection } from '@/components/WhatsAppSection';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { BeforeAfter } from '@/components/BeforeAfter';
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
        {/* 1 */} <Hero />
        {/* 2 */} <Services />
        {/* 4 */} <Pricing />
        {/* 5 */} <Consultation />
        {/* 6 */} <Location />
        {/* 7 */} <WhatsAppSection />
        {/* 8 */} <ReviewsCarousel />
        {/* 9 */} <BeforeAfter />
        {/* 10 */} <FAQ />
        {/* 11 */} <Contact />
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
