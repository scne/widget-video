/* global config: true */
/* exported config */
if (typeof config === "undefined") {
  var config = {
    // variables go here
  };

  if (typeof angular !== "undefined") {
    angular.module("risevision.common.i18n.config", [])
      .constant("LOCALES_PREFIX", "components/rv-common-i18n/dist/locales/translation_")
      .constant("LOCALES_SUFIX", ".json");

    angular.module("risevision.widget.common.storage-selector.config")
      .value("STORAGE_MODAL", "https://storage-stage.risevision.com/rva-test/dist/storage-modal.html#/files/");
  }
}

/* global gadgets */

var RiseVision = RiseVision || {};
RiseVision.Video = {};

RiseVision.Video = (function (document, gadgets) {
  "use strict";

  var _prefs = null,
    _additionalParams = {},
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

  function _backgroundReady() {
    // create and initialize the Player instance
    _player = new RiseVision.Video.Player(_additionalParams);
    _player.init();
  }

  /*
   *  Public Methods
   */
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

  function setAdditionalParams(params) {
    _prefs = new gadgets.Prefs();
    _additionalParams = params;

    document.getElementById("videoContainer").style.height = _prefs.getInt("rsH") + "px";

    // create and initialize the Background instance
    _background = new RiseVision.Common.Background(_additionalParams);
    _background.init(_backgroundReady);
  }

  function stop() {
    // https://github.com/Rise-Vision/viewer/issues/30
    // Have to call pause() due to Viewer issue
    pause();
  }

  function videoEnded() {
    _done();
  }

  return {
    "pause": pause,
    "play": play,
    "setAdditionalParams": setAdditionalParams,
    "playerReady": playerReady,
    "stop": stop,
    "videoEnded": videoEnded
  };

})(document, gadgets);

var RiseVision = RiseVision || {};
RiseVision.Common = RiseVision.Common || {};

RiseVision.Common.Background = function (data) {
  "use strict";

  var _callback = null,
    _ready = false,
    _background = null,
    _storage = null,
    _refreshDuration = 900000, // 15 minutes
    _isStorageFile = false,
    _separator = "";

  /*
   * Private Methods
   */
  function _refreshTimer() {
    setTimeout(function backgroundRefresh() {
      _background.style.backgroundImage = "url(" + data.background.image.url + _separator + "cb=" + new Date().getTime() + ")";
      _refreshTimer();
    }, _refreshDuration);
  }

  function _backgroundReady() {
    _ready = true;

    if (data.background.useImage && !_isStorageFile) {
      // start the refresh poll for non-storage background image
      _refreshTimer();
    }

    if (_callback && typeof _callback === "function") {
      _callback();
    }
  }

  function _storageResponse(e) {
    _storage.removeEventListener("rise-storage-response", _storageResponse);

    if (Array.isArray(e.detail)) {
      _background.style.backgroundImage = "url(" + e.detail[0] + ")";
    } else {
      _background.style.backgroundImage = "url(" + e.detail + ")";
    }
    _backgroundReady();
  }

  function _configure() {
    var str;

    _background = document.getElementById("background");
    _storage = document.getElementById("backgroundStorage");

    // set the document background
    document.body.style.background = data.background.color;

    if (_background) {
      if (data.background.useImage) {
        _background.className = data.background.image.position;
        _background.className = data.background.image.scale ? _background.className + " scale-to-fit"
          : _background.className;

        _isStorageFile = (Object.keys(data.backgroundStorage).length !== 0);

        if (!_isStorageFile) {
          str = data.background.image.url.split("?");

          // store this for the refresh timer
          _separator = (str.length === 1) ? "?" : "&";

          _background.style.backgroundImage = "url(" + data.background.image.url + ")";
          _backgroundReady();
        } else {
          if (_storage) {
            // Rise Storage
            _storage.addEventListener("rise-storage-response", _storageResponse);

            _storage.setAttribute("folder", data.backgroundStorage.folder);
            _storage.setAttribute("fileName", data.backgroundStorage.fileName);
            _storage.setAttribute("companyId", data.backgroundStorage.companyId);
            _storage.go();
          } else {
            console.log("Missing element with id value of 'backgroundStorage'");
          }
        }
      } else {
        _backgroundReady();
      }
    } else {
      console.log("Missing element with id value of 'background'");
    }
  }

  /*
   *  Public Methods
   */
  function init(cb) {
    if (!_ready) {
      if (cb) {
        _callback = cb;
      }

      _configure();

    } else if (cb && typeof cb === "function") {
      cb();
    }
  }

  return {
    "init": init
  };
};

