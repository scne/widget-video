var RiseVision = RiseVision || {};
RiseVision.Video = RiseVision.Video || {};

RiseVision.Video.NonStorage = function (data) {
  "use strict";

  var riseCache = RiseVision.Common.RiseCache;

  var _refreshDuration = 900000,  // 15 minutes
    _refreshIntervalId = null;

  var _isLoading = true;

  function _getFile() {
    riseCache.getFile(data.url, function (response, error) {
      if (!error) {

        if (_isLoading) {
          _isLoading = false;

          RiseVision.Video.onFileInit(response.url);

          // start the refresh interval
          _startRefreshInterval();

        } else {
          RiseVision.Video.onFileRefresh(response.url);
        }

      } else {
        // error occurred
        RiseVision.Video.logEvent({
          "event": "non-storage error",
          "event_details": error.message,
          "url": response.url
        });
      }
    });
  }

  function _startRefreshInterval() {
    if (_refreshIntervalId === null) {
      _refreshIntervalId = setInterval(function () {
        _getFile();
      }, _refreshDuration);
    }
  }

  /*
   *  Public Methods
   */
  function init() {
    _getFile();
  }

  return {
    "init": init
  };
};
