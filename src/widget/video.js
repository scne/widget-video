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
