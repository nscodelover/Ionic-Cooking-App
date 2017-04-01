// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.help', {
    url: '/help',
    views: {
      'helpContent': {
        templateUrl: 'templates/help.html',
        controller: 'SucheCtrl'
      }
    }
  })

  .state('app.suche', {
    url: '/suche',
    views: {
      'menuContent': {
        templateUrl: 'templates/suche.html',
        controller: 'SucheCtrl'
      }
    }
  })

  .state('app.ingredients_dialog', {
    url: '/ingredients_dialog',
    views: {
      'menuContent': {
        templateUrl: 'templates/ingredients_dialog.html',
        controller: 'SucheCtrl'
      }
    }
  })

  .state('app.recipe_detail', {
    url: '/recipe_detail',
    views: {
      'menuContent': {
        templateUrl: 'templates/recipe_detail.html',
        controller: 'RecipeDetailCtrl'
      }
    }
  })

  .state('app.suchergebnis', {
    url: '/suchergebnis',
    views: {
      'menuContent': {
        templateUrl: 'templates/suchergebnis.html',
        controller: 'SuchergebnisCtrl'
      }
    }
  })

  .state('app.kochtipps', {
    url: '/kochtipps',
    views: {
      'menuContent': {
        templateUrl: 'templates/kochtipps.html'
        // controller: 'KochtippsCtrl'
      }
    }
  })

  .state('app.favoriten', {
    url: '/favoriten',
    views: {
      'menuContent': {
        templateUrl: 'templates/favoriten.html',
        controller: 'FavoriteCtrl'
      }
    }
  })

  .state('app.impressum', {
    url: '/impressum',
    views: {
      'menuContent': {
        templateUrl: 'templates/impressum.html'
      }
    }
  })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/suche');
});
