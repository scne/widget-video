/* global gadgets, config, _ */

var RiseVision = RiseVision || {};
RiseVision.Video = {};

RiseVision.Video = (function (gadgets) {
  "use strict";

  var _additionalParams, _mode;

  var _isLoading = true,
    _configDetails = null;

  var _prefs = null,
    _storage = null,
    _nonStorage = null,
    _message = null,
    _frameController = null;

  var _viewerPaused = true;

  var _resume = true;

  var _currentFrame = 0;

  var _currentFiles = [];

  var _errorLog = null,
    _errorTimer = null,
    _errorFlag = false;

  var _storageErrorFlag = false;

  /*
   *  Private Methods
   */
  function _done() {
    gadgets.rpc.call("", "rsevent_done", null, _prefs.getString("id"));

    // Any errors need to be logged before the done event.
    if (_errorLog !== null) {
      logEvent(_errorLog, true);
    }

    logEvent({ "event": "done" }, false);
  }

  function _ready() {
    gadgets.rpc.call("", "rsevent_ready", null, _prefs.getString("id"),
      true, true, true, true, true);
  }

  function _clearErrorTimer() {
    clearTimeout(_errorTimer);
    _errorTimer = null;
  }

  function _startErrorTimer() {
    _clearErrorTimer();

    _errorTimer = setTimeout(function () {
      // notify Viewer widget is done
      _done();
    }, 5000);
  }

  function _getCurrentFileData() {
    var frameObj = _frameController.getFrameObject(_currentFrame);

    if (frameObj) {
      return frameObj.getPlaybackData();
    }

    return null;
  }

  function _getCurrentFile() {
    var fileData = null;

    if (_currentFiles && _currentFiles.length > 0) {
      if (_mode === "file") {
        return _currentFiles[0];
      }
      else if (_mode === "folder") {
        // retrieve the currently played file info from player
        fileData = _getCurrentFileData();

        if (fileData) {
          return _currentFiles[fileData.index];
        }
      }
    }

    return null;
  }

  /*
   *  Public Methods
   */
  function hasStorageError() {
    return _storageErrorFlag;
  }

  function showError(message, isStorageError) {
    _errorFlag = true;
    _storageErrorFlag = typeof isStorageError !== "undefined";

    _message.show(message);

    _frameController.remove(_currentFrame, function () {
      // if Widget is playing right now, run the timer
      if (!_viewerPaused) {
        _startErrorTimer();
      }
    });
  }

  function logEvent(params, isError) {
    if (isError) {
      _errorLog = params;
    }

    if (!params.file_url) {
      params.file_url = _getCurrentFile();
    }

    RiseVision.Common.LoggerUtils.logEvent(getTableName(), params);
  }

  function onFileInit(urls) {
    if (_mode === "file") {
      // urls value will be a string
      _currentFiles[0] = urls;
    } else if (_mode === "folder") {
      // urls value will be an array
      _currentFiles = urls;
    }

    _message.hide();

    if (!_viewerPaused) {
      play();
    }
  }

  function onFileRefresh(urls) {
    if (_mode === "file") {
      // urls value will be a string of one url
      _currentFiles[0] = urls;
    } else if (_mode === "folder") {
      // urls value will be an array of urls
      _currentFiles = urls;
    }

    // in case refreshed file fixes an error with previous file, ensure flag is removed so playback is attempted again
    _errorFlag = false;
    _storageErrorFlag = false;
    _errorLog = null;
  }

  function pause() {
    var frameObj = _frameController.getFrameObject(_currentFrame);

    _viewerPaused = true;

    // in case error timer still running (no conditional check on errorFlag, it may have been reset in onFileRefresh)
    _clearErrorTimer();

    if (frameObj) {
      // Destroy player iframe.
      if (!_resume) {
        _frameController.remove(_currentFrame);
      }
      else {
        frameObj.pause();
      }
    }
  }

  function play() {
    var logParams = {},
      frameObj = _frameController.getFrameObject(_currentFrame);

    if (_isLoading) {
      _isLoading = false;

      // Log configuration event.
      logParams.event = "configuration";
      logParams.event_details = _configDetails;
      logEvent(logParams, false);
    }

    _viewerPaused = false;

    logEvent({ "event": "play" }, false);

    if (_errorFlag) {
      _startErrorTimer();
      return;
    }

    if (frameObj) {
      frameObj.play();
    } else {

      if (_currentFiles && _currentFiles.length > 0) {
        if (_mode === "file") {
          // add frame and create the player
          _frameController.add(0);
          _frameController.createFramePlayer(0, _additionalParams, _currentFiles[0], config.SKIN, "player-file.html");
        }
        else if (_mode === "folder") {
          _frameController.add(0);
          _frameController.createFramePlayer(0, _additionalParams, _currentFiles, config.SKIN, "player-folder.html");
        }
      }

    }
  }

  function getTableName() {
    return "video_events";
  }

  function playerEnded() {
    _frameController.remove(_currentFrame, function () {
      _done();
    });
  }

  function playerReady() {
    var frameObj;

    // Ensures messaging is hidden for non-storage video file
    _message.hide();

    if (!_viewerPaused) {
      frameObj = _frameController.getFrameObject(_currentFrame);

      if (frameObj) {
        frameObj.play();
      }
    }
  }

  function setAdditionalParams(params, mode) {
    var isStorageFile;

    _additionalParams = _.clone(params);
    _mode = mode;
    _prefs = new gadgets.Prefs();

    document.getElementById("videoContainer").style.height = _prefs.getInt("rsH") + "px";

    _additionalParams.width = _prefs.getInt("rsW");
    _additionalParams.height = _prefs.getInt("rsH");

    if (_additionalParams.video.hasOwnProperty("resume")) {
      _resume = _additionalParams.video.resume;
    }

    _message = new RiseVision.Common.Message(document.getElementById("videoContainer"),
      document.getElementById("messageContainer"));

    // show wait message while Storage initializes
    _message.show("Please wait while your video is downloaded.");

    _frameController = new RiseVision.Common.Video.FrameController();

    if (_mode === "file") {
      isStorageFile = (Object.keys(_additionalParams.storage).length !== 0);

      if (!isStorageFile) {
        _configDetails = "custom";

        _nonStorage = new RiseVision.Video.NonStorage(_additionalParams);
        _nonStorage.init();
      } else {
        _configDetails = "storage file";

        // create and initialize the Storage file instance
        _storage = new RiseVision.Video.StorageFile(_additionalParams);
        _storage.init();
      }
    }
    else if (_mode === "folder") {
      _configDetails = "storage folder";

      // create and initialize the Storage folder instance
      _storage = new RiseVision.Video.StorageFolder(_additionalParams);
      _storage.init();
    }

    _ready();
  }

  // An error occurred with JW Player.
  function playerError(error) {
    var details = null,
      params = {},
      message = "Sorry, there was a problem playing the video.",
      MEDIA_ERROR = "Error loading media: File could not be played",
      YOUTUBE_ERROR = "Error loading YouTube: Video could not be played",
      PLAYER_ERROR = "Error loading player: No playable sources found",
      ENCODING_MESSAGE = "There was a problem playing that video. It could be that we don't " +
        "support that format or it is not encoded correctly.",
      FORMAT_MESSAGE = "The format of that video is not supported";

    if (error) {
      if (error.type && error.message) {
        details = error.type + " - " + error.message;
      }
      else if (error.type) {
        details = error.type;
      }
      else if (error.message) {
        details = error.message;
      }

      // Display appropriate on-screen error message.
      if (error.message) {
        if ((error.message === MEDIA_ERROR) || (error.message === YOUTUBE_ERROR)) {
          message = ENCODING_MESSAGE;
        }
        else if (error.message === PLAYER_ERROR) {
          message = FORMAT_MESSAGE;
        }
      }
    }

    params.event = "player error";
    params.event_details = details;

    logEvent(params, true);
    showError(message);
  }

  function stop() {
    pause();
  }

  return {
    "getTableName": getTableName,
    "hasStorageError": hasStorageError,
    "logEvent": logEvent,
    "onFileInit": onFileInit,
    "onFileRefresh": onFileRefresh,
    "pause": pause,
    "play": play,
    "setAdditionalParams": setAdditionalParams,
    "showError": showError,
    "playerEnded": playerEnded,
    "playerReady": playerReady,
    "playerError": playerError,
    "stop": stop
  };

})(gadgets);
