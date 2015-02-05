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
