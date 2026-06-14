export async function loadAssets(manifestUrl = 'assets/asset-manifest.json') {
  const baseUrl = manifestUrl.slice(0, manifestUrl.lastIndexOf('/') + 1);
  const manifest = await fetch(manifestUrl).then((response) => response.json());
  const images = {};
  const sounds = {};

  await Promise.all(Object.entries(manifest.images ?? {}).map(async ([key, path]) => {
    images[key] = await loadImage(baseUrl + path).catch(() => null);
  }));

  for (const [key, path] of Object.entries(manifest.sounds ?? {})) {
    sounds[key] = createAudio(baseUrl + path);
  }

  return { manifest, images, sounds };
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function createAudio(source) {
  const audio = new Audio(source);
  audio.preload = 'auto';
  return audio;
}

export function playSound(audio, options = {}) {
  if (!audio) {
    return;
  }

  try {
    const instance = audio.cloneNode();
    instance.volume = options.volume ?? 0.35;
    instance.loop = options.loop ?? false;
    void instance.play();
    return instance;
  } catch {
    return null;
  }
}
