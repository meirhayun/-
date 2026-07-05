import { initNav, initHeaderScroll, highlightActiveLink } from '../components/nav';
import { initReveal } from '../components/reveal';
import { renderRatingSummary } from '../components/reviews';
import { googleReviews, renderReviewCard } from '../data/reviews';

initNav();
initHeaderScroll();
highlightActiveLink();

const grid = document.getElementById('reviewsGrid');
if (grid) {
  grid.innerHTML = googleReviews.map(renderReviewCard).join('');
}

renderRatingSummary('ratingSummary');
initReveal('.testimonial-card');
