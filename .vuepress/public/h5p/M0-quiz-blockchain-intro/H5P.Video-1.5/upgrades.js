/** @namespace H5PUpgrades */
var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.Video'] = (function () {

  /**
   * Help move and rename object properties.
   *
   * @private
   * @param {Object} oldObj The object that has the property
   * @param {String} oldProp The old property name
   * @param {String} newProp The new property name OR the new object.
   * @param {Object} [newObj] The new object for the property.
   */
  var moveProp = function (oldObj, oldProp, newProp, newObj) {
    if (!oldObj.hasOwnProperty(oldProp)) {
      return;
    }

    if (!(newProp instanceof String) && typeof newProp !== 'string') {
      // Allow using dropping newProp and using it as the new Object
      newObj = newProp;
      newProp = oldProp;
    }
    else if (!newObj) {
      // Move on same object
      newObj = oldObj;
    }

    newObj[newProp] = oldObj[oldProp];
    delete oldObj[oldProp];
  };

  return {
    1: {
      /**
       * Asynchronous content upgrade hook.
       * Upgrades content parameters to support Video 1.1.
       *
       * Renames some parameters to better suiting names, groups language
       * localizations and moves copyrights to new object.
       *
       * @public
       * @params {Object} parameters
       * @params {Function} finished
       */
      1: function (parameters, finished) {

        // Use new names that better fits
        moveProp(parameters, 'files', 'sources');
        moveProp(parameters, 'fitToWrapper', 'fit');

        if (parameters.contentName) {
          // Create new group for language localization
          parameters.l10n = {};
          moveProp(parameters, 'contentName', 'name', parameters.l10n);
        }

        // Move old copyright properties
        var source;
        if (parameters.copyright && parameters.sources && parameters.sources[0]) {
          source = parameters.sources[0];
        }
        if (source && source.copyright) {
          var props = ['title', 'author', 'source', 'license'];
          for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            if (parameters.copyright[prop] && !source.copyright[prop]) {
              moveProp(parameters.copyright, prop, source.copyright);
            }
          }
        }
        if (parameters.copyright) {
          delete parameters.copyright;
        }

        // Done
        finished(null, parameters);
      },

      /**
       * Asynchronous content upgrade hook.
       * Upgrades content parameters to support Video 1.2.
       *
       * Groups visuals, playback and a11y.
       *
       * @public
       * @params {Object} parameters
       * @params {Function} finished
       */
      2: function (parameters, finished) {

        // Regroup to visuals
        parameters.visuals = {};
        parameters.visuals.poster = parameters.poster;
        parameters.visuals.fit = parameters.fit;
        parameters.visuals.controls = parameters.controls;

        delete parameters.poster;
        delete parameters.fit;
        delete parameters.controls;

        // Regroup to playback
        parameters.playback = {};
        parameters.playback.autoplay = parameters.autoplay;
        parameters.playback.loop = parameters.loop;

        delete parameters.autoplay;
        delete parameters.loop;

        // Placeholder for a11y
        parameters.a11y = [];

        // Done
        finished(null, parameters);
      },

      5: function (parameters, finished, extras) {
        if (parameters.sources && parameters.sources.length > 0) {
          var copyright = parameters.sources[0].copyright;
          if (copyright) {
            var years = [];
            if (copyright.year) {
              // Try to find start and end year
              years = copyright.year
                .replace(' ', '')
                .replace('--', '-') // Try to check for LaTeX notation
                .split('-');
            }
            var yearFrom = (years.length > 0) ? new Date(years[0]).getFullYear() : undefined;
            var yearTo = (years.length > 0) ? new Date(years[1]).getFullYear() : undefined;

            // Build metadata object
            var metadata = {
              title: copyright.title,
              authors: (copyright.author) ? [{name: copyright.author, role: 'Author'}] : undefined,
              source: copyright.source,
              yearFrom: isNaN(yearFrom) ? undefined : yearFrom,
              yearTo: isNaN(yearTo) ? undefined : yearTo,
              license: copyright.license,
              licenseVersion: copyright.version
            };

            extras = extras || {};
            extras.metadata = metadata;

            parameters.sources.forEach(function(source) {
              delete source.copyright;
            });
          }
        }

        // Done
        finished(null, parameters, extras);
      }
    }
  };
})();
