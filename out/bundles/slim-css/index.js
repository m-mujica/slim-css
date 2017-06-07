/*[slim-loader-config]*/
(function(global) {
  global.steal = global.steal || {};

  global.steal.map = {};
  global.steal.paths = {
    "5": "out/bundles/slim-css/index.js",
    "6": "out/bundles/slim-css/index.css"
  };
  global.steal.bundles = { "2": 5, "3": 5, "4": 6 };
  global.steal.plugins = { "4": 3 };
})(window);

/*[slim-loader-shim]*/
(function(modules) {
  var modulesMap = {};
  var loadedModules = {};

  var LOADED = 0;
  var SCRIPT_TIMEOUT = 120000;

  function addModules(mods) {
    mods.forEach(function(m) {
      modulesMap[m[0]] = m[1];
    });
  }

  addModules(modules);

  function stealRequire(moduleId) {
    if (loadedModules[moduleId]) {
      return loadedModules[moduleId];
    }

    if (steal.plugins[moduleId]) {
      return stealRequire(steal.plugins[moduleId]/*plugin module id*/)(
        steal.paths[steal.bundles[moduleId]/*bundle id*/]
      );
    }

    var stealModule = (loadedModules[moduleId] = {
      exports: {}
    });

    modulesMap[moduleId].call(
      stealModule.exports,
      stealRequire,
      stealModule.exports,
      stealModule
    );

    return stealModule.exports;
  }

  // import the main module
  stealRequire(2);
})([
  [
    3,
    function(stealRequire, stealExports, stealModule) {
      stealModule.exports = function(address) {
        return new CssModule(address).injectLink();
      };

      function CssModule(address) {
        this.address = address;
      }

      // timeout in seconds
      CssModule.waitTimeout = 60;

      CssModule.prototype.linkExists = function() {
        var styleSheets = document.styleSheets;

        for (var i = 0; i < styleSheets.length; ++i) {
          if (this.address === styleSheets[i].href) {
            return true;
          }
        }

        return false;
      };

      CssModule.prototype.injectLink = function() {
        if (this._loadPromise) {
          return this._loadPromise;
        }

        if (this.linkExists()) {
          return (this._loadPromise = Promise.resolve(""));
        }

        var link = (this.link = document.createElement("link"));
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = this.address;

        // wait until the css file is loaded
        this._loadPromise = new Promise(function(resolve, reject) {
          var timeout = setTimeout(function() {
            reject("Unable to load CSS");
          }, CssModule.waitTimeout * 1000);

          var linkEventCallback = function(event) {
            clearTimeout(timeout);

            link.removeEventListener("load", linkEventCallback);
            link.removeEventListener("error", linkEventCallback);

            if (event && event.type === "error") {
              reject("Unable to load CSS");
            } else {
              resolve("");
            }
          };

          link.addEventListener("load", linkEventCallback);
          link.addEventListener("error", linkEventCallback);

          document.head.appendChild(link);
        });

        return this._loadPromise;
      };
    }
  ],
  [
    2,
    function(stealRequire, stealExports, stealModule) {
      stealRequire(4);
      console.log("hello world!");
    }
  ]
]);
