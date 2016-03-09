var RiseVision = RiseVision || {};
RiseVision.Video = RiseVision.Video || {};

RiseVision.Video.WindowController = function () {
  "use strict";

  var _bucketPath = "",
    _frameOrigin = "";

  /*
   *  Private Methods
   */
  function _setBucketPath() {
    var pathArray = window.location.pathname.split( "/"),
      host = window.location.host,
      protocol = window.location.protocol;

    _bucketPath = protocol + "//" + host + "/";

    for (var i = 0; i < pathArray.length; i += 1) {
      if (pathArray[i] !== "") {
        _bucketPath += pathArray[i] + "/";

        if (pathArray[i] === "dist") {
          break;
        }
      }
    }
  }

  function _setFrameOrigin() {
    // widget-preview app (local)
    if (window.location.host === "localhost:8000") {
      _frameOrigin = "http://localhost:8000";
    }
    else if (window.location.host === "s3.amazonaws.com") {
      RiseVision.Common.RiseCache.isRiseCacheRunning(function (isRunning) {

        if (isRunning) {
          // running in player, origin should be Rise Cache
          _frameOrigin = "http://localhost:9494";

          // set the bucket path as Video module will need it when Rise Cache is running
          _setBucketPath();
        }
        else {
          // running in preview (browser)
          _frameOrigin = "http://s3.amazonaws.com";
        }
      });
    }
  }

  function _setMessageReceiver() {

    window.addEventListener("message", function (event) {
      var origin = event.origin || event.originalEvent.origin;

      // ensure this message is coming from either Rise Cache, Amazon S3 (preview), or preview app (local)
      if (origin !== "http://localhost:9494" && origin !== "http://s3.amazonaws.com" && origin !== "http://localhost:8000") {
        origin = null;
        return;
      }

      if (event.data && typeof event.data === "object" && event.data.event) {
        switch (event.data.event) {
          case "playerEnded":
            RiseVision.Video.playerEnded();
            break;
          case "playerError":
            RiseVision.Video.playerError(event.data.error);
            break;
          case "playerItemChange":
            RiseVision.Video.playerItemChange(event.data.index);
            break;
          case "playerReady":
            RiseVision.Video.playerReady();
            break;
        }
      }
    });

  }

  /*
   *  Public Methods
   */
  function getBucketPath() {
    return _bucketPath;
  }

  function getFrameOrigin() {
    return _frameOrigin;
  }

  function init() {
    _setFrameOrigin();
    _setMessageReceiver();
  }

  return {
    getBucketPath: getBucketPath,
    getFrameOrigin: getFrameOrigin,
    init: init
  };

};
