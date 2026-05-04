export {};

const bootTimestamp = new Intl.DateTimeFormat('en', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
}).format(new Date());

console.info(`[Pummarola] App loaded at ${bootTimestamp}`);

declare global {
  interface Window {
    L?: any;
  }
}

const loadStylesheet = (href: string) => new Promise<void>((resolve, reject) => {
  const existing = document.querySelector<HTMLLinkElement>(`link[href="${href}"]`);

  if (existing) {
    resolve();
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.onload = () => resolve();
  link.onerror = () => reject(new Error(`Unable to load stylesheet: ${href}`));
  document.head.append(link);
});

const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

  if (existing) {
    if (window.L) {
      resolve();
      return;
    }

    existing.addEventListener('load', () => resolve(), { once: true });
    existing.addEventListener('error', () => reject(new Error(`Unable to load script: ${src}`)), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error(`Unable to load script: ${src}`));
  document.body.append(script);
});