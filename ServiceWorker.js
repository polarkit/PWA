// Nom du cache
var CACHE_NAME = 'my-site-cache-v1';

// Fichiers à mettre en cache
var urlsToCache = [
  '/',
  '/styles/main.css',
  '/script/main.js'
];

// Installation du service worker et mise en cache des ressources essentielles
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepte les requêtes et sert les fichiers du cache si ils sont disponibles
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Le cache est trouvé, retourne la réponse
        if (response) {
          return response;
        }
        // Important : Clone la requête. Une requete est un flux et est à usage unique.
        // Il est consommé par l'appel à cache.match(), il doit donc être cloné pour être réutilisé pour le fetch
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Vérifie si nous avons reçu une réponse valide
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Important : Clone la réponse. Une réponse est un flux et parce qu'elle est à usage unique,
            // elle doit également être clonée pour être mise en cache et servie pour le fetch
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Mise à jour du service worker et suppression des caches obsolètes
self.addEventListener('activate', function(event) {
  var cacheWhitelist = ['my-site-cache-v1'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
