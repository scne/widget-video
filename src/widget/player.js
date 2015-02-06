var RiseVision = RiseVision || {};
RiseVision.Video = RiseVision.Video || {};

RiseVision.Video.Player = function (data, companyId) {
  "use strict";

  var _video = document.getElementById("video"),
    _initialPlay = true;

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
    _video.volume = data.video.volume/100;

    // set the "type" attribute on <source>
    typeAttr.value = "video/webm";
    source.setAttributeNode(typeAttr);

    // listen for video data loaded
    _video.addEventListener("loadeddata", function() {
      RiseVision.Video.playerReady();
    }, false);

    if (Object.keys(data.videoStorage).length === 0) {
      // Non storage URL
      srcAttr.value = data.url;
      source.setAttributeNode(srcAttr);
      _video.appendChild(fragment);

    } else {
      // Rise Storage
      storage.addEventListener("rise-storage-response", function(e) {
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
    _video.pause();
  }

  function play() {
    _video.play();

    if (_initialPlay) {
      _initialPlay = false;
    }
  }

  return {
    "isInitialPlay": isInitialPlay,
    "init": init,
    "pause": pause,
    "play": play
  };
};
