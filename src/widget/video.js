/* global gadgets */

var RiseVision = RiseVision || {};
RiseVision.Video = {};

RiseVision.Video = (function (document, gadgets) {
  "use strict";

  var _prefs = null,
    _additionalParams = {},
    _companyId = null,
    _background = null,
    _player = null,
    _viewerPaused = false;

  /*
   *  Private Methods
   */
  function _ready() {
    gadgets.rpc.call("", "rsevent_ready", null, _prefs.getString("id"),
      true, true, true, true, true);
  }

  /*
   *  Public Methods
   */
  function backgroundReady() {
    _player = new RiseVision.Video.Player(_additionalParams, _companyId);
    _player.init();
  }

  function pause() {
    _player.pause();
    _viewerPaused = true;
  }

  function play() {
    if (_player.isInitialPlay()) {
      // "autoplay" was selected in settings
      if (_additionalParams.video.autoplay) {
        _player.play();
      }
    } else {
      if (_viewerPaused) {
        _player.play();
        _viewerPaused = false;
      }
    }
  }

  function playerReady() {
    // Show the video player
    document.getElementById("videoContainer").style.visibility = "visible";

    _ready();
  }

  function setCompanyId(value) {
    _companyId = value;
  }

  function setAdditionalParams(params) {
    _prefs = new gadgets.Prefs();
    _additionalParams = params;

    document.getElementById("videoContainer").style.height = _prefs.getInt("rsH") + "px";

    // create new Background instance
    _background = new RiseVision.Video.Background(_additionalParams, _companyId);
    _background.init();
  }

  function stop() {
    // TODO: need a reset on on the player
  }

  return {
    "backgroundReady": backgroundReady,
    "pause": pause,
    "play": play,
    "setCompanyId": setCompanyId,
    "setAdditionalParams": setAdditionalParams,
    "playerReady": playerReady,
    "stop": stop
  };

})(document, gadgets);
