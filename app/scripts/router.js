/**
 * Router
 */
window.maidsafeDemo.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider
  .state('/', {
      url: '/',
      templateUrl: 'views/landing.html'
    })
  .state('publicID', {
      url: '/manage_public_id',
      templateUrl: 'views/manage_public_id.html'
    })
  .state('manageService', {
      url: '/manage_service',
      templateUrl: 'views/manage_service.html'
    })
});
