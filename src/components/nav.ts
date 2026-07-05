/** מאתחל את תפריט הניווט הנייד (כפתור המבורגר). */
export function initNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>('.nav-toggle');
  const links = document.querySelector<HTMLUListElement>('.nav-links');

  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/** מוסיף צל לכותרת בעת גלילה. */
export function initHeaderScroll(): void {
  const header = document.getElementById('header');
  if (!header) return;

  const update = (): void => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/** מסמן את הקישור הפעיל בתפריט לפי הדף הנוכחי. */
export function highlightActiveLink(): void {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll<HTMLAnchorElement>('.nav-links a');

  links.forEach((link) => {
    const href = link.getAttribute('href') ?? '';
    if (href === path || (path === 'index.html' && href.startsWith('index'))) {
      link.classList.add('active-link');
    }
  });
}
