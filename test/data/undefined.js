(function(window) {
  "use strict";

  window.gadget = window.gadget || {};

  window.gadget.settings = {
    "params": {},
    "additionalParams": {
      "url": "https://s3.amazonaws.com/risecontentfiles/tests/a_RFID.webm",
      "videoStorage": {},
      "video": {
        "autoplay":true,
        // ** scaleToFit **
        "volume":50
      },
      "background": {
        "color": "rgba(255,255,255,0)",
        "useImage": false,
        "image": {
          "url": "",
          "position": "top-left",
          "scale": true
        }
      },
      "backgroundStorage": {}
    }
  };

})(window);
