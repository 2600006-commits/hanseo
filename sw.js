const CACHE_NAME = 'app-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
  // 게임보이 에뮬레이터에 적용할 경우 아래처럼 js 파일들도 추가해 주세요.
  // './assets/gameboy/GameBoyCore.js',
  // './assets/gameboy/GameBoyIO.js',
  // './assets/gameboy/resampler.js',
  // './assets/gameboy/XAudioServer.js',
  // './assets/gameboy/resize.js'
];

// 설치 시 캐시 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 네트워크 요청 시 캐시에서 먼저 반환 (오프라인 지원)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 반환, 없으면 네트워크 요청
        return response || fetch(event.request);
      })
  );
});