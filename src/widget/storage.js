/* global config */

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
      if (e.detail && e.detail.url) {

        if (_initialLoad) {
          _initialLoad = false;

          RiseVision.Video.onStorageInit(e.detail.url);
        }
        else {
          // check for "changed" property and ensure it is true
          if (e.detail.hasOwnProperty("changed") && e.detail.changed) {
            RiseVision.Video.onStorageRefresh(e.detail.url);
          }
        }

        if (e.detail.hasOwnProperty("added") && e.detail.added) {
          RiseVision.Video.logEvent({ "event": "storage file added", "url": e.detail.url });
        }
        else if (e.detail.hasOwnProperty("changed") && e.detail.changed) {
          RiseVision.Video.logEvent({ "event": "storage file changed", "url": e.detail.url });
        }
      }
    });

    storage.addEventListener("rise-storage-no-file", function() {
      RiseVision.Video.logEvent({ "event": "storage file not found" });
      RiseVision.Video.noStorageFile();
    });

    storage.addEventListener("rise-storage-error", function(e) {
      var error;

      if (e && e.detail && e.detail.error && e.detail.error.type) {
        error = e.detail.error.type;
      }

      RiseVision.Video.logEvent({
        "event": "storage error",
        "event_details": error
      });
    });

    storage.setAttribute("folder", data.storage.folder);
    storage.setAttribute("fileName", data.storage.fileName);
    storage.setAttribute("companyId", data.storage.companyId);
    storage.setAttribute("env", config.STORAGE_ENV);
    storage.go();
  }

  return {
    "init": init
  };
};