var RiseVision = RiseVision || {};
RiseVision.Video = RiseVision.Video || {};

RiseVision.Video.Player = function (data) {
  "use strict";

  var _video = document.getElementById("video"),
    _videoContainer = document.getElementById("videoContainer"),
    _storage = document.getElementById("videoStorage"),
    _initialPlay = true,
    _userPaused = false,
    _viewerPaused = false,
    _refreshDuration = 900000, // 15 minutes
    _isStorageFile = false,
    _refreshWaiting = false,
    _notifiedReady = false,
    _canPlay = false,
    _separator = "",
    _srcAttr, _fragment, _source;

  /*
   * Private Methods
   */
  function _storageResponse(e) {
    _storage.removeEventListener("rise-storage-response", _storageResponse);

    if (Array.isArray(e.detail)) {
      _srcAttr.value = e.detail[0];
    } else {
      _srcAttr.value = e.detail;
    }

    _source.setAttributeNode(_srcAttr);
    _video.appendChild(_fragment);
  }

  function _getVideoFileType() {
    var type = data.url.substr(data.url.lastIndexOf(".") + 1);

    if (type === "ogv") {
      type = "ogg";
    }

    return type;
  }

  function _onLoadedData() {
    // at least 1st frame of video has loaded
    _videoContainer.style.visibility = "visible";
    // remove this listener
    _video.removeEventListener("loadeddata", _onLoadedData, false);
  }

  function _onCanPlay() {
    // enough data has loaded to safely play without interruption
    _canPlay = true;

    // only call playerReady() once
    if (!_notifiedReady) {
      RiseVision.Video.playerReady();
      _notifiedReady = true;
    }

    // remove this listener
    _video.removeEventListener("canplay", _onCanPlay, false);

    if (!_isStorageFile) {
      // call the refresh timer function for a non-storage video
      _refreshTimer(_refreshDuration);
    }
  }

  function _onEnded() {
    // a "pause" event is always fired before "ended" event, ensure _userPaused is false
    _userPaused = false;

    if (!_isStorageFile && _refreshWaiting) {
      _refreshWaiting = false;
      _refresh();
    }

    // video ended
    RiseVision.Video.videoEnded();
  }

  function _onPause() {
    // this handler also gets called via public "pause()" function, only set "_userPaused = true" if not the case
    _userPaused = !_viewerPaused;
  }

  function _onPlay() {
    _initialPlay = false;
    _userPaused = false;
  }

  function _canPlayTimer() {
    setTimeout(function waitToPlay() {

      if (_canPlay) {
        _video.play();
      } else {
        _canPlayTimer();
      }

    }, 200);
  }

  function _refresh() {
    _video.addEventListener("canplay", _onCanPlay, false);
    _video.addEventListener("loadeddata", _onLoadedData, false);

    // hide the video while it gets a data refresh to avoid visual ugliness
    _videoContainer.style.visibility = "hidden";

    // set new src value with a cachebuster
    _source.setAttribute("src", data.url + _separator + "cb=" + new Date().getTime());

    // flag associated with "canplay" event, ensures video won't be played until it has loaded enough
    _canPlay = false;

    _video.load();
  }

  function _refreshTimer(duration) {
    setTimeout(function videoRefresh() {

      if (_video.paused && _video.currentTime <= 0) {
        // Only refreshing immediately when in a paused state and the video is at the beginning
        _refresh();
      } else {
        _refreshWaiting = true;
      }

    }, duration);
  }

  /*
   *  Public Methods
   */
  function isInitialPlay() {
    return _initialPlay;
  }

  function init() {
    var typeAttr = document.createAttribute("type"),
      str;

    _fragment = document.createDocumentFragment();
    _source = _fragment.appendChild(document.createElement("source"));
    _srcAttr = document.createAttribute("src");

    // use default controls if not set to autoplay
    if (!data.video.autoplay) {
      _video.setAttribute("controls", "");
    }

    // set appropriate sizing class based on scaleToFit value
    _video.className = data.video.scaleToFit ? _video.className + " scale-to-fit"
      : _video.className + " no-scale";

    // set initial volume on <video>
    _video.volume = data.video.volume / 100;

    // set the "type" attribute on <source>
    typeAttr.value = "video/" + _getVideoFileType();
    _source.setAttributeNode(typeAttr);

    // video events
    _video.addEventListener("loadeddata", _onLoadedData, false);
    _video.addEventListener("canplay", _onCanPlay, false);
    _video.addEventListener("ended", _onEnded, false);
    _video.addEventListener("pause", _onPause, false);
    _video.addEventListener("play", _onPlay, false);

    _isStorageFile = (Object.keys(data.videoStorage).length !== 0);

    if (!_isStorageFile) {
      str = data.url.split("?");

      // store this for the refresh timer
      _separator = (str.length === 1) ? "?" : "&";

      // Non storage URL
      _srcAttr.value = data.url;
      _source.setAttributeNode(_srcAttr);
      _video.appendChild(_fragment);

    } else {
      // Rise Storage
      _storage.addEventListener("rise-storage-response", _storageResponse);

      _storage.setAttribute("folder", data.videoStorage.folder);
      _storage.setAttribute("fileName", data.videoStorage.fileName);
      _storage.setAttribute("companyId", data.videoStorage.companyId);
      _storage.go();
    }
  }

  function pause() {
    _viewerPaused = true;
    _video.pause();
  }

  function play() {
    _initialPlay = false;
    _viewerPaused = false;

    if (!_canPlay) {
      _canPlayTimer();
    } else {
      _video.play();
    }

  }

  function userPaused() {
    return _userPaused;
  }

  return {
    "isInitialPlay": isInitialPlay,
    "init": init,
    "pause": pause,
    "play": play,
    "userPaused": userPaused
  };
};

