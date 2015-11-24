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

describe("getPlaybackData()", function() {

  var params, urls, skin;

  beforeEach(function () {
    params = {width: 1024, height: 768, video: {scaleToFit: true, volume: 50, controls: true, autoplay: true, pause: 10}};

    urls = "https://storage.googleapis.com/risemedialibrary-abc123/Widgets%2Ftest.webm";

    skin = "";
  });

  it("should return an object with correct properties", function () {
    init(params, urls, skin);

    sinon.stub(player, "getDuration", function () {});
    sinon.stub(player, "getPosition", function () {});

    expect(getPlaybackData()).to.include.keys("duration", "position");

    player.getDuration.restore();
    player.getPosition.restore();
  });

});

