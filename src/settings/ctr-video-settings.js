angular.module("risevision.widget.video.settings")
  .controller("videoSettingsController", ["$scope", "$log", "commonSettings",
    function ($scope, $log, commonSettings) {

      // Using this to apply an initial one time error message regarding url being required
      $scope.initialView = true;
      $scope.invalidFormat = false;

      var initialUrlWatcher = $scope.$watch("settings.additionalParams.url", function (newUrl, oldUrl) {
        if (typeof newUrl !== "undefined") {
          if (typeof oldUrl === "undefined" && newUrl === "") {
            /* Settings have never been saved (initial save state), need to force validity on form to be false
             because the URL Field component deliberately does not initially trigger an invalid state
             */
            $scope.settingsForm.$setValidity("urlEntry", false);
          } else if (newUrl !== "") {
            // entry has occurred
            $scope.initialView = false;
            $scope.settingsForm.$setValidity("urlEntry", true);

            // destroy watcher
            initialUrlWatcher();
          }
        }
      });

      $scope.$watch("settings.additionalParams.url", function (url) {
        var testUrl, isWebM;

        if (typeof url !== "undefined" && url !== "") {
          testUrl = url.toLowerCase();
          isWebM = (testUrl.indexOf(".webm") !== -1);

          // only if URL Field is valid (so not to show multiple errors) and file targeted is not a webm file
          $scope.invalidFormat = (!isWebM && $scope.settingsForm.urlField.$valid) ? true : false;
          // prevent or allow saving the form based on if a webm file is targeted
          $scope.settingsForm.$setValidity("validFormat", isWebM);

          if ($scope.settingsForm.urlField.$valid && isWebM ) {
            $scope.settings.additionalParams.storage = commonSettings.getStorageUrlData(url);
          } else {
            $scope.settings.additionalParams.storage = {};
          }
        }
      });

    }])
  .value("defaultSettings", {
    params: {},
    additionalParams: {
      url: "",
      storage: {},
      video: {},
      background: {}
    }
  });
