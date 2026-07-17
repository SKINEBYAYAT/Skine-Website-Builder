import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function Contact() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        description: t('contact.form.success'),
        duration: 3000,
      });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <section id="contact" className="py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('contact.title')}
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-5 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 space-y-8"
          >
            <div className="bg-card p-6 rounded-2xl border border-card-border shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => window.open('https://wa.me/', '_blank')}>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">WhatsApp</h3>
                <p className="text-muted-foreground text-sm">Direct message</p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-card-border shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => window.open('https://instagram.com', '_blank')}>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                <Instagram size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Instagram</h3>
                <p className="text-muted-foreground text-sm">@skinebyayat</p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-card-border shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => window.location.href = 'mailto:info@skinebyayat.com'}>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Email</h3>
                <p className="text-muted-foreground text-sm">info@skinebyayat.com</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-3 bg-card p-8 rounded-3xl border border-card-border shadow-md"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('contact.form.name')}</label>
                <Input required placeholder={t('contact.form.name')} className="bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('contact.form.email')}</label>
                <Input required type="text" placeholder={t('contact.form.email')} className="bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('contact.form.message')}</label>
                <Textarea required placeholder={t('contact.form.message')} className="bg-background min-h-[150px]" />
              </div>
              <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? '...' : t('contact.form.submit')}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
