/** Open a collapsed destination before measuring its scroll position. */
export function navigateToSection(href: string) {
  const section = document.getElementById(href.replace(/^#/, ''));
  if (!section) return;
  const disclosure = section.querySelector('details');
  if (disclosure) disclosure.open = true;
  section.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
