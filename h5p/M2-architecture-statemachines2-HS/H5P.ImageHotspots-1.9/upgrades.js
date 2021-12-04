var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.ImageHotspots'] = (function () {
  return {
    1: {
       /**
       * Asynchronous content upgrade hook.
       * Upgrades content parameters to support ImageHotspots 1.1.
       *
       * Moves the fields named x and y into the position group
       *
       * @params {Object} parameters
       * @params {function} finished
       */
      1: function (parameters, finished) {
        // Move x and y
        if (parameters.hotspots !== undefined) {
          for (var i = 0; i < parameters.hotspots.length; i++) {
            parameters.hotspots[i].position = {
              x: parameters.hotspots[i].x || 0,
              y: parameters.hotspots[i].y || 0
            };

            delete parameters.hotspots[i].x;
            delete parameters.hotspots[i].y;
          }
        }

        finished(null, parameters);
      },
      /**
       * Upgrades content parameters to support ImageHotspots 1.3
       *
       * Moves hotspot content into list
       *
       * @param parameters
       * @param finished
       */
      3: function (parameters, finished) {
        if (parameters.hotspots !== undefined) {
          parameters.hotspots.forEach(function (hotspot) {
            if (hotspot.action) {
              hotspot.content = [];
              hotspot.content.push(hotspot.action);
              delete hotspot.action;
            }
          });
        }

        finished(null, parameters);
      },
      /**
       * Upgrades content parameters to support ImageHotspots 1.4
       *
       * Adds '#' in front of hex color provided from color selector widget
       *
       * @param parameters
       * @param finished
       */
      4: function (parameters, finished) {

        // Old content has specified a color, opposed to using the default
        if (parameters.color.charAt(0) !== '#') {
          parameters.color = '#' + parameters.color;
        }

        finished(null, parameters);
      },

      /**
       * Upgrades content parameters to support ImageHotspots 1.8
       *
       * Mark all existing hotspots as being legacy positioned
       *
       * @param parameters
       * @param finished
       */
      8: function (parameters, finished) {
        if (parameters.hotspots !== undefined) {
          parameters.hotspots.forEach(function (hotspot) {
            if (hotspot.position) {
              hotspot.position.legacyPositioning = true;
            }
          });
        }
        finished(null, parameters);
      },

    }
  };
})();
