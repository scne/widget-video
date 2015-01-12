/*jshint expr:true */
"use strict";

describe("Video Settings", function () {

  var defaultSettings, $scope;

  beforeEach(module("risevision.widget.video.settings"));

  beforeEach(function(){
    inject(function($injector, $rootScope, $controller){
      defaultSettings = $injector.get("defaultSettings");
      $scope = $rootScope.$new();
      $controller("videoSettingsController", {$scope: $scope});
    });
  });

  it("should define defaultSettings", function (){
    expect(defaultSettings).to.be.truely;
    expect(defaultSettings).to.be.an("object");
  });

  it("should define videoSettingsController", function (){

  });

});
