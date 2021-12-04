/**
 * Defines the H5P.ImageHotspots class
 */
H5P.ImageHotspots = (function ($, EventDispatcher) {

  /**
   * Default font size
   *
   * @constant
   * @type {number}
   * @default
   */
  var DEFAULT_FONT_SIZE = 24;

  /**
   * Creates a new Image hotspots instance
   *
   * @class
   * @augments H5P.EventDispatcher
   * @namespace H5P
   * @param {Object} options
   * @param {number} id
   */
  function ImageHotspots(options, id) {
    EventDispatcher.call(this);

    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      image: null,
      hotspots: [],
      hotspotNumberLabel: 'Hotspot #num',
      closeButtonLabel: 'Close',
      iconType: 'icon',
      icon: 'plus'
    }, options);
    // Keep provided id.
    this.id = id;
    this.isSmallDevice = false;
  }
  // Extends the event dispatcher
  ImageHotspots.prototype = Object.create(EventDispatcher.prototype);
  ImageHotspots.prototype.constructor = ImageHotspots;

  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @public
   * @param {H5P.jQuery} $container
   */
  ImageHotspots.prototype.attach = function ($container) {
    var self = this;
    self.$container = $container;

    if (this.options.image === null || this.options.image === undefined) {
      $container.append('<div class="background-image-missing">Missing required background image</div>');
      return;
    }

    // Need to know since ios uses :hover when clicking on an element
    if (/(iPad|iPhone|iPod)/g.test( navigator.userAgent ) === false) {
      $container.addClass('not-an-ios-device');
    }

    $container.addClass('h5p-image-hotspots');

    this.$hotspotContainer = $('<div/>', {
      'class': 'h5p-image-hotspots-container'
    });

    if (this.options.image && this.options.image.path) {
      this.$image = $('<img/>', {
        'class': 'h5p-image-hotspots-background',
        src: H5P.getPath(this.options.image.path, this.id)
      }).appendTo(this.$hotspotContainer);

      // Set alt text of image
      if (this.options.backgroundImageAltText) {
        this.$image.attr('alt', this.options.backgroundImageAltText);
      }
      else {
        // Ignore image if no alternative text for assistive technologies
        this.$image.attr('aria-hidden', true);
      }
    }

    var isSmallDevice = function () {
      return self.isSmallDevice;
    };

    // Add hotspots
    var numHotspots = this.options.hotspots.length;
    this.hotspots = [];

    this.options.hotspots.sort(function (a, b) {
      // Sanity checks, move data to the back if invalid
      var firstIsValid = a.position && a.position.x && a.position.y;
      var secondIsValid = b.position && b.position.x && b.position.y;
      if (!firstIsValid) {
        return 1;
      }

      if (!secondIsValid) {
        return -1;
      }

      // Order top-to-bottom, left-to-right
      if (a.position.y !== b.position.y) {
        return a.position.y < b.position.y ? -1 : 1;
      }
      else {
        // a and b y position is equal, sort on x
        return a.position.x < b.position.x ? -1 : 1;
      }
    });

    for (var i=0; i<numHotspots; i++) {
      try {
        var hotspot = new ImageHotspots.Hotspot(this.options.hotspots[i], this.options, this.id, isSmallDevice, self);
        hotspot.appendTo(this.$hotspotContainer);
        var hotspotTitle = this.options.hotspots[i].header ? this.options.hotspots[i].header
          : this.options.hotspotNumberLabel.replace('#num', (i + 1).toString());
        hotspot.setTitle(hotspotTitle);
        this.hotspots.push(hotspot);
      }
      catch (e) {
        H5P.error(e);
      }
    }
    this.$hotspotContainer.appendTo($container);

    this.on('resize', self.resize, self);

    this.on('enterFullScreen', function () {
      // Resize image when entering fullscreen.
      setTimeout(function () {
        self.trigger('resize');

        // Trap focus
        self.toggleTrapFocus(true);
      });
    });

    this.on('exitFullScreen', function () {
      // Do not rely on that isFullscreen has been updated
      self.trigger('resize', {forceImageHeight: true});
      self.toggleTrapFocus(false);
    });

    self.resize();
  };

  ImageHotspots.prototype.setShowingPopup = function (visible) {
    this.$container.toggleClass('showing-popup', visible);
  };

  /**
   * Toggle trap focus between hotspots
   *
   * @param {boolean} enable True to enable, otherwise will be released
   */
  ImageHotspots.prototype.toggleTrapFocus = function (enable) {
    if (this.hotspots.length < 1) {
      return;
    }
    if (enable) {
      // focus first hotspot
      this.hotspots[0].focus();

      // Trap focus
      if (this.hotspots.length > 1) {
        this.hotspots[this.hotspots.length - 1].setTrapFocusTo(this.hotspots[0]);
        this.hotspots[0].setTrapFocusTo(this.hotspots[this.hotspots.length - 1], true);
      }
    }
    else {
      // Untrap focus
      this.hotspots[this.hotspots.length - 1].releaseTrapFocus();
      this.hotspots[0].releaseTrapFocus();
    }
  };

  /**
   * Handle resizing
   * @private
   * @param {Event} [e]
   * @param {boolean} [e.forceImageHeight]
   * @param {boolean} [e.decreaseSize]
   */
  ImageHotspots.prototype.resize = function (e) {
    if (this.options.image === null) {
      return;
    }

    var self = this;
    var containerWidth = self.$container.width();
    var containerHeight = self.$container.height();
    var width = containerWidth;
    var height = Math.floor((width/self.options.image.width) * self.options.image.height);
    var forceImageHeight = e && e.data && e.data.forceImageHeight;

    // Check if decreasing iframe size
    var decreaseSize = e && e.data && e.data.decreaseSize;
    if (!decreaseSize) {
      self.$container.css('width', '');
    }
    
    // If fullscreen & standalone 
    if (this.isRoot() && H5P.isFullscreen) {
      // If fullscreen, we have both a max width and max height.
      if (!forceImageHeight && height > containerHeight) {
        height = containerHeight;
        width = Math.floor((height/self.options.image.height) * self.options.image.width);
      }

      // Check if we need to apply semi full screen fix.
      if (self.$container.is('.h5p-semi-fullscreen')) {

        // Reset semi fullscreen width
        self.$container.css('width', '');

        // Decrease iframe size
        if (!decreaseSize) {
          self.$hotspotContainer.css('width', '10px');
          self.$image.css('width', '10px');

          // Trigger changes
          setTimeout(function () {
            self.trigger('resize', {decreaseSize: true});
          }, 200);
        }

        // Set width equal to iframe parent width, since iframe content has not been updated yet.
        var $iframe = $(window.frameElement);
        if ($iframe) {
          var $iframeParent = $iframe.parent();
          width = $iframeParent.width();
          self.$container.css('width', width + 'px');
        }
      }
    }

    self.$image.css({
      width: width + 'px',
      height: height + 'px'
    });

    if (!self.initialWidth) {
      self.initialWidth = self.$container.width();
    }

    self.fontSize = Math.max(DEFAULT_FONT_SIZE, (DEFAULT_FONT_SIZE * (width/self.initialWidth)));

    self.$hotspotContainer.css({
      width: width + 'px',
      height: height + 'px',
      fontSize: self.fontSize + 'px'
    });

    self.isSmallDevice = (containerWidth / parseFloat($("body").css("font-size")) < 40);
  };

  return ImageHotspots;
})(H5P.jQuery, H5P.EventDispatcher);
