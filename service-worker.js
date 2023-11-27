// Nom du cache
var CACHE_NAME = 'ginkobus-pwa-v1';

// Fichiers à mettre en cache
var urlsToCache = [
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable_icon",
  "index.html",
  "app.js",
  "ginkobus.webmanifest",
  "style.css"
];

// Installation du service worker et mise en cache des ressources essentielles
self.addEventListener('install', function(event) {
  event.waitUntil(
    (async ()=> {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(urlsToCache);
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