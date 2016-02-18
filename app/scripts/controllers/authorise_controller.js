/**
 * Authorisation controller
 */
window.maidsafeDemo.controller('AuthoriseCtrl', [ '$scope', '$state', 'safeApiFactory', function($scope, $state, safe) {
  'use strict';
  var dirPath = '/shankar_home_new';

  // initialization
  $scope.init = function() {
    var createPvtDirCb = function(err, res) {
      if (err) {
        return console.error(err);
      }
      $state.go('home');
      console.log(res);
    };

    var createPubDirCb = function(err, res) {
      if (err) {
        return console.error(err);
      }
      safe.createDir('/private', true, '', false, false, createPvtDirCb);
    };

    var getDirCb = function(err, res) {
      if (err) {
        return console.error(err);
      }
      console.log('Get Dir');
      console.log(res);
      res = JSON.parse(res);
      if (res.subDirectories.length === 0) {
        safe.createDir('/public', true, '', false, false, createPubDirCb);
      } else {
        $state.go('home');
      }
    };

    var authoriseCb = function(err, res) {
      if (err) {
        return console.error(err);
      }
      console.log('Application authorised');
      console.log(res);
      safe.getDir(getDirCb, '/');
    };
    safe.authorise(authoriseCb);
  };
} ]);
