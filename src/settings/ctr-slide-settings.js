angular.module("risevision.widget.web-page.settings")
  .controller("webPageSettingsController", ["$scope", "$window",
    function ($scope, $window) {

      $scope.showPreview = false;

      $scope.$on("picked", function (event, data) {
        $scope.settings.additionalParams.slide.selection = "drive";
        $scope.settings.additionalParams.slide.docName = data[0].name;
        $scope.settings.additionalParams.slide.fileId = data[0].id;
        $scope.settings.additionalParams.slide.url = encodeURI(data[0].url);
        $scope.showPreview = true;
      });

      $scope.$watch("settings.additionalParams.interactivity.interactive", function (value) {
        if (typeof value !== "undefined") {
          if (!value) {
            $scope.settings.additionalParams.interactivity.scrollbars = false;
          }
        }
      });

      $scope.previewFile = function () {
        $window.open($scope.settings.additionalParams.slide.url, "_blank");
      };


    }])
  .value("defaultSettings", {
    params: {},
    additionalParams: {
      interactivity: {
        interactive: false
      },
      refresh: 0,
      unload: true,
      slide: {
        selection: "drive",
        docName: "",
        url: "",
        fileId: "",
        autoPlay: false,
        loop: false,
        autoAdvanceInterval: 3
      }
    }
  });
