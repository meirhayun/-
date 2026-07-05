import type { ServiceType } from '../types';

type FilterValue = ServiceType | 'all';

interface ReviewCard {
  readonly el: HTMLElement;
  readonly service: string;
  readonly rating: number;
}

function collectCards(): ReviewCard[] {
  const cards = document.querySelectorAll<HTMLElement>('.testimonial-card');
  return Array.from(cards).map((el) => ({
    el,
    service: el.dataset.service ?? 'all',
    rating: Number(el.dataset.rating ?? '5'),
  }));
}

/** מחשב ומציג סיכום דירוג (ממוצע + כמות) באלמנט היעד. */
export function renderRatingSummary(targetId: string): void {
  const target = document.getElementById(targetId);
  if (!target) return;

  const cards = collectCards();
  if (cards.length === 0) return;

  const total = cards.reduce((sum, card) => sum + card.rating, 0);
  const average = total / cards.length;
  const rounded = Math.round(average);

  target.innerHTML = `
    <div class="rating-score">${average.toFixed(1)}</div>
    <div class="rating-details">
      <div class="rating-stars">${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}</div>
    </div>`;
}

/** מחבר את כפתורי הסינון לסינון כרטיסי הביקורות לפי סוג שירות. */
export function initReviewFilters(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
  if (buttons.length === 0) return;

  const cards = collectCards();

  const applyFilter = (filter: FilterValue): void => {
    cards.forEach(({ el, service }) => {
      const visible = filter === 'all' || service === filter;
      el.style.display = visible ? '' : 'none';
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      const filter = (button.dataset.filter ?? 'all') as FilterValue;
      applyFilter(filter);
    });
  });
}
