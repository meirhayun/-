import { serviceLabels, type ContactFormData, type ServiceType } from '../types';

import { WHATSAPP_URL } from '../config';



const VALID_SERVICES: readonly ServiceType[] = ['home', 'building', 'cleaning', 'scaring'];

const MAX_PHOTO_SIZE_MB = 10;



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



type PhotoDelivery = 'shared' | 'clipboard' | 'download';



async function tryShareWithPhoto(photo: File, message: string): Promise<'shared' | 'aborted' | 'unsupported'> {

  if (!navigator.share) return 'unsupported';



  const file = prepareShareFile(photo);

  const payloads: ShareData[] = [

    { files: [file], text: message },

    { files: [file] },

  ];



  for (const payload of payloads) {

    try {

      if (navigator.canShare && !navigator.canShare(payload)) continue;

      await navigator.share(payload);

      return 'shared';

    } catch (error) {

      if (error instanceof Error && error.name === 'AbortError') return 'aborted';

    }

  }



  return 'unsupported';

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



function buildWhatsAppMessage(data: ContactFormData, photoAttached = false): string {

  const lines = [

    'שלום, אני מעוניין/ת בהצעת מחיר.',

    '',

    `*שם:* ${data.name}`,

    `*טלפון:* ${data.phone}`,

  ];



  if (data.city) lines.push(`*עיר:* ${data.city}`);

  if (data.service) lines.push(`*סוג שירות:* ${serviceLabels[data.service]}`);

  if (data.message) lines.push('', `*פרטים:* ${data.message}`);

  if (photoAttached) lines.push('', '*צירפתי תמונה מהמקום.*');



  return lines.join('\n');

}



function showSuccess(form: HTMLFormElement, whatsappUrl: string, photoUrl: string, delivery: PhotoDelivery): void {

  const notes: Record<PhotoDelivery, string> = {

    shared: 'ההודעה והתמונה מוכנות בוואטסאפ — לחצו "שלח" כדי לסיים.',

    clipboard:

      'וואטסאפ נפתח עם ההודעה. <strong>הדביקו את התמונה</strong> בתיבת ההודעה (Ctrl+V / לחיצה ארוכה → הדבק) ואז שלחו.',

    download:

      'וואטסאפ נפתח עם ההודעה. <strong>צרפו את התמונה</strong> דרך סיכת המצורף 📎 — הקובץ כבר הורד למכשיר.',

  };



  form.innerHTML = `

    <div class="form-success">

      <div class="form-success-icon">✅</div>

      <h3>מעבירים אתכם לוואטסאפ</h3>

      <p>${notes[delivery]}</p>

      ${delivery === 'shared' ? '' : `<div class="form-success-photo"><img src="${photoUrl}" alt="התמונה שצילמתם"></div>`}

      <a href="${whatsappUrl}" class="btn btn-whatsapp btn-full" target="_blank" rel="noopener" style="margin-top:20px">

        פתיחה מחדש של וואטסאפ

      </a>

    </div>`;

}



async function submitToWhatsApp(form: HTMLFormElement, data: ContactFormData, photo: File): Promise<void> {

  const photoUrl = URL.createObjectURL(photo);

  const shareResult = await tryShareWithPhoto(photo, buildWhatsAppMessage(data, true));



  if (shareResult === 'aborted') {

    URL.revokeObjectURL(photoUrl);

    return;

  }



  if (shareResult === 'shared') {

    const whatsappUrl = `${WHATSAPP_URL}?text=${encodeURIComponent(buildWhatsAppMessage(data, true))}`;

    showSuccess(form, whatsappUrl, photoUrl, 'shared');

    return;

  }



  const message = buildWhatsAppMessage(data, false);

  const whatsappUrl = `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;

  const copied = await copyPhotoToClipboard(photo);

  const delivery: PhotoDelivery = copied ? 'clipboard' : 'download';



  if (!copied) downloadPhoto(photo);

  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

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

