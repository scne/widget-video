var system = require("system");
var e2ePort = system.env.E2E_PORT || 8099;
var url = "http://localhost:"+e2ePort+"/src/widget-e2e.html";

casper.test.begin("e2e Testing - Video and Background Image using URL", {
  test: function(test) {
    casper.start();

    casper.thenOpen(url, function () {
      test.assertTitle("Video Widget", "Test page has loaded");
    });

    casper.then(function () {
      casper.waitFor(function waitForUI() {
        return this.evaluate(function loadImage() {
          var style = document.getElementById("background").getAttribute("style");
          return (style !== null && style !== "");
        });
      },
      function then() {
        test.comment("Background");
        test.assertExists(".scale-to-fit", "Scale to fit");
        test.assertExists(".middle-center", "Position");
        test.assertEquals(this.getElementAttribute("#background", "style"),
         "background-image: url(http://s3.amazonaws.com/rise-common/images/logo-small.png); ", "Image");
         test.assertEquals(this.getElementAttribute("body", "style"),
         "background-image: initial; background-attachment: initial; background-origin: initial; " +
         "background-clip: initial; background-color: rgba(145, 145, 145, 0); " +
         "background-position: initial initial; background-repeat: initial initial; ",
         "Background color");
      });
    });

    casper.run(function runTest() {
      test.done();
    });

  }

});
