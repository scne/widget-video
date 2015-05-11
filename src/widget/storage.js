var RiseVision = RiseVision || {};
RiseVision.Video = RiseVision.Video || {};

RiseVision.Video.Storage = function (data) {
  "use strict";

  var _initialLoad = true;

  /*
   *  Public Methods
   */
  function init() {
    var storage = document.getElementById("videoStorage");

    if (!storage) {
      return;
    }

    storage.addEventListener("rise-storage-response", function(e) {
      var url;

      if (e.detail && e.detail.files && e.detail.files.length > 0) {
        url = e.detail.files[0].url;

        if (_initialLoad) {
          _initialLoad = false;

          RiseVision.Video.onStorageInit(url);

        } else {
          RiseVision.Video.onStorageRefresh(url);
        }
      }

    });

    storage.setAttribute("folder", data.storage.folder);
    storage.setAttribute("fileName", data.storage.fileName);
    storage.setAttribute("companyId", data.storage.companyId);
    storage.go();
  }

  return {
    "init": init
  };
};
