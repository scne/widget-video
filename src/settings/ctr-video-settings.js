angular.module("risevision.widget.video.settings")
  .controller("videoSettingsController", ["$scope", "$log", "commonSettings",
    function ($scope, $log, commonSettings) {

      $scope.$watch("settings.additionalParams.url", function (url) {
        if (typeof url !== "undefined" && url !== "") {
          if ($scope.settingsForm.videoUrl.$valid ) {
            $scope.settings.additionalParams.videoStorage = commonSettings.getStorageUrlData(url);
          } else {
            $scope.settings.additionalParams.videoStorage = {};
          }
        }
      });

      $scope.$watch("settings.additionalParams.background.image.url", function (url) {
        if (typeof url !== "undefined" && url !== "") {
          if ($scope.settingsForm.background.$valid ) {
            $scope.settings.additionalParams.backgroundStorage = commonSettings.getStorageUrlData(url);
          } else {
            $scope.settings.additionalParams.backgroundStorage = {};
          }
        }
      });

    }])
  .value("defaultSettings", {
    params: {},
    additionalParams: {
      url: "",
      videoStorage: {},
      video: {},
      background: {},
      backgroundStorage: {}
    }
  });
