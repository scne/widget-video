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
      .value("STORAGE_MODAL", "http://storage.risevision.com/~rvi/storage-client-rva-test/storage-modal.html#/files/");
  }
}

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
    // https://github.com/Rise-Vision/viewer/issues/30
    // Have to call pause() due to Viewer issue
    pause();
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

var RiseVision = RiseVision || {};
RiseVision.Video = RiseVision.Video || {};

RiseVision.Video.Background = function (data, companyId) {
  "use strict";

  /*
   *  Public Methods
   */
  function init() {
    var background = document.getElementById("background"),
      storage = document.getElementById("backgroundStorage");

    // set the document background
    document.body.style.background = data.background.color;

    if (data.background.useImage) {
      background.className = data.background.image.position;
      background.className = data.background.image.scale ? background.className + " scale-to-fit"
        : background.className;

      if (Object.keys(data.backgroundStorage).length === 0) {
        background.style.backgroundImage = "url(" + data.background.image.url + ")";
        RiseVision.Video.backgroundReady();
      } else {
        // Rise Storage
        storage.addEventListener("rise-storage-response", function(e) {
          background.style.backgroundImage = "url(" + e.detail[0] + ")";
          RiseVision.Video.backgroundReady();
        });

        storage.setAttribute("folder", data.backgroundStorage.folder);
        storage.setAttribute("fileName", data.backgroundStorage.fileName);
        storage.setAttribute("companyId", companyId);
        storage.go();
      }
    } else {
      RiseVision.Video.backgroundReady();
    }
  }

  return {
    "init": init
  };
};

var RiseVision = RiseVision || {};
RiseVision.Video = RiseVision.Video || {};

RiseVision.Video.Player = function (data, companyId) {
  "use strict";

  var _video = document.getElementById("video"),
    _videoContainer = document.getElementById("videoContainer"),
    _initialPlay = true,
    _userPaused = false,
    _viewerPaused = false;

  /*
   * Private Methods
   */
  function _getVideoFileType() {
    var type = data.url.substr(data.url.lastIndexOf(".") + 1);

    if (type === "ogv") {
      type = "ogg";
    }

    return type;
  }

  function _onLoadedData() {
    // at lease 1st frame of video has loaded
    _videoContainer.style.visibility = "visible";
    // remove this listener
    _video.removeEventListener("loadeddata", _onLoadedData, false);
  }

  function _onCanPlay() {
    // enough data has loaded to safely play without interruption
    RiseVision.Video.playerReady();
    // remove this listener
    _video.removeEventListener("canplay", _onCanPlay, false);
  }

  function _onEnded() {
    // a "pause" event is always fired before "ended" event, ensure _userPaused is false
    _userPaused = false;
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

  /*
   *  Public Methods
   */
  function isInitialPlay() {
    return _initialPlay;
  }

  function init() {
    var storage = document.getElementById("videoStorage"),
      fragment = document.createDocumentFragment(),
      source = fragment.appendChild(document.createElement("source")),
      srcAttr = document.createAttribute("src"),
      typeAttr = document.createAttribute("type");

    // set initial volume on <video>
    _video.volume = data.video.volume / 100;

    // set the "type" attribute on <source>
    typeAttr.value = "video/" + _getVideoFileType();
    source.setAttributeNode(typeAttr);

    // video events
    _video.addEventListener("loadeddata", _onLoadedData, false);
    _video.addEventListener("canplay", _onCanPlay, false);
    _video.addEventListener("ended", _onEnded, false);
    _video.addEventListener("pause", _onPause, false);
    _video.addEventListener("play", _onPlay, false);

    if (Object.keys(data.videoStorage).length === 0) {
      // Non storage URL
      srcAttr.value = data.url;
      source.setAttributeNode(srcAttr);
      _video.appendChild(fragment);

    } else {
      // Rise Storage
      storage.addEventListener("rise-storage-response", function (e) {
        srcAttr.value = e.detail[0];
        source.setAttributeNode(srcAttr);
        _video.appendChild(fragment);
      });

      storage.setAttribute("folder", data.videoStorage.folder);
      storage.setAttribute("fileName", data.videoStorage.fileName);
      storage.setAttribute("companyId", companyId);
      storage.go();
    }
  }

  function pause() {
    _viewerPaused = true;
    _video.pause();
  }

  function play() {
    _initialPlay = false;
    _viewerPaused = false;
    _video.play();
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

  function companyId(name, value) {
    if (name && name === "companyId") {
      RiseVision.Video.setCompanyId(value);
    }

    gadgets.rpc.register("rsparam_set_" + id, additionalParams);
    gadgets.rpc.call("", "rsparam_get", null, id, ["additionalParams"]);
  }

  if (id && id !== "") {
    gadgets.rpc.register("rscmd_play_" + id, play);
    gadgets.rpc.register("rscmd_pause_" + id, pause);
    gadgets.rpc.register("rscmd_stop_" + id, stop);
    gadgets.rpc.register("rsparam_set_" + id, companyId);

    gadgets.rpc.call("", "rsparam_get", null, id, "companyId");

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
