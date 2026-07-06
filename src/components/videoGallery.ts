/** מקורות סרטונים לדף האודות */
export interface VideoItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly src: string;
  readonly type: 'youtube' | 'local';
}

export const aboutVideos: readonly VideoItem[] = [];

export function initVideoGallery(containerId = 'videoGallery'): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  const note = container.parentElement?.querySelector<HTMLElement>('.video-note');

  if (aboutVideos.length === 0) {
    container.hidden = true;
    if (note) note.hidden = true;
    return;
  }

  if (note) note.hidden = false;
  container.hidden = false;

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
