import { initNav, initHeaderScroll, highlightActiveLink } from '../components/nav';
import { initReveal } from '../components/reveal';

initNav();
initHeaderScroll();
highlightActiveLink();
initReveal('.service-card, .specialty-column, .step');
