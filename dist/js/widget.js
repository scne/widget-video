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
    _background = null;

  /*
   *  Private Methods
   */
  function _ready() {
    gadgets.rpc.call("", "rsevent_ready", null, _prefs.getString("id"),
      true, true, true, true, true);
  }

  /*
   *  Public Methods
   */
  function backgroundReady() {
    // TODO: temporarily call _ready() but video configuration is still to come
    _ready();
  }

  function setCompanyId(name, value) {
    if (name && name === "companyId") {
      _companyId = value;
    }
  }

  function setAdditionalParams(params) {
    _prefs = new gadgets.Prefs();
    _additionalParams = params;

    document.getElementById("container").style.height = _prefs.getInt("rsH") + "px";

    // create new Background instance
    _background = new RiseVision.Video.Background(_additionalParams, _companyId);
    _background.init();
  }

  return {
    "backgroundReady": backgroundReady,
    "setCompanyId": setCompanyId,
    "setAdditionalParams": setAdditionalParams
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

  }

  function pause() {

  }

  function stop() {

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
