import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { navigateToSection } from '@/lib/sectionNavigation';

export function ExpandableSection({ id, title, icon: Icon, children }: {
  id: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === `#${id}` && detailsRef.current) {
        navigateToSection(`#${id}`);
      }
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [id]);

  return (
    <section id={id} className="expandable-section bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl">
        <details ref={detailsRef} className="section-disclosure">
          <summary>
            <Icon size={22} aria-hidden="true" />
            <h2>{title}</h2>
            <ChevronDown className="disclosure-chevron" size={20} aria-hidden="true" />
          </summary>
          <div className="disclosure-content">{children}</div>
        </details>
      </div>
    </section>
  );
}
