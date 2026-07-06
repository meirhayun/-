import { initNav, initHeaderScroll, highlightActiveLink } from '../components/nav';
import { initReveal } from '../components/reveal';
import { googleReviews, renderReviewCard } from '../data/reviews';

initNav();
initHeaderScroll();
highlightActiveLink();

const homeReviews = document.getElementById('homeReviews');
if (homeReviews) {
  homeReviews.innerHTML = googleReviews.slice(0, 3).map(renderReviewCard).join('');
}

initReveal('.why-card, .scattered-photos img, .testimonial-card');
