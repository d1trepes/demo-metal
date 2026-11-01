/**
 * Ждёт, пока картинки внутри блока загрузятся и раскодируются, но не дольше maxMs.
 * Нужен анимациям появления: блок въезжает уже с картинкой, а не пустым с последующим «впрыгиванием».
 */
export function imagesReady(root: Element, maxMs = 700): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  const decoded = Promise.all(images.map((img) => img.decode().catch(() => undefined)));
  const timeout = new Promise((resolve) => window.setTimeout(resolve, maxMs));
  return Promise.race([decoded, timeout]).then(() => undefined);
}
