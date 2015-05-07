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

    if (e.detail && e.detail.files && e.detail.files.length > 0) {
      _srcAttr.value = e.detail.files[0].url;
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

    _isStorageFile = (Object.keys(data.storage).length !== 0);

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

      _storage.setAttribute("folder", data.storage.folder);
      _storage.setAttribute("fileName", data.storage.fileName);
      _storage.setAttribute("companyId", data.storage.companyId);
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
