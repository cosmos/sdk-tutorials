/**
 * Defines the ImageHotspots.Popup class
 */
(function ($, ImageHotspots, EventDispatcher) {

  /**
   * Creates new Popup instance
   *
   * @class
   * @namespace H5P.ImageHotspots
   * @param {H5P.jQuery} $container
   * @param {H5P.jQuery} $content
   * @param {number} x
   * @param {number} y
   * @param {number} hotspotWidth
   * @param {string} header
   * @param {string} className
   * @param {boolean} fullscreen
   * @param {Object} options
   *
   */
  ImageHotspots.Popup = function ($container, $content, x, y, hotspotWidth, header, className, fullscreen, options, legacy) {
    EventDispatcher.call(this);

    var self = this;
    this.$container = $container;
    var width = this.$container.width();
    var height = this.$container.height();

    var pointerWidthInPercent = 1.55;
    hotspotWidth = (hotspotWidth/width)*100;

    var popupLeft = 0;
    var popupWidth = 0;
    var toTheLeft = false;

    if (fullscreen) {
      popupWidth = 100;
      className += ' fullscreen-popup';
    }
    else {
      toTheLeft = (x > 50);
      popupLeft = (toTheLeft ? 0 : (x + hotspotWidth + pointerWidthInPercent));
      popupWidth = (toTheLeft ?  (x - hotspotWidth - pointerWidthInPercent) : 100 - popupLeft);
    }

    this.$popupBackground = $('<div/>', {'class': 'h5p-image-hotspots-overlay'});
    this.$popup = $('<div/>', {
      'class': 'h5p-image-hotspot-popup ' + className,
      'role': 'dialog'
    }).css({
      left: (toTheLeft ? '' : '-') + '100%',
      width: popupWidth + '%'
    }).click(function (event) {
      // If clicking on popup, stop propagating:
      event.stopPropagation();
    }).appendTo(this.$popupBackground);

    this.$popupContent = $('<div/>', {
      'class': 'h5p-image-hotspot-popup-content',
      on: {
        scroll: function () {
          $(this).addClass('has-scrolled');
        }
      }
    });
    if (header) {
      this.$popupHeader = $('<div/>', {
        'class': 'h5p-image-hotspot-popup-header',
        html: header,
        'tabindex': '-1'
      });
      this.$popupContent.append(this.$popupHeader);
      this.$popup.addClass('h5p-image-hotspot-has-header');
    }
    $content.appendTo(this.$popupContent);
    this.$popupContent.appendTo(this.$popup);

    // Add close button
    this.$closeButton = $('<button>', {
      'class': 'h5p-image-hotspot-close-popup-button',
      'aria-label': options.closeButtonLabel,
      'title': options.closeButtonLabel
    }).click(function () {
      self.trigger('closed');
    }).keydown(function (e) {
      if (e.which === 32 || e.which === 13) {
        self.trigger('closed', {refocus: true});
        return false;
      }
    }).appendTo(this.$popup);

    // Need to add pointer to parent container, since this should be partly covered
    // by the popup
    if (!fullscreen) {
      this.$pointer = $('<div/>', {
        'class': 'h5p-image-hotspot-popup-pointer to-the-' + (toTheLeft ? 'left' : 'right') + (legacy ? ' legacy-positioning' : ''),
      }).css({
        top: y + '%',
      }).appendTo(this.$popupBackground);
    }

    this.$popupBackground.appendTo(this.$container);

    self.resize = function () {
      if (fullscreen) {
        return;
      }

      // Reset 
      self.$popup.css({
        maxHeight: '',
        height: ''
      });
      self.$popupContent.css({
        height: ''
      });
      
      height = this.$container.height();
      var contentHeight = self.$popupContent.outerHeight();
      var parentHeight = self.$popup.outerHeight();

      var fitsWithin = contentHeight < height;

      if (fitsWithin) {
        // don't need all height:
        self.$popup.css({
          maxHeight: 'auto',
          height: 'auto'
        });

        // find new top:
        var top = Math.max(0, ((y / 100) * parentHeight) - (contentHeight / 2));

        // Check if we need to move it a bit up (in case it overflows)
        if (top + contentHeight > parentHeight) {
          top = parentHeight - contentHeight;
        }

        // From pixels to percent:
        self.$popup.css({
          top: (top / parentHeight) * 100 + '%'
        });
      }
      
      self.$popupContent.css({
        height: fitsWithin ? '' : '100%',
        overflow: fitsWithin ? '' : 'auto'
      }).toggleClass('overflowing', !fitsWithin);

      self.$popup.toggleClass('popup-overflowing', !fitsWithin);
    };

    /**
     * Show popup
     * @param {boolean} [focusContainer] Will focus container for keyboard accessibility
     */
    self.show = function (focusContainer) {

      if (!fullscreen) {

        self.resize();

        // Need to move pointer:
        self.$pointer.css({
          left: toTheLeft ? (
            popupWidth + '%'
          ) : (
            popupLeft + '%'
          )
        });
      }

      self.$popup.css({
        left: popupLeft + '%'
      });
      self.$popupBackground.addClass('visible');

      H5P.Transition.onTransitionEnd(self.$popup, function () {
        if (focusContainer) {
          if (self.$popupHeader) {
            self.$popupHeader.focus();
          }
          else {
            self.$closeButton.focus();
          }
        }

        // Show pointer;
        if (self.$pointer) {
          self.$pointer.addClass('visible');
        }
        self.trigger('finishedLoading');
      }, 300);
    };

    self.hide = function () {
      self.$popupBackground.remove();
    };
  };

  // Extends the event dispatcher
  ImageHotspots.Popup.prototype = Object.create(EventDispatcher.prototype);
  ImageHotspots.Popup.prototype.constructor = ImageHotspots.Popup;

})(H5P.jQuery, H5P.ImageHotspots, H5P.EventDispatcher);