/* global gadgets, RiseVision */

(function (window, gadgets) {
  "use strict";

  var prefs = new gadgets.Prefs(),
    id = prefs.getString("id");

  // Disable context menu (right click menu)
  window.oncontextmenu = function () {
    return false;
  };

  function play() {
    RiseVision.Video.play();
  }

  function pause() {
    RiseVision.Video.pause();
  }

  function stop() {
    RiseVision.Video.stop();
  }

  function additionalParams(names, values) {
    if (Array.isArray(names) && names.length > 0 && names[0] === "additionalParams") {
      if (Array.isArray(values) && values.length > 0) {
        RiseVision.Video.setAdditionalParams(JSON.parse(values[0]));
      }
    }
  }

  if (id && id !== "") {
    gadgets.rpc.register("rscmd_play_" + id, play);
    gadgets.rpc.register("rscmd_pause_" + id, pause);
    gadgets.rpc.register("rscmd_stop_" + id, stop);

    gadgets.rpc.register("rsparam_set_" + id, additionalParams);
    gadgets.rpc.call("", "rsparam_get", null, id, ["additionalParams"]);

  }

})(window, gadgets);



/* jshint ignore:start */
var _gaq = _gaq || [];

_gaq.push(['_setAccount', 'UA-57092159-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
/* jshint ignore:end */
