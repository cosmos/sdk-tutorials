/** @namespace H5P */
H5P.VideoFlash = (function ($) {

  /**
   * Flash video player for H5P.
   *
   * @class
   * @param {Array} sources Video files to use
   * @param {Object} options Settings for the player
   */
  function Flash(sources, options) {
    var self = this;

    // Player wrapper
    var $wrapper = $('<div/>', {
      'class': 'h5p-video-flash',
      css: {
        width: '100%',
        height: '100%'
      }
    });

    /**
     * Used to display error messages
     * @private
     */
    var $error = $('<div/>', {
      'class': 'h5p-video-error'
    });

    /**
    * Keep track of current state when changing quality.
    * @private
    */
    var stateBeforeChangingQuality;
    var currentTimeBeforeChangingQuality;

    // Sort sources into qualities
    //var qualities = getQualities(sources);
    var currentQuality;

    // Create player options
    var playerOptions = {
      buffering: true,
      clip: {
        url: sources[0].path, // getPreferredQuality(),
        autoPlay: options.autoplay,
        autoBuffering: true,
        scaling: 'fit',
        onSeek: function () {
          if (stateBeforeChangingQuality) {
            // ????
          }
        },
        onMetaData: function () {
          setTimeout(function () {
            if (stateBeforeChangingQuality !== undefined) {
              fp.seek(currentTimeBeforeChangingQuality);
              if (stateBeforeChangingQuality === H5P.Video.PLAYING) {
                // Resume play
                fp.play();
              }

              // Done changing quality
              stateBeforeChangingQuality = undefined;

              // Remove any errors
              if ($error.is(':visible')) {
                $error.remove();
              }
            }
            else {
              self.trigger('ready');
              self.trigger('loaded');
            }
          }, 0); // Run on next tick
        },
        onBegin: function () {
          self.trigger('stateChange', H5P.Video.PLAYING);
        },
        onResume: function () {
          self.trigger('stateChange', H5P.Video.PLAYING);
        },
        onPause: function () {
          self.trigger('stateChange', H5P.Video.PAUSED);
        },
        onFinish: function () {
          self.trigger('stateChange', H5P.Video.ENDED);
        },
        onError: function (code, message) {
          console.log('ERROR', code, message); // TODO
          self.trigger('error', message);
        }
      },
      plugins: {
        controls: null
      },
      play: null, // Disable overlay controls
      onPlaylistReplace: function () {
        that.playlistReplaced();
      }
    };

    if (options.controls) {
      playerOptions.plugins.controls = {};
      delete playerOptions.play;
    }

    var fp = flowplayer($wrapper[0], {
      src: "http://releases.flowplayer.org/swf/flowplayer-3.2.16.swf",
      wmode: "opaque"
    }, playerOptions);

    /**
     * Appends the video player to the DOM.
     *
     * @public
     * @param {jQuery} $container
     */
    self.appendTo = function ($container) {
      $wrapper.appendTo($container);
    };

    /**
     * Get list of available qualities. Not available until after play.
     *
     * @public
     * @returns {Array}
     */
    self.getQualities = function () {
      return;
    };

    /**
     * Get current playback quality. Not available until after play.
     *
     * @public
     * @returns {String}
     */
    self.getQuality = function () {
      return currentQuality;
    };

    /**
     * Set current playback quality. Not available until after play.
     * Listen to event "qualityChange" to check if successful.
     *
     * @public
     * @params {String} [quality]
     */
    self.setQuality = function (quality) {
      if (qualities[quality] === undefined || quality === currentQuality) {
        return; // Invalid quality
      }

      // Keep track of last choice
      setPreferredQuality(quality);

      // Avoid multiple loaded events if changing quality multiple times.
      if (!stateBeforeChangingQuality) {
        // Keep track of last state
        stateBeforeChangingQuality = lastState;

        // Keep track of current time
        currentTimeBeforeChangingQuality = video.currentTime;
      }

      // Keep track of current quality
      currentQuality = quality;
      self.trigger('qualityChange', currentQuality);

      // Display throbber
      self.trigger('stateChange', H5P.Video.BUFFERING);

      // Change source
      fp.setClip(qualities[quality].source.path);
      fp.startBuffering();
    };

    /**
     * Starts the video.
     *
     * @public
     */
    self.play = function () {
      if ($error.is(':visible')) {
        return;
      }

      fp.play();
    };

    /**
     * Pauses the video.
     *
     * @public
     */
    self.pause = function () {
      fp.pause();
    };

    /**
     * Seek video to given time.
     *
     * @public
     * @param {Number} time
     */
    self.seek = function (time) {
      fp.seek(time);
    };

    /**
     * Get elapsed time since video beginning.
     *
     * @public
     * @returns {Number}
     */
    self.getCurrentTime = function () {
      return fp.getTime();
    };

    /**
     * Get total video duration time.
     *
     * @public
     * @returns {Number}
     */
    self.getDuration = function () {
      return fp.getClip().metaData.duration;
    };

    /**
     * Get percentage of video that is buffered.
     *
     * @public
     * @returns {Number} Between 0 and 100
     */
    self.getBuffered = function () {
      return fp.getClip().buffer;
    };

    /**
     * Turn off video sound.
     *
     * @public
     */
    self.mute = function () {
      fp.mute();
    };

    /**
     * Turn on video sound.
     *
     * @public
     */
    self.unMute = function () {
      fp.unmute();
    };

    /**
     * Check if video sound is turned on or off.
     *
     * @public
     * @returns {Boolean}
     */
    self.isMuted = function () {
      return fp.muted;
    };

    /**
     * Returns the video sound level.
     *
     * @public
     * @returns {Number} Between 0 and 100.
     */
    self.getVolume = function () {
      return fp.volumeLevel * 100;
    };

    /**
     * Set video sound level.
     *
     * @public
     * @param {Number} volume Between 0 and 100.
     */
    self.setVolume = function (level) {
      fp.volume(level / 100);
    };

    // Handle resize events
    self.on('resize', function () {
      var $object = H5P.jQuery(fp.getParent()).children('object');
      var clip = fp.getClip();

      if (clip !== undefined) {
        $object.css('height', $object.width() * (clip.metaData.height / clip.metaData.width));
      }
    });
  }

  /**
   * Check to see if we can play any of the given sources.
   *
   * @public
   * @static
   * @param {Array} sources
   * @returns {Boolean}
   */
  Flash.canPlay = function (sources) {
    // Cycle through sources
    for (var i = 0; i < sources.length; i++) {
      if (sources[i].mime === 'video/mp4' || /\.mp4$/.test(sources[i].mime)) {
        return true; // We only play mp4
      }
    }
  };

  return Flash;
})(H5P.jQuery);

// Register video handler
H5P.videoHandlers = H5P.videoHandlers || [];
H5P.videoHandlers.push(H5P.VideoFlash);
