(function(window) {
  "use strict";

  window.gadget = window.gadget || {};

  window.gadget.settings = {
    "params": {},
    "additionalParams": {
      "url": "https://s3.amazonaws.com/risecontentfiles/tests/a_RFID.webm",
      "videoStorage": {},
      "video": {
        "autoplay":false,
        "scaleToFit":true,
        "volume":50
      },
      "background": {
        "color": "rgba(145,145,145,0)",
        "useImage": true,
        "image": {
          "url": "http://s3.amazonaws.com/rise-common/images/logo-small.png",
          "position": "middle-center",
          "scale": true
        }
      },
      "backgroundStorage": {}
    }
  };

})(window);
