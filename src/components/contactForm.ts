import { serviceLabels, type ContactFormData, type ServiceType } from '../types';

import { WHATSAPP_URL } from '../config';

const VALID_SERVICES: readonly ServiceType[] = ['home', 'building', 'cleaning', 'scaring'];

const MAX_PHOTO_SIZE_MB = 10;

const WHATSAPP_PHONE = '972509996630';

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

function getPhotoFile(form: HTMLFormElement): File | null {
  const input = form.querySelector<HTMLInputElement>('#photo');
  return input?.files?.[0] ?? null;
}

function prepareShareFile(photo: File): File {
  const ext = photo.type === 'image/png' ? 'png' : photo.type === 'image/webp' ? 'webp' : 'jpg';
  const name = photo.name && !photo.name.startsWith('image.') ? photo.name : `photo-maakom.${ext}`;
  if (photo.name === name) return photo;
  return new File([photo], name, { type: photo.type || `image/${ext}` });
}

type PhotoDelivery = 'clipboard' | 'download';

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

async function copyPhotoToClipboard(photo: File): Promise<boolean> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') return false;

  try {
    const type = photo.type || 'image/jpeg';
    await navigator.clipboard.write([new ClipboardItem({ [type]: photo })]);
    return true;
  } catch {
    return false;
  }
}

function downloadPhoto(photo: File): void {
  const file = prepareShareFile(photo);
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}

/** מאמת את נתוני הטופס ומחזיר רשימת שגיאות (ריקה = תקין). */
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

function buildWhatsAppMessage(data: ContactFormData): string {
  const lines = [
    'שלום, אני מעוניין/ת בהצעת מחיר.',
    '',
    `*שם:* ${data.name}`,
    `*טלפון:* ${data.phone}`,
  ];

  if (data.city) lines.push(`*עיר:* ${data.city}`);
  if (data.service) lines.push(`*סוג שירות:* ${serviceLabels[data.service]}`);
  if (data.message) lines.push('', `*פרטים:* ${data.message}`);

  return lines.join('\n');
}

function showSuccess(form: HTMLFormElement, whatsappUrl: string, photoUrl: string, delivery: PhotoDelivery): void {
  const notes: Record<PhotoDelivery, string> = {
    clipboard:
      'נפתח צ\'אט וואטסאפ עם חיון (050-9996630) וההודעה מוכנה. <strong>הדביקו את התמונה</strong> (Ctrl+V / לחיצה ארוכה → הדבק) ולחצו שלח.',
    download:
      'נפתח צ\'אט וואטסאפ עם חיון (050-9996630) וההודעה מוכנה. <strong>צרפו את התמונה</strong> דרך 📎 — הקובץ כבר הורד למכשיר — ולחצו שלח.',
  };

  form.innerHTML = `
    <div class="form-success">
      <div class="form-success-icon">✅</div>
      <h3>מעבירים אתכם לוואטסאפ</h3>
      <p>${notes[delivery]}</p>
      <div class="form-success-photo"><img src="${photoUrl}" alt="התמונה שצילמתם"></div>
      <a href="${whatsappUrl}" class="btn btn-whatsapp btn-full" target="_blank" rel="noopener" style="margin-top:20px">
        פתיחה מחדש של וואטסאפ
      </a>
    </div>`;
}

async function submitToWhatsApp(form: HTMLFormElement, data: ContactFormData, photo: File): Promise<void> {
  const message = buildWhatsAppMessage(data);
  const whatsappUrl = buildWhatsAppUrl(message);
  const photoUrl = URL.createObjectURL(photo);
  const copied = await copyPhotoToClipboard(photo);
  const delivery: PhotoDelivery = copied ? 'clipboard' : 'download';

  if (!copied) downloadPhoto(photo);
  openWhatsAppChat(message);
  showSuccess(form, whatsappUrl, photoUrl, delivery);
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

/** מאתחל את טופס יצירת הקשר עם ולידציה. */
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
