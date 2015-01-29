var system = require("system");
var e2ePort = system.env.E2E_PORT || 8099;
var url = "http://localhost:"+e2ePort+"/src/widget-e2e.html";

casper.test.begin("e2e Testing - UI", {
  setUp:function (test) {
    casper.options.clientScripts = [];
  },

  tearDown: function(test) {},
  test: function(test) {
    casper.start();

    casper.thenOpen(url, function () {
      test.assertTitle("Video Widget", "Test page has loaded");
    });

    casper.then(function () {
      //TODO: a waitFor to proceed with eventual tests
    });

    casper.run(function runTest() {
      test.done();
    });

  }

});
