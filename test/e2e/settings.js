/* jshint expr: true */

(function () {
  "use strict";

  /* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  var expect = chai.expect;

  browser.driver.manage().window().setSize(1024, 768);

  describe("Video Settings - e2e Testing", function() {
    beforeEach(function () {
      browser.get("/src/settings-e2e.html");
    });

    it("Should load all components", function () {
      // Widget Button Toolbar
      expect(element(by.css("button#save")).isPresent()).to.eventually.be.true;
      expect(element(by.css("button#cancel")).isPresent()).to.eventually.be.true;

      // Video Setting
      expect(element(by.css("#videoSetting .slider")).isPresent()).to.eventually.be.true;

      // Background Setting
      expect(element(by.css("#background .section")).isPresent()).to.eventually.be.true;

    });

    it("Should correctly load default settings", function () {
      // save button should be disabled
      expect(element(by.css("button#save[disabled=disabled")).isPresent()).to.eventually.be.true;

      // form should be invalid due to URL Field empty entry
      expect(element(by.css("form[name='settingsForm'].ng-invalid")).isPresent()).to.eventually.be.true;

      // URL Field input value should be empty
      expect(element(by.css("#urlField input[name='url']")).getAttribute("value")).to.eventually.equal("");
    });

    it("Should be invalid form and Save button disabled due to invalid URL", function () {
      element(by.css("#urlField input[name='url']")).sendKeys("http:/www.");

      // save button should be disabled
      expect(element(by.css("button#save[disabled=disabled")).isPresent()).to.eventually.be.true;

      // form should be invalid due to invalid URL
      expect(element(by.css("form[name='settingsForm'].ng-invalid")).isPresent()).to.eventually.be.true;
    });

    it("Should be invalid form and Save button disabled due to invalid file format", function () {
      element(by.css("#urlField input[name='url']")).sendKeys("http://www.valid-url.com/video.mpg");

      // save button should be disabled
      expect(element(by.css("button#save[disabled=disabled")).isPresent()).to.eventually.be.true;

      // form should be invalid due to incorrect file format
      expect(element(by.css("form[name='settingsForm'].ng-invalid")).isPresent()).to.eventually.be.true;
    });

    it("Should be valid form and Save button enabled due to valid URL entry and valid file format", function () {
      element(by.css("#urlField input[name='url']")).sendKeys("http://www.valid-url.com/video.webm");

      // save button should be enabled
      expect(element(by.css("button#save[disabled=disabled")).isPresent()).to.eventually.be.false;

      // form should be valid due to valid URL and valid format
      expect(element(by.css("form[name='settingsForm'].ng-invalid")).isPresent()).to.eventually.be.false;
    });

    it("Should correctly save settings", function (done) {
      var testVideoUrl = "https://s3.amazonaws.com/risecontentfiles/tests/a_RFID.webm";
      var settings = {
        params: {},
        additionalParams: {
          "url": testVideoUrl,
          "storage": {},
          "video": {
            "autoplay":false,
            "volume":50,
            "loop": true,
            "autohide":true
          },
          "background": {
            "color": "transparent"
          }
        }
      };

      element(by.css("#urlField input[name='url']")).sendKeys(testVideoUrl);

      element(by.css("#videoSetting input[name='video-autoplay']")).click();

      element(by.id("save")).click();

      expect(browser.executeScript("return window.result")).to.eventually.deep.equal(
        {
          'additionalParams': JSON.stringify(settings.additionalParams),
          'params': ''
        });
    });

  });

})();
