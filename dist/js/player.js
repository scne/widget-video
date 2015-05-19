var file;
var controls, volume, autoPlay, stretching;
var width, height, skin;

var player = null;

function init(params, url, skinVal) {
  window.oncontextmenu = function() {
    return false;
  };

  width = params.width;
  height = params.height;
  skin = skinVal;
  controls = params.video.controls;
  volume = params.video.volume;
  stretching = (params.video.scaleToFit) ? "uniform" : "none";
  file = url;

  // ensure autoPlay is true if controls value is false, otherwise use params value
  autoPlay = (!controls) ? true : params.video.autoplay;

  player = new PlayerJW();
}

function load() {
  player.loadVideo();
}

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

function play() {
  player.play();
}

function pause() {
  player.pause();
}

function stop() {
  player.stop();
}

function remove() {
  player.remove();
}

function getPlaybackData() {
  return {
    duration: player.getDuration(),
    position: player.getPosition()
  }
}

function PlayerJW() {
  var isLoading = true;

  function onVideoComplete() {
    doneEvent();
  }

  function onPlay() {
    if (isLoading) {
      isLoading = false;

      jwplayer().pause();
      jwplayer().setMute(false);
      jwplayer().setVolume(volume);

      if (controls && !autoPlay) {
        jwplayer().setControls(true);
      }

      readyEvent();
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

  this.getVideoFileType = function (url) {
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
  };

  this.loadVideo = function() {
    jwplayer("player").setup({
      file: file,
      type: this.getVideoFileType(file),
      width : width,
      height : height,
      controls: false,
      stretching : stretching,
      skin: skin
    });

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

      jwplayer().onComplete(function () {
        onVideoComplete();
      });

      jwplayer().onPlay(function () {
        onPlay();
      });

      jwplayer().onError(function (error) {
        onPlayerError(error);
      });

      setTimeout(function () {
        // need to test if there is an error playing first video
        jwplayer().play();
      }, 200);

    });
  };

  this.play = function() {
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
  };

  this.pause = function() {
    jwplayer().pause();
  };

  this.stop = function() {
    this.pause();
  };

  this.remove = function() {
    jwplayer().remove();
  };

  this.getDuration = function () {
    return jwplayer().getDuration();
  };

  this.getPosition = function () {
    return jwplayer().getPosition();
  }

}
