"use strict";

describe("configure()", function() {

  var urls;

  beforeEach(function () {
    urls = "https://storage.googleapis.com/risemedialibrary-abc123/Widgets%2Ftest.webm";
  });

  afterEach(function () {
    player = null;
  });

  it("should correctly apply file value", function () {
    configure(urls);
    expect(file).to.equal(urls);
  });

  it("should create player object", function () {
    configure(urls);

    expect(player).to.exist;
    expect(player).to.be.an("object");
  });

});

