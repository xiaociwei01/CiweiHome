/* CiweiHome Service Worker v1 */
var CACHE_NAME = 'ciweihome-v1';
var STATIC_ASSETS = [
    './',
    './index.html',
    './FriendQuan.html',
    './manifest.json',
    './ciweipet.css',
    './ciweipet.js',
    './ciweitouxiang.jpg',
    './FriendQuan.jpg',
    './xiaotaiyang.jpg',
    './diyue.jpg',
    './wechat_qr.jpg',
    './qq_qr.jpg'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) { return cache.addAll(STATIC_ASSETS); })
            .then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (k) { return k !== CACHE_NAME; })
                    .map(function (k) { return caches.delete(k); })
            );
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function (e) {
    if (e.request.method !== 'GET') return;
    var url = new URL(e.request.url);

    // 外部请求（GitHub API、CDN 等）→ 不缓存，直接走网络
    if (url.origin !== location.origin) return;

    // HTML 页面 → Network First（保证内容最新）
    var accept = e.request.headers.get('accept') || '';
    var isHTML = accept.indexOf('text/html') !== -1;

    if (isHTML) {
        e.respondWith(
            fetch(e.request).then(function (res) {
                if (res && res.status === 200) {
                    var clone = res.clone();
                    caches.open(CACHE_NAME).then(function (c) {
                        c.put(e.request, clone);
                    });
                }
                return res;
            }).catch(function () {
                return caches.match(e.request);
            })
        );
        return;
    }

    // 静态资源（图片、CSS、JS）→ Cache First（快）
    e.respondWith(
        caches.match(e.request).then(function (cached) {
            var network = fetch(e.request).then(function (res) {
                if (res && res.status === 200) {
                    var clone = res.clone();
                    caches.open(CACHE_NAME).then(function (c) {
                        c.put(e.request, clone);
                    });
                }
                return res;
            }).catch(function () { return cached; });
            return cached || network;
        })
    );
});