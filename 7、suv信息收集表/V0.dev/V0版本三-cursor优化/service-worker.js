// 缓存名称和版本
const STATIC_CACHE_NAME = 'car-evaluator-static-v1.1';
const DYNAMIC_CACHE_NAME = 'car-evaluator-dynamic-v1.1';
const RUNTIME_CACHE_NAME = 'car-evaluator-runtime-v1.1';

// 核心静态资源（离线必需）
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
  // 移除不存在的资源
  // '/icons/icon-192x192.png',
  // '/icons/icon-512x512.png'
];

// 预缓存的CDN资源（核心依赖）
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js'
];

// 按需缓存（非核心依赖）
const ON_DEMAND_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/highcharts@10.3.3/highcharts.min.js',
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
];

// 安装Service Worker - 预缓存核心资源
self.addEventListener('install', event => {
  console.log('[Service Worker] 正在安装');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] 预缓存核心静态资源');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => caches.open(DYNAMIC_CACHE_NAME))
      .then(cache => {
        console.log('[Service Worker] 预缓存CDN资源');
        return cache.addAll(CDN_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活Service Worker - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('[Service Worker] 激活');
  
  const currentCaches = [
    STATIC_CACHE_NAME, 
    DYNAMIC_CACHE_NAME, 
    RUNTIME_CACHE_NAME
  ];
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => !currentCaches.includes(cacheName))
            .map(cacheName => {
              console.log('[Service Worker] 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] 声明控制权');
        return self.clients.claim();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // 跳过不支持缓存的请求
  if (event.request.method !== 'GET') {
    return;
  }
  
  // 判断请求类型
  const isCoreAsset = CORE_ASSETS.some(asset => 
    url.pathname === asset || 
    (asset === '/' && url.pathname === '/index.html')
  );
  
  const isCdnAsset = CDN_ASSETS.some(asset => 
    event.request.url.includes(asset)
  );
  
  const isOnDemandAsset = ON_DEMAND_ASSETS.some(asset => 
    event.request.url.includes(asset)
  );
  
  // 核心静态资源: 缓存优先 (Cache First)
  if (isCoreAsset) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // 备份：从网络获取并缓存
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200) {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            });
        })
    );
    return;
  }
  
  // CDN核心资源: 缓存优先，同时更新缓存 (Cache First, Update Cache)
  if (isCdnAsset) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // 返回缓存同时更新缓存
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(DYNAMIC_CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return networkResponse;
            })
            .catch(() => {
              console.log('[Service Worker] 离线模式，使用缓存');
            });
            
          // 有缓存就用缓存，同时在后台更新
          return cachedResponse || fetchPromise;
        })
    );
    return;
  }
  
  // 按需资源: 网络优先，失败回退到缓存 (Network First with Cache Fallback)
  if (isOnDemandAsset) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) {
            return response;
          }
          
          // 缓存响应
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(() => {
          // 从缓存获取
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // 其他资源: 网络优先，离线时回退到离线页面 (Network First with Offline Fallback)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200) {
          return response;
        }
        
        // 对常规请求进行缓存
        if (event.request.url.startsWith(self.location.origin) || 
            event.request.url.includes('cdn')) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        
        return response;
      })
      .catch(() => {
        // 网络错误时尝试缓存
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // 如果是页面导航请求，返回首页
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // 对于其他资源，返回离线标志
            return new Response('网络连接失败，请检查网络设置', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain; charset=UTF-8'
              })
            });
          });
      })
  );
});

// 后台同步
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// 数据同步函数
function syncData() {
  // 这里实现数据同步逻辑
  console.log('[Service Worker] 执行数据同步');
  return Promise.resolve();
}

// 推送通知
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || '有新消息',
      icon: '/images/icon.png',
      badge: '/images/icon.png'
    };
    
    event.waitUntil(
      self.registration.showNotification('车评家', options)
    );
  }
});