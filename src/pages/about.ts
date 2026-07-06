import { initNav, initHeaderScroll, highlightActiveLink } from '../components/nav';
import { initReveal } from '../components/reveal';
import { initVideoGallery } from '../components/videoGallery';

initNav();
initHeaderScroll();
highlightActiveLink();
initVideoGallery();
initReveal('.about-block, .video-card, .about-highlight, .about-side-photo, .scattered-photos img');
