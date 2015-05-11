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
    _playbackError = false;

  var _currentFile, _currentFrame;

  var _frameCount = 0;

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

  function _refreshFrame(frameIndex) {
    _frameController.remove(frameIndex, function () {
      _frameController.add(frameIndex);
      _frameController.hide(frameIndex);
      _frameController.createFramePlayer(frameIndex, _additionalParams, _currentFile, config.SKIN, "player.html");
    });
  }

  /*
   *  Public Methods
   */
  function onStorageInit(url) {
    _currentFile = url;

    _frameController = new RiseVision.Common.Video.FrameController();

    // add the first frame and create its player
    _frameController.add(0);
    _currentFrame = 0;
    _frameCount = 1;
    _frameController.createFramePlayer(0, _additionalParams, _currentFile, config.SKIN, "player.html");
  }

  function onStorageRefresh(url) {
    var currentFrameObj = _frameController.getFrameObject(_currentFrame),
      hiddenFrameIndex = (_currentFrame === 0) ? 1 : 0,
      currentFrameData;

    _currentFile = url;

    // It is best to let refreshing the frame playlist happen in the normal cycle of frame swapping (playlist completion)
    // Below is the only criteria for safely forcing a refresh of hidden frame while Widget is in a "play" or "pause" state

    // Widget is in a state of "play" or "pause" and playlist has not completed. A hidden frame definitely exists
    if (currentFrameObj) {
      // Only if there are no video controls.
      // User interacting with controls, particularly seeking the video to end, would cause issues
      if (!_additionalParams.video.controls) {
        currentFrameData = currentFrameObj.getPlaybackData();

        // To be safe, only refresh the frame that's currently hidden if at least 15 seconds are left of video
        if ((currentFrameData.duration - currentFrameData.position) >= 15) {
          _refreshFrame(hiddenFrameIndex);
        }
      }
    }
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
        // set current frame to be the one visible
        _currentFrame = (_currentFrame === 0) ? 1 : 0;

        // play the current frame video
        frameObj = _frameController.getFrameObject(_currentFrame);
        frameObj.play();

        // re-add previously removed frame and create the player, but hide visibility
        _frameController.add(((_currentFrame === 0) ? 1 : 0));
        _frameController.hide(((_currentFrame === 0) ? 1 : 0));
        _frameController.createFramePlayer(((_currentFrame === 0) ? 1 : 0), _additionalParams, _currentFile, config.SKIN, "player.html");
      }
    } else {
      // This flag only got set upon a refresh of hidden frame and there was an error in setup or video
      // Send Viewer "done"
      _done();
    }
  }

  function playerEnded() {
    if (_playbackError) {
      // This flag only gets set upon a refresh of hidden frame and there was an error in setup or video
      _frameController.remove(_currentFrame);
      _frameController.remove((_currentFrame === 0) ? 1 : 0);

      _done();

    } else {
      _frameController.show((_currentFrame === 0) ? 1 : 0);
      _frameController.remove(_currentFrame, function () {
        _done();
      });
    }

  }

  function playerReady() {
    if (!_initialized) {
      if (_frameCount === 2) {
        // both frames have been created and loaded, can notify Viewer widget is ready
        _initialized = true;
        _ready();
      } else {
        // first frame player was successful and ready, create the second one but hide it
        _frameController.add(1);
        _frameController.hide(1);
        _frameCount = 2;
        _frameController.createFramePlayer(1, _additionalParams, _currentFile, config.SKIN, "player.html");
      }
    }
  }

  function setAdditionalParams(names, values) {
    if (Array.isArray(names) && names.length > 0 && names[0] === "additionalParams") {
      if (Array.isArray(values) && values.length > 0) {
        _additionalParams = JSON.parse(values[0]);
        _prefs = new gadgets.Prefs();

        document.getElementById("videoContainer").style.height = _prefs.getInt("rsH") + "px";

        _additionalParams.width = _prefs.getInt("rsW");
        _additionalParams.height = _prefs.getInt("rsH");

        // create and initialize the Storage module instance
        _storage = new RiseVision.Video.Storage(_additionalParams);
        _storage.init();
      }
    }
  }

  function playerError(error) {
    console.debug("video-folder::playerError()", error);

    if (!_initialized) {
      // Widget has not sent "ready" yet and there is an error (setup or playback of video)
      _frameController.remove(_currentFrame);

      // do nothing more, ensure "ready" is not sent to Viewer so that this widget can be skipped

    } else {
      // This only happens in the event of a refresh. New file caused an error in setup or video has an issue
      // The error event will be coming from the currently hidden frame when it got recreated with a new file to use
      _playbackError = true;
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
