/**
 * אנימציית חשיפה הדרגתית בעת גלילה.
 * עובד כשיפור הדרגתי: אם IntersectionObserver לא נתמך, האלמנטים פשוט מוצגים.
 */
export function initReveal(
  selector = '.service-card, .step, .testimonial-card, .about-feature',
): void {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (elements.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => {
      el.style.opacity = '1';
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        obs.unobserve(el);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
  );

  elements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
    observer.observe(el);
  });
}
