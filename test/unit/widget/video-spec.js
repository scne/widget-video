"use strict";

describe("logEvent", function() {
  var logSpy;

  beforeEach(function () {
    logSpy = sinon.spy(RiseVision.Common.Logger, "log");
  });

  afterEach(function() {
    RiseVision.Common.Logger.log.restore();
  });

  it("should call spy with correct parameters when all optional parameters are set", function() {
    var params = {
      "event": "ready",
      "event_details": "some error occurred",
      "file_url": "http://www.test.com/file.webm",
      "file_format": "webm",
      "company_id": '"companyId"',
      "display_id":'"displayId"'
    };

    RiseVision.Video.logEvent({
      "event": "ready",
      "event_details": "some error occurred",
      "url": "http://www.test.com/file.webm"
    });

    expect(logSpy).to.have.been.calledWith("video_events", params);
  });

  it("should call spy with correct parameters when only the event details parameter is set", function() {
    var params = {
      "event_details": "some error occurred",
      "file_url": null,
      "file_format": null,
      "company_id": '"companyId"',
      "display_id":'"displayId"'
    };

    RiseVision.Video.logEvent({ "event_details": "some error occurred" });

    expect(logSpy).to.have.been.calledWith("video_events", params);
  });

  it("should call spy with correct parameters when only the url parameter is set", function() {
    var params = {
      "file_url": "http://www.test.com/file.webm",
      "file_format": "webm",
      "company_id": '"companyId"',
      "display_id":'"displayId"'
    };

    RiseVision.Video.logEvent({ "url": "http://www.test.com/file.webm" });

    expect(logSpy).to.have.been.calledWith("video_events", params);
  });
});
