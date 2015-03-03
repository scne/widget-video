/* jshint expr: true */

(function () {
  "use strict";

  /* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

  var chai = require("chai");
  var chaiAsPromised = require("chai-as-promised");

  chai.use(chaiAsPromised);
  var expect = chai.expect;

  browser.driver.manage().window().setSize(1024, 768);

  describe("Video Widget e2e Testing - testing undefined values for new settings", function() {

    beforeEach(function () {
      // point directly to the widget e2e file
      browser.driver.get("http://localhost:8099/src/widget-undefined-e2e.html");

      // need to ignore Angular synchronization, this is a non-angular page
      return browser.ignoreSynchronization = true;
    });


    it("Should apply .no-scale class due to missing scaleToFit setting", function () {
      // no scale class should be applied
      expect(element(by.css("video.no-scale")).isPresent()).to.eventually.be.true;

    });

  });

})();
