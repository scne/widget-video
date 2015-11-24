/* global config, _ */

var RiseVision = RiseVision || {};
RiseVision.Video = RiseVision.Video || {};

RiseVision.Video.StorageFolder = function (data) {
  "use strict";

  var _initialLoad = true;

  var _files = [];

  function _getUrls() {
    return _.pluck(_files, "url");
  }

  function _getExistingFile(file) {
    return _.find(_files, function (f) {
      return file.name === f.name;
    });
  }

  function _deleteFile(file) {
    var existing = _getExistingFile(file);

    if (existing) {
      _files.splice(_files.indexOf(existing), 1);
    }
  }

  function _changeFile(file) {
    var existing = _getExistingFile(file);

    if (existing) {
      existing.url = file.url;
    }
  }

  function _addFile(file) {
    var existing = _getExistingFile(file);

    if (!existing) {
      // extract the actual file name and store in new property on file object
      file.fileName = file.name.slice(file.name.lastIndexOf("/") + 1, file.name.lastIndexOf(".")).toLowerCase();

      // insert file to _files list at specific index based on alphabetical order of file name
      _files.splice(_.sortedIndex(_files, file, "fileName"), 0, file);
    }
  }

  /*
   *  Public Methods
   */
  function init() {
    var storage = document.getElementById("videoStorage");

    if (!storage) {
      return;
    }

    storage.addEventListener("rise-storage-response", function(e) {
      var file = e.detail;

      // Added
      if(file.added) {
        _addFile(file);

        if (_initialLoad) {
          _initialLoad = false;
          RiseVision.Video.onFileInit(_getUrls());

          return;
        }
      }

      // Changed
      if(file.changed) {
        _changeFile(file);
      }

      // Deleted
      if(file.deleted) {
        _deleteFile(file);
      }

      RiseVision.Video.onFileRefresh(_getUrls());

    });

    storage.addEventListener("rise-storage-empty-folder", function () {
      var params = { "event": "storage folder empty" };

      RiseVision.Video.logEvent(params, true);
      RiseVision.Video.showError("The selected folder does not contain any videos.");
    });

    storage.addEventListener("rise-storage-no-folder", function () {
      var params = { "event": "storage folder doesn't exist" };

      RiseVision.Video.logEvent(params, true);
      RiseVision.Video.showError("The selected folder does not exist.");
    });

    storage.addEventListener("rise-storage-error", function() {
      var params = { "event": "storage error" };

      RiseVision.Video.logEvent(params, true);
      RiseVision.Video.showError("Sorry, there was a problem playing the video from Storage.");
    });

    storage.setAttribute("fileType", "video");
    storage.setAttribute("companyId", data.storage.companyId);
    storage.setAttribute("folder", data.storage.folder);
    storage.setAttribute("env", config.STORAGE_ENV);

    storage.go();
  }

  return {
    "init": init
  };
};
