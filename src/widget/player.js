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
    var typeAttr = document.createAttribute("type");

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

    if (Object.keys(data.videoStorage).length === 0) {
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
