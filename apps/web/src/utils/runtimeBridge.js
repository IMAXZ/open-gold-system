function getCapacitorRuntime() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.Capacitor || null;
}

function getCapacitorPlugin(name) {
  const runtime = getCapacitorRuntime();
  return runtime?.Plugins?.[name] || null;
}

export function isNativeContainer() {
  const runtime = getCapacitorRuntime();
  if (!runtime) {
    return false;
  }

  if (typeof runtime.isNativePlatform === 'function') {
    return runtime.isNativePlatform();
  }

  if (typeof runtime.getPlatform === 'function') {
    return runtime.getPlatform() !== 'web';
  }

  return false;
}

export function getRuntimeCapabilities() {
  const runtime = getCapacitorRuntime();

  return {
    nativeContainer: isNativeContainer(),
    platform: typeof runtime?.getPlatform === 'function' ? runtime.getPlatform() : 'web',
    canShare: Boolean(getCapacitorPlugin('Share')?.share || navigator.share),
    canOpenExternal: Boolean(getCapacitorPlugin('Browser')?.open || typeof window !== 'undefined')
  };
}

async function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  return false;
}

export async function shareCurrentPage() {
  const title = typeof document !== 'undefined' ? document.title || '黄金价格看板' : '黄金价格看板';
  const text = '查看当前黄金价格看板';
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const nativeShare = getCapacitorPlugin('Share');

  if (nativeShare?.share) {
    await nativeShare.share({ title, text, url });
    return 'native-share';
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    await navigator.share({ title, text, url });
    return 'web-share';
  }

  if (url && await copyToClipboard(url)) {
    return 'copied';
  }

  if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
    window.prompt('请复制当前链接进行分享', url);
    return 'prompt';
  }

  return 'unsupported';
}

export async function openCurrentPageExternally() {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const nativeBrowser = getCapacitorPlugin('Browser');

  if (nativeBrowser?.open) {
    await nativeBrowser.open({ url });
    return 'native-browser';
  }

  if (typeof window !== 'undefined' && url) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return 'window-open';
  }

  return 'unsupported';
}
