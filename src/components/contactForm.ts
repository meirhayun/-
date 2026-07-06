import { serviceLabels, type ContactFormData, type ServiceType } from '../types';
import { WHATSAPP_URL } from '../config';
import { uploadContactPhoto } from '../services/uploadContactPhoto';

const VALID_SERVICES: readonly ServiceType[] = ['home', 'building', 'cleaning', 'scaring'];
const MAX_PHOTO_SIZE_MB = 10;
const WHATSAPP_PHONE = '972509996630';

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

function getPhotoFile(form: HTMLFormElement): File | null {
  const input = form.querySelector<HTMLInputElement>('#photo');
  return input?.files?.[0] ?? null;
}

function buildWhatsAppUrl(message: string): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

function openWhatsAppChat(message: string): void {
  const url = buildWhatsAppUrl(message);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = `whatsapp://send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
    window.setTimeout(() => {
      window.location.href = url;
    }, 800);
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

function validate(form: HTMLFormElement, data: ContactFormData): string[] {
  const errors: string[] = [];
  if (data.name.length < 2) errors.push('נא להזין שם מלא תקין.');
  if (!isValidPhone(data.phone)) errors.push('נא להזין מספר טלפון ישראלי תקין.');

  const photo = getPhotoFile(form);
  if (!photo) {
    errors.push('נא לצלם או להעלות תמונה מהמקום.');
  } else if (!photo.type.startsWith('image/')) {
    errors.push('ניתן להעלות קובץ תמונה בלבד.');
  } else if (photo.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
    errors.push(`גודל התמונה המקסימלי הוא ${MAX_PHOTO_SIZE_MB}MB.`);
  }

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

function buildWhatsAppMessage(data: ContactFormData, photoUrl: string): string {
  const lines = [
    'שלום, אני מעוניין/ת בהצעת מחיר.',
    '',
    `*שם:* ${data.name}`,
    `*טלפון:* ${data.phone}`,
  ];

  if (data.city) lines.push(`*עיר:* ${data.city}`);
  if (data.service) lines.push(`*סוג שירות:* ${serviceLabels[data.service]}`);
  if (data.message) lines.push('', `*פרטים:* ${data.message}`);
  lines.push('', '*תמונה מהמקום:*', photoUrl);

  return lines.join('\n');
}

function setSubmitting(form: HTMLFormElement, submitting: boolean): void {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!button) return;

  button.disabled = submitting;
  button.textContent = submitting ? 'מעלה תמונה ומעביר לוואטסאפ...' : 'שלח בקשה להצעת מחיר';
}

function showSuccess(form: HTMLFormElement, whatsappUrl: string, photoUrl: string): void {
  form.innerHTML = `
    <div class="form-success">
      <div class="form-success-icon">✅</div>
      <h3>מעבירים אתכם לוואטסאפ</h3>
      <p>נפתח צ'אט עם חיון (050-9996630). ההודעה כוללת את כל הפרטים <strong>וקישור לתמונה</strong> — לחצו שלח.</p>
      <div class="form-success-photo"><img src="${photoUrl}" alt="התמונה שצילמתם"></div>
      <a href="${whatsappUrl}" class="btn btn-whatsapp btn-full" target="_blank" rel="noopener" style="margin-top:20px">
        פתיחה מחדש של וואטסאפ
      </a>
    </div>`;
}

async function submitToWhatsApp(form: HTMLFormElement, data: ContactFormData, photo: File): Promise<void> {
  setSubmitting(form, true);

  try {
    const uploadedPhotoUrl = await uploadContactPhoto(photo);
    const message = buildWhatsAppMessage(data, uploadedPhotoUrl);
    const whatsappUrl = buildWhatsAppUrl(message);

    openWhatsAppChat(message);
    showSuccess(form, whatsappUrl, uploadedPhotoUrl);
  } catch {
    setSubmitting(form, false);
    showErrors(form, ['לא הצלחנו להעלות את התמונה. בדקו חיבור לאינטרנט ונסו שוב.']);
  }
}

function initPhotoPreview(form: HTMLFormElement): void {
  const input = form.querySelector<HTMLInputElement>('#photo');
  const preview = form.querySelector<HTMLDivElement>('#photoPreview');
  const previewImg = form.querySelector<HTMLImageElement>('#photoPreviewImg');
  const uploadLabel = form.querySelector<HTMLLabelElement>('#photoUploadLabel');
  const removeBtn = form.querySelector<HTMLButtonElement>('#photoRemove');

  if (!input || !preview || !previewImg || !uploadLabel || !removeBtn) return;

  let objectUrl: string | null = null;

  const clearPreview = (): void => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
    input.value = '';
    preview.hidden = true;
    previewImg.removeAttribute('src');
    uploadLabel.hidden = false;
  };

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) {
      clearPreview();
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    previewImg.src = objectUrl;
    preview.hidden = false;
    uploadLabel.hidden = true;
    form.querySelector('.form-errors')?.remove();
  });

  removeBtn.addEventListener('click', clearPreview);
}

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>('#contactForm');
  if (!form) return;

  initPhotoPreview(form);

  form.addEventListener('submit', async (event: SubmitEvent) => {
    event.preventDefault();

    const data = readForm(form);
    const errors = validate(form, data);

    if (errors.length > 0) {
      showErrors(form, errors);
      return;
    }

    const photo = getPhotoFile(form);
    if (!photo) return;

    form.querySelector('.form-errors')?.remove();
    await submitToWhatsApp(form, data, photo);
  });
}
