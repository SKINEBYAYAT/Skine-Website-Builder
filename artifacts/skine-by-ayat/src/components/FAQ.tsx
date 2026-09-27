import { HelpCircle } from 'lucide-react';
import { ExpandableSection } from '@/components/ExpandableSection';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQ() {
  const { t } = useLanguage();

  const faqs = Array.from({ length: 22 }, (_, i) => i + 1);

  return (
    <ExpandableSection id="faq" title={t('faq.title')} icon={HelpCircle}>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((num) => (
              <AccordionItem 
                key={num} 
                value={`item-${num}`}
                className="bg-card px-6 py-2 rounded-2xl border border-card-border shadow-sm"
              >
                <AccordionTrigger className="text-base md:text-lg font-medium hover:no-underline hover:text-primary transition-colors py-4">
                  {t(`faq.${num}.q`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                  {t(`faq.${num}.a`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
    </ExpandableSection>
  );
}
