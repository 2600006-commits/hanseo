// 출석 체크 명렬표 - 서비스워커
// 앱을 홈 화면에 설치했을 때 오프라인에서도 기본 화면이 뜨도록 핵심 파일을 캐시합니다.
// * 저장/동기화(클라우드) 요청은 항상 네트워크로 직접 보내고 캐시하지 않습니다.

const CACHE_VERSION = 'attendance-app-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './gameboy-emulator.html',
  './GameBoyCore.js',
  './GameBoyIO.js',
  './resize.js',
  './XAudioServer.js',
  './resampler.js',
  './XAudioServerMediaStreamWorker.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // 개별 파일 중 하나라도 없으면 전체가 실패하는 addAll 대신,
      // 파일별로 따로 시도해서 일부만 없어도 나머지는 정상 캐시되게 한다.
      return Promise.all(CORE_ASSETS.map((url) => cache.add(url).catch(() => {})));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // GET 요청(화면/파일 로딩)만 캐시 대상으로 하고, 저장(POST 등)은 항상 네트워크로 보낸다.
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
      // 캐시가 있으면 우선 즉시 보여주고(오프라인에서도 빠르게 뜨도록), 동시에 최신 버전을 백그라운드에서 받아 다음 실행에 반영한다.
      return cached || network;
    })
  );
});
