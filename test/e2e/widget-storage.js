/* jshint expr: true */

(function () {
  "use strict";

  /* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  var expect = chai.expect;

  browser.driver.manage().window().setSize(1024, 768);

  describe("Video Widget e2e Testing - via storage URL", function() {

    beforeEach(function () {
      // point directly to the widget e2e file
      browser.driver.get("http://localhost:8099/src/widget-storage-e2e.html");

      // need to ignore Angular synchronization, this is a non-angular page
      return browser.ignoreSynchronization = true;
    });

    it("Should apply correct background color", function () {
      // body background color
      expect(element(by.css("body")).getAttribute("style")).
        to.eventually.equal("background: rgba(100, 100, 100, 0);");
    });

    // ******
    // TODO: Turn following tests on if a workaround is in place for testing the usage of rise-storage
    // ******

    xit("Should display background image", function () {
      // background image
      expect(element(by.id("background")).getAttribute("style")).
        to.eventually.equal("background-image: url(https://storage.googleapis.com/risemedialibrary-dd474bee-b237-46e3-aa20-98e975679773/1_chopsticks.jpg);");

      // scale to fit class should be applied
      expect(element(by.css("#background.scale-to-fit")).isPresent()).to.eventually.be.false;

      // correct positioning class
      expect(element(by.css(".bottom-right")).isPresent()).to.eventually.be.true;
    });

    xit("Should load and display video", function () {
      // scale to fit class should be applied
      expect(element(by.css("video.no-scale")).isPresent()).to.eventually.be.true;

      // source element should exist
      expect(element(by.tagName("source")).isPresent()).to.eventually.be.true;

      // source element should apply "src" attribute with correct value
      expect(element(by.css("source")).getAttribute("src")).
        to.eventually.equal("https://storage.googleapis.com/risemedialibrary-dd474bee-b237-46e3-aa20-98e975679773/videos%2Fa_food_show.webm");

      // video container should be visible
      expect(element(by.id("videoContainer")).isPresent()).to.eventually.be.true;
      expect(element(by.id("videoContainer")).isDisplayed()).to.eventually.be.true;

    });

  });

})();
