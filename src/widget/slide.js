/* global gadgets */

var RiseVision = RiseVision || {};
RiseVision.WebPage = {};

RiseVision.WebPage = (function (document, gadgets) {

  "use strict";

  // private variables
  var _prefs = new gadgets.Prefs(),
    _utils = RiseVision.Common.Utilities,
    _additionalParams = null,
    _url = "",
    _intervalId = null,
    _initialLoad = true;

  var _message = null;

  /*
   *  Private Methods
   */
  function _ready() {
    gadgets.rpc.call("", "rsevent_ready", null, _prefs.getString("id"),
      true, true, true, true, false);
  }

  function _setInteractivity(frame) {
    var blocker = document.querySelector(".blocker");

    blocker.style.display = (_additionalParams.interactivity.interactive) ? "none" : "block";

    frame.setAttribute("height", (_additionalParams.interactivity.interactive) ? _prefs.getInt("rsH") + "px" :  (_prefs.getInt("rsH")+29) + "px");

  }

  function _startRefreshInterval() {
    _intervalId = setInterval(function () {
      _utils.hasInternetConnection("img/transparent.png", function (hasInternet) {
        if (hasInternet) {
          _loadFrame();
        }
      });
    }, _additionalParams.refresh);
  }

  function _getFrameElement() {
    var frame = document.createElement("iframe"),
      container = document.getElementById("container");

    frame.className = "webpage-frame";
    frame.style.visibility = "hidden";
    frame.setAttribute("frameborder", "0");
    frame.setAttribute("allowTransparency", "true");
    frame.setAttribute("allowfullscreen", "true");
    frame.setAttribute("mozallowfullscreen", "true");
    frame.setAttribute("webkitallowfullscreen", "true");

    frame.setAttribute("width", _prefs.getInt("rsW") + "px");
    frame.setAttribute("height", _prefs.getInt("rsH") + "px");
    frame.setAttribute("sandbox", "allow-forms allow-same-origin allow-scripts");

    container.style.width = _prefs.getInt("rsW") + "px";
    container.style.height = _prefs.getInt("rsH") + "px";

    _setInteractivity(frame);

    frame.onload = function () {
      this.onload = null;
      this.style.visibility = "visible";

      _initialLoad = false;

      // check if refresh interval should be started
      if (_additionalParams.refresh > 0 && _intervalId === null) {
        _startRefreshInterval();
      }

      if (document.querySelectorAll(".webpage-frame").length > 1) {
        // Refresh occurred, remove old iframe
        container.removeChild(document.querySelector(".webpage-frame"));
      }
    };

    return frame;
  }

  function _loadFrame() {
    var container = document.getElementById("container"),
      fragment = document.createDocumentFragment(),
      frame = _getFrameElement();

    frame.setAttribute("src", _url);

    fragment.appendChild(frame);
    container.appendChild(fragment);
  }

  function _unloadFrame() {
    var container = document.getElementById("container"),
      frame = document.querySelector(".webpage-frame");

    if (_additionalParams.refresh > 0) {
      clearInterval(_intervalId);
      _intervalId = null;
    }

    if (frame) {
      container.removeChild(frame);
    }

  }

  function _constructURL() {
    var GOOGLE_PRESENTATION_URL = "https://docs.google.com/presentation/d/FILE_ID/embed?start=START_VALUE&loop=LOOP_VALUE&delayms=AUTO_ADVANCE_INTERVAL_VALUE";

    _url = GOOGLE_PRESENTATION_URL.replace(/FILE_ID/, _additionalParams.slide.fileId);
    _url = _url.replace(/START_VALUE/, _additionalParams.slide.autoPlay);
    _url = _url.replace(/LOOP_VALUE/, _additionalParams.slide.loop);
    _url = _url.replace(/AUTO_ADVANCE_INTERVAL_VALUE/, _additionalParams.slide.autoAdvanceInterval * 1000);
  }

  function _init() {
    _message = new RiseVision.Common.Message(document.getElementById("container"),
      document.getElementById("messageContainer"));

    // apply height value to message container so a message gets vertically centered
    document.getElementById("messageContainer").style.height = _prefs.getInt("rsH") + "px";

    // Configure the value for _url
    _constructURL();

    _ready();
  }

  /*
   *  Public Methods
   */
  function getTableName() {
    return "webpage_events";
  }

  function logEvent(params) {
    RiseVision.Common.LoggerUtils.logEvent(getTableName(), params);
  }

  function pause() {
    if (_additionalParams.unload) {
      _unloadFrame();
    }
  }

  function play() {

    logEvent({ "event": "play", "url": _url });

    if (_initialLoad || _additionalParams.unload) {
      _loadFrame();
    }
  }

  function stop() {
    pause();
  }

  function setAdditionalParams(additionalParams) {
    _additionalParams = JSON.parse(JSON.stringify(additionalParams));

    _init();
  }

  return {
    "getTableName": getTableName,
    "logEvent": logEvent,
    "setAdditionalParams": setAdditionalParams,
    "pause": pause,
    "play": play,
    "stop": stop
  };

})(document, gadgets);
