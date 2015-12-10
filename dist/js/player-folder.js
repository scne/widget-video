var controls, volume, autoPlay, stretching, pauseDuration;
var width, height, skin;

var player = null;

// OVERRIDE: method to distinguish configurations between file and folder
function configure(urls){}

function doneEvent() {
  if (window.parent !== window.top) {
    parent.RiseVision.Video.playerEnded();
  }
}

function readyEvent() {
  if (window.parent !== window.top) {
    parent.RiseVision.Video.playerReady();
  }
}

function errorEvent(data) {
  if (window.parent !== window.top) {
    parent.RiseVision.Video.playerError(data);
  }
}

function init(params, urls, skinVal) {
  window.oncontextmenu = function() {
    return false;
  };

  width = params.width;
  height = params.height;
  skin = skinVal;
  controls = params.video.controls;
  volume = params.video.volume;
  stretching = (params.video.scaleToFit) ? "uniform" : "none";

  // ensure autoPlay is true if controls value is false, otherwise use params value
  autoPlay = (!controls) ? true : params.video.autoplay;

  // check if this setting exists due to merge of file and folder
  if (params.video.pause) {
    // convert pause value to number if type is "string"
    params.video.pause = (typeof params.video.pause === "string") ? parseInt(params.video.pause, 10) : params.video.pause;

    // if not of type "number", set its value to 0 so a pause does not get applied
    pauseDuration = (isNaN(params.video.pause)) ? 0 : params.video.pause;
  } else {
    // ensure no pause duration occurs
    pauseDuration = 0;
  }

  configure(urls);
}

function load() {
  player.loadVideo();
}

function play() {
  player.play();
}

function pause() {
  // Only pause video if it's actually playing.
  if (player.getState().toUpperCase() === "PLAYING") {
    player.pause();
  }
}

function stop() {
  player.stop();
}

function remove() {
  player.remove();
}

function getVideoFileType (url) {
  var extensions = [".mp4", ".webm", ".ogg", ".ogv"],
    urlLowercase = url.toLowerCase(),
    type = null,
    i;

  for (i = 0; i <= extensions.length; i += 1) {
    if (urlLowercase.indexOf(extensions[i]) !== -1) {
      type = extensions[i].substr(extensions[i].lastIndexOf(".") + 1);
      break;
    }
  }

  if (type === "ogv") {
    type = "ogg";
  }

  return type;
}

// OVERRIDE: method to retrieve data about file or currently played file from folder
function getPlaybackData() {}

// inherit from playerJW for a customized file or folder player
var playerJW = function (setupObj) {
  "use strict";

  var viewerPaused = false;
  var pauseTimer = null;

  function _onComplete() {
    doneEvent();
  }

  function _onPause() {
    if (!viewerPaused) {
      // user has paused, set a timer to play again
      clearTimeout(pauseTimer);

      pauseTimer = setTimeout(function () {
        // continue playing the current video
        jwplayer().play();

        // workaround for controls remaining visible, turn them off and on again
        jwplayer().setControls(false);
        jwplayer().setControls(true);

      }, pauseDuration * 1000);
    }
  }

  function onPlayerError(error) {
    if (error) {
      errorEvent({
        type: "video",
        message: error.message
      });
    }
  }

  function onSetupError(error) {
    if (error) {
      errorEvent({
        type: "setup",
        message: error.message
      });
    }
  }

  function loadVideo() {
    jwplayer("player").setup(setupObj);

    jwplayer().onSetupError(function (error) {
      onSetupError(error);
    });

    jwplayer().onReady(function () {
      var elements = document.getElementById("player").getElementsByTagName("*"),
        total = elements.length,
        i;

      // Workaround for Chrome App Player <webview> not handling CSS3 transition
      for (i = 0; i < total; i += 1) {
        elements[i].className += " notransition";
      }

      document.getElementById("player").className += " notransition";

      // Bugfix - issue #36 (JWPlayer context menu)
      document.getElementById("player_menu").className += " disable-context-menu";

      if (setupObj.hasOwnProperty("playlist")) {
        // folder, listen for playlist complete event
        jwplayer().onPlaylistComplete(function () {
          _onComplete();
        });
      }
      else if (setupObj.hasOwnProperty("file")) {
        // file, listen for single file complete event
        jwplayer().onComplete(function () {
          _onComplete();
        });
      }

      jwplayer().onError(function (error) {
        onPlayerError(error);
      });

      if (controls && pauseDuration > 1) {
        jwplayer().onPause(function () {
          _onPause();
        });
      }

      jwplayer().setVolume(volume);

      if (controls && !autoPlay) {
        jwplayer().setControls(true);
      }

      readyEvent();

    });
  }

  function play() {
    viewerPaused = false;

    if (autoPlay) {
      if (controls && !jwplayer().getControls()) {
        // Will be first time player is being told to play so doing this here and not in setup so that controls
        // aren't visible upon playing for the first time.
        jwplayer().setControls(true);
      }

      jwplayer().play();

      if (controls) {
        // workaround for controls remaining visible, turn them off and on again
        jwplayer().setControls(false);
        jwplayer().setControls(true);
      }
    }
  }

  function pause() {
    viewerPaused = true;
    clearTimeout(pauseTimer);
    jwplayer().pause();
  }

  function stop() {
    this.pause();
  }

  function remove() {
    viewerPaused = false;
    clearTimeout(pauseTimer);
    pauseTimer = null;
    jwplayer().remove();
  }

  function getDuration() {
    return jwplayer().getDuration();
  }

  function getPosition() {
    return jwplayer().getPosition();
  }

  function getState() {
    return jwplayer().getState();
  }

  return {
    getDuration: getDuration,
    getPosition: getPosition,
    getState: getState,
    loadVideo: loadVideo,
    play: play,
    pause: pause,
    onPlayerError: onPlayerError,
    onSetupError: onSetupError,
    stop: stop,
    remove: remove
  }
};

var files;

function configure(urls) {
  files = urls;

  var folderPlayer = function () {
    var instance = playerJW({
      playlist: getPlaylist(files),
      width : width,
      height : height,
      controls: false,
      stretching : stretching,
      skin: skin
    });

    instance.onPlayerError = function (error) {
      if (error) {
        errorEvent({
          type: "video",
          index: jwplayer().getPlaylistIndex(),
          message: error.message
        });
      }
    };

    instance.onSetupError = function (error) {
      if (error) {
        errorEvent({
          type: "setup",
          index: 0,
          message: error.message
        });
      }
    };

    instance.getCurrentIndex = function() {
      return jwplayer().getPlaylistIndex();
    };

    return instance;
  };

  player = folderPlayer();
}

function getPlaylist (list) {
  var playlist = [];

  for (var i = 0; i < list.length; i += 1) {
    playlist.push({
      sources: [{
        file: list[i],
        type: getVideoFileType(list[i])
      }]
    });
  }

  return playlist;
}

function getPlaybackData() {
  return {
    total: files.length,
    index: player.getCurrentIndex(),
    duration: player.getDuration(),
    position: player.getPosition()
  }
}
