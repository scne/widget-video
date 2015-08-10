/* global gadgets, config */

var RiseVision = RiseVision || {};
RiseVision.Video = {};

RiseVision.Video = (function (gadgets) {
  "use strict";

  var _additionalParams;

  var _prefs = null,
    _storage = null,
    _frameController = null;

  var _initialized = false,
    _playbackError = false,
    _isStorageFile = false;

  var _currentFile, _currentFrame;

  var _separator = "",
    _refreshDuration = 900000,  // 15 minutes
    _refreshIntervalId = null;

  /*
   *  Private Methods
   */
  function _done() {
    gadgets.rpc.call("", "rsevent_done", null, _prefs.getString("id"));

  }

  function _ready() {
    console.log("video.js::_ready()", _additionalParams.storage.fileName);

    gadgets.rpc.call("", "rsevent_ready", null, _prefs.getString("id"),
      true, true, true, true, true);
  }

  function _init() {
    _frameController = new RiseVision.Common.Video.FrameController();

    // add the first frame and create its player
    _frameController.add(0);
    _frameController.hide(0);
    _currentFrame = 0;
    _frameController.createFramePlayer(0, _additionalParams, _currentFile, config.SKIN, "player.html");
  }

  function _refreshInterval(duration) {
    _refreshIntervalId = setInterval(function videoRefresh() {
      // set new value of non rise-storage url with a cachebuster
      _currentFile = _additionalParams.url + _separator + "cb=" + new Date().getTime();

      // in case refreshed file fixes an error with previous file, ensure flag is removed so playback is attempted again
      _playbackError = false;

    }, duration);
  }

  /*
   *  Public Methods
   */
  function onStorageInit(url) {
    _currentFile = url;

    _init();
  }

  function onStorageRefresh(url) {
    _currentFile = url;

    // in case refreshed file fixes an error with previous file, ensure flag is removed so playback is attempted again
    _playbackError = false;
  }

  function pause() {
    var frameObj = _frameController.getFrameObject(_currentFrame);

    if (frameObj) {
      frameObj.pause();
    }
  }

  function play() {
    var frameObj = _frameController.getFrameObject(_currentFrame);

    if (!_playbackError) {
      if (frameObj) {
        frameObj.play();
      } else {

        // add frame and create the player, but hide visibility of frame container until "ready" is received
        _frameController.add(0);
        _frameController.hide(0);
        _frameController.createFramePlayer(0, _additionalParams, _currentFile, config.SKIN, "player.html");

      }
    } else {
      // This flag only got set upon a refresh of hidden frame and there was an error in setup or video
      // Send Viewer "done"
      _done();
    }
  }

  function playerEnded() {
    _frameController.remove(_currentFrame, function () {
      _done();
    });
  }

  function playerReady() {
    var frameObj;

    // make the frame container visible now that ready has been received
    _frameController.show(_currentFrame);

    if (!_initialized) {
      _initialized = true;

      if (!_isStorageFile && _refreshIntervalId === null) {
        _refreshInterval(_refreshDuration);
      }

      _ready();

    } else {
      frameObj = _frameController.getFrameObject(_currentFrame);
      frameObj.play();
    }
  }

  function setAdditionalParams(names, values) {
    var str;

    if (Array.isArray(names) && names.length > 0 && names[0] === "additionalParams") {
      if (Array.isArray(values) && values.length > 0) {
        _additionalParams = JSON.parse(values[0]);
        _prefs = new gadgets.Prefs();

        document.getElementById("videoContainer").style.height = _prefs.getInt("rsH") + "px";

        _additionalParams.width = _prefs.getInt("rsW");
        _additionalParams.height = _prefs.getInt("rsH");

        _isStorageFile = (Object.keys(_additionalParams.storage).length !== 0);

        if (!_isStorageFile) {
          str = _additionalParams.url.split("?");

          // store this for the refresh timer
          _separator = (str.length === 1) ? "?" : "&";

          _currentFile = _additionalParams.url;

          _init();

        } else {
          // create and initialize the Storage module instance
          _storage = new RiseVision.Video.Storage(_additionalParams);
          _storage.init();
        }

      }
    }
  }

  function playerError(error) {
    console.debug("video-folder::playerError()", error);

    if (!_initialized) {
      // Widget has not sent "ready" yet so there has been a setup error
      _frameController.remove(_currentFrame);

      // do nothing more, ensure "ready" is not sent to Viewer so that this widget can be skipped

    } else {
      // flag the video has an error
      _playbackError = true;

      // act as though video has ended
      playerEnded();
    }

  }

  function stop() {
    pause();
  }

  return {
    "onStorageInit": onStorageInit,
    "onStorageRefresh": onStorageRefresh,
    "pause": pause,
    "play": play,
    "setAdditionalParams": setAdditionalParams,
    "playerEnded": playerEnded,
    "playerReady": playerReady,
    "playerError": playerError,
    "stop": stop
  };

})(gadgets);
