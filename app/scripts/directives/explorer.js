window.maidsafeDemo.directive('explorer', ['safeApiFactory', function(safeApi) {

  var Explorer = function($scope, element, attrs) {
    var rootFolder = '/' + ($scope.isPrivate ? 'private' : 'public') + '/';
    $scope.currentDirectory = rootFolder + ($scope.startingPath ? ($scope.startingPath + '/') : '');
    $scope.mime = require('mime');
    $scope.selectedPath = null;
    $scope.dir = null;
    $scope.isFileSelected;

    var getDirectory = function() {
      var onResponse = function(err, dir) {
        if (err) {
          return console.error(err);
        }
        $scope.dir = JSON.parse(dir);
        $scope.$applyAsync();
      };
      safeApi.getDir(onResponse, $scope.currentDirectory, false);
    };

    $scope.upload = function(isFile) {
      $scope.uploadDialog = false;
      var dialog = require('remote').dialog;
      dialog.showOpenDialog({
        title: 'Select Directory for upload',
        properties: isFile ? [] : ['openDirectory']
      }, function(selection) {
        if (!selection || selection.length === 0) {
          return;
        }
        // TODO instead of binding uploader to window use require
        var uploader = new window.uiUtils.Uploader(safeApi);
        var progress = uploader.upload(selection[0], $scope.isPrivate, $scope.currentDirectory);
        progress.onUpdate = function() {
          var progressCompletion = (((progress.completed + progress.failed) / progress.total) * 100);
          if (progressCompletion === 100) {
            getDirectory();
          }
          $scope.onUpload({
            percentage: progressCompletion
          });
        };
      });
    };

    $scope.rename = function(newName) {
      var callback = function(err) {
        if (err) {
          alert('Rename failed');
        }
        getDirectory();
      };
      var oldPath = $scope.currentDirectory + $scope.selected;
      if ($scope.isFileSelected) {
        safeApi.renameFile(oldPath, false, newName, callback);
      } else {
        safeApi.renameDirectory(oldPath, false, newName, callback);
      }
    };

    $scope.download = function(fileName) {
      $scope.isFileSelected = true;
      $scope.selectedPath = fileName;
      var onResponse = function(err, data) {
        if (err) {
          return console.error(err);
        }
        var tempDir = require('temp').mkdirSync('safe-demo-');
        var filePath = require('path').resolve(tempDir, fileName);
        require('fs').writeFileSync(filePath, new Buffer(data));
        window.downData = data;
        require('remote').shell.openItem(filePath);
      };
      safeApi.getFile($scope.currentDirectory + $scope.selectedPath, false, onResponse);
    };

    $scope.delete = function() {
      var path = $scope.currentDirectory + '/' + $scope.selectedPath;
      var onDelete = function(err) {
        if (err) {
          return console.error(err);
        }
        getDirectory();
      };
      if ($scope.isFileSelected) {
        safeApi.deleteFile(path, false, onDelete);
      } else {
        safeApi.deleteDirectory(path, false, onDelete);
      }
    };

    $scope.openDirectory = function(directoryName) {
      $scope.selectedPath = directoryName;
      $scope.currentDirectory += ($scope.selectedPath + '/');
      getDirectory();
    };

    $scope.select = function(name, isFile) {
      $scope.isFileSelected = isFile;
      $scope.selectedPath = name;
      window.sc = $scope;
      if (isFile || !$scope.onDirectorySelected) {
        return;
      }
      $scope.onDirectorySelected({
        name: $scope.currentDirectory + $scope.selectedPath + '/'
      });
    };

    $scope.back = function() {
      var tokens = $scope.currentDirectory.split('/');
      tokens.pop();
      tokens.pop();
      var path = tokens.join('/');
      if (!path) {
        return;
      }
      $scope.currentDirectory = path + '/';
      $scope.selectedPath = null;
      getDirectory();
    };

    $scope.rename = false;
    getDirectory();
  };

  return {
    restrict: 'E',
    scope: {
      isPrivate: '=',
      startingPath: '=',
      onDirectorySelected: '&',
      onUpload: '&'
    },
    templateUrl: './views/explorer.html',
    link: Explorer
  };
}]);
