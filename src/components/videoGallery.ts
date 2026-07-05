/** מקורות סרטונים לדף האודות */
export interface VideoItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly src: string;
  readonly type: 'youtube' | 'local';
}

export const aboutVideos: readonly VideoItem[] = [
  {
    id: 'demo-1',
    title: 'התקנת רשת נגד יונים',
    description: 'דוגמה לעבודה מקצועית על גג בניין משותף',
    src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    type: 'youtube',
  },
  {
    id: 'demo-2',
    title: 'עבודה בגובה — הרחקת יונים',
    description: 'צוות מוסמך מבצע התקנה בטוחה ומדויקת',
    src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    type: 'youtube',
  },
];

export function initVideoGallery(containerId = 'videoGallery'): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = aboutVideos
    .map(
      (video) => `
    <article class="video-card" data-video-id="${video.id}">
      <div class="video-wrapper">
        ${
          video.type === 'youtube'
            ? `<iframe src="${video.src}" title="${video.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
            : `<video controls preload="metadata"><source src="${video.src}" type="video/mp4">הדפדפן שלך לא תומך בהצגת וידאו.</video>`
        }
      </div>
      <div class="video-info">
        <h3>${video.title}</h3>
        <p>${video.description}</p>
      </div>
    </article>`,
    )
    .join('');
}
