import { initNav, initHeaderScroll, highlightActiveLink } from '../components/nav';
import { initReveal } from '../components/reveal';
import { initContactForm } from '../components/contactForm';

initNav();
initHeaderScroll();
highlightActiveLink();
initContactForm();
initReveal('.contact-item, .contact-form');
