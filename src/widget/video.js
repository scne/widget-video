/* global gadgets */

var RiseVision = RiseVision || {};
RiseVision.Video = {};

RiseVision.Video = (function (document, gadgets) {
  "use strict";

  var _prefs = null,
    _additionalParams = {},
    _companyId = null,
    _background = null,
    _player = null;

  /*
   *  Private Methods
   */
  function _done() {
    gadgets.rpc.call("", "rsevent_done", null, _prefs.getString("id"));

  }

  function _ready() {
    gadgets.rpc.call("", "rsevent_ready", null, _prefs.getString("id"),
      true, true, true, true, true);
  }

  /*
   *  Public Methods
   */
  function backgroundReady() {
    // create and initialize the Player instance
    _player = new RiseVision.Video.Player(_additionalParams, _companyId);
    _player.init();
  }

  function pause() {
    _player.pause();
  }

  function play() {
    if (_player.isInitialPlay()) {
      // "autoplay" was selected in settings
      if (_additionalParams.video.autoplay) {
        _player.play();
      }
    } else {
      if (!_player.userPaused()) {
        _player.play();
      }
    }
  }

  function playerReady() {
    _ready();
  }

  function setCompanyId(value) {
    _companyId = value;
  }

  function setAdditionalParams(params) {
    _prefs = new gadgets.Prefs();
    _additionalParams = params;

    document.getElementById("videoContainer").style.height = _prefs.getInt("rsH") + "px";

    // create and initialize the Background instance
    _background = new RiseVision.Video.Background(_additionalParams, _companyId);
    _background.init();
  }

  function stop() {
    // TODO: need a reset on on the player
  }

  function videoEnded() {
    _done();
  }

  return {
    "backgroundReady": backgroundReady,
    "pause": pause,
    "play": play,
    "setCompanyId": setCompanyId,
    "setAdditionalParams": setAdditionalParams,
    "playerReady": playerReady,
    "stop": stop,
    "videoEnded": videoEnded
  };

})(document, gadgets);
