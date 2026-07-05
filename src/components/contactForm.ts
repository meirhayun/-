import type { ContactFormData, ServiceType } from '../types';

const VALID_SERVICES: readonly ServiceType[] = ['home', 'building', 'cleaning', 'scaring'];

/** בדיקת תקינות מספר טלפון ישראלי (נייד או קווי). */
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return /^0\d{8,9}$/.test(digits);
}

function readForm(form: HTMLFormElement): ContactFormData {
  const data = new FormData(form);
  const rawService = String(data.get('service') ?? '');
  const service = (VALID_SERVICES as readonly string[]).includes(rawService)
    ? (rawService as ServiceType)
    : '';

  return {
    name: String(data.get('name') ?? '').trim(),
    phone: String(data.get('phone') ?? '').trim(),
    city: String(data.get('city') ?? '').trim(),
    service,
    message: String(data.get('message') ?? '').trim(),
  };
}

/** מאמת את נתוני הטופס ומחזיר רשימת שגיאות (ריקה = תקין). */
function validate(data: ContactFormData): string[] {
  const errors: string[] = [];
  if (data.name.length < 2) errors.push('נא להזין שם מלא תקין.');
  if (!isValidPhone(data.phone)) errors.push('נא להזין מספר טלפון ישראלי תקין.');
  return errors;
}

function showErrors(form: HTMLFormElement, errors: string[]): void {
  let box = form.querySelector<HTMLDivElement>('.form-errors');
  if (!box) {
    box = document.createElement('div');
    box.className = 'form-errors';
    form.prepend(box);
  }
  box.innerHTML = errors.map((e) => `<span>⚠️ ${e}</span>`).join('');
}

function showSuccess(form: HTMLFormElement, data: ContactFormData): void {
  form.innerHTML = `
    <div class="form-success">
      <div class="form-success-icon">✅</div>
      <h3>תודה ${data.name}, הבקשה נשלחה!</h3>
      <p>נחזור אליך לטלפון ${data.phone} תוך 24 שעות עם הצעת מחיר מותאמת.</p>
    </div>`;
}

/** מאתחל את טופס יצירת הקשר עם ולידציה. */
export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('#contactForm');
  if (!form) return;

  form.addEventListener('submit', (event: SubmitEvent) => {
    event.preventDefault();

    const data = readForm(form);
    const errors = validate(data);

    if (errors.length > 0) {
      showErrors(form, errors);
      return;
    }

    // בסביבת ייצור: שליחה ל-API / שירות דיוור
    console.info('פנייה חדשה:', data);
    showSuccess(form, data);
  });
}
