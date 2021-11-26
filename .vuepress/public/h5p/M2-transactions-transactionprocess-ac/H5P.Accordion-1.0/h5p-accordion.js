/**
 * Accordion module
 *
 * @param {jQuery} $
 */
H5P.Accordion = (function ($) {

  var nextIdPrefix = 0;
  var nextLooperId = 0;
  var allowedLoopers = [];
  /**
   * Initialize a new Accordion
   *
   * @class H5P.InteractiveVideo
   * @extends H5P.EventDispatcher
   * @param {Object} params Behavior settings
   * @param {Number} contentId Content identification
   * @param {Object} contentData Object containing task specific content data
   */
  function Accordion(params, contentId, contentData) {
    this.contentId = contentId;
    H5P.EventDispatcher.call(this);

    // Set default behavior.
    this.params = $.extend({}, {
      hTag: "h2",
      panels: []
    }, params);

    this.contentData = contentData;

    this.instances = [];

    for (var i = 0; i < this.params.panels.length; i++) {
      this.instances[i] = H5P.newRunnable(this.params.panels[i].content, contentId);
    }

    this.idPrefix = (nextIdPrefix++) + '-';
  }

  Accordion.prototype = Object.create(H5P.EventDispatcher.prototype);
  Accordion.prototype.constructor = Accordion;

  /**
   * Append field to wrapper.
   * @param {jQuery} container the jQuery object which this module will attach itself to.
   */
  Accordion.prototype.attach = function ($container) {
    var self = this;

    if (self.$content === undefined) {
      // Mark as consumed
      self.triggerConsumed();

      // Create the content
      self.elements = [];
      for (var i = 0; i < self.params.panels.length; i++) {
        self.createPanel(i);
      }
      self.$content = $(self.elements);
    }

    // Insert content
    $container.html('').addClass('h5p-accordion').append(self.$content);
  };

  /**
   * Create HTML for Panel.
   * @param {number} id
   */
  Accordion.prototype.createPanel = function (id) {
    var self = this;
    var titleId = 'h5p-panel-link-' + this.idPrefix + id;
    var contentId = 'h5p-panel-content-' + self.idPrefix + id;

    var toggleCollapse = function () {
      if (self.$expandedTitle === undefined || !self.$expandedTitle.is($title)) {
        self.collapseExpandedPanels();
        self.expandPanel($title, $content);
      }
      else {
        self.collapsePanel($title, $content);
      }

      // We're running in an iframe, so we must animate the iframe height
      self.animateResize();
    };

    // Create panel title
    var $title =  $('<' + this.params.hTag + '/>', {
      'id': titleId,
      'class': 'h5p-panel-title',
      'role': 'button',
      'tabindex': (id === 0 ? '0' : '-1'),
      'aria-selected': (id === 0 ? 'true' : 'false'),
      'aria-expanded': 'false',
      'aria-controls': contentId,
      'html': self.params.panels[id].title,
      'on': {
        'click': toggleCollapse,
        'keydown': function (event) {
          switch (event.keyCode) {
            case 38:   // Up
            case 37: { // Left
              // Try to select previous item
              var $prev = $title.prev().prev();
              if ($prev.length) {
                $prev.attr({
                  'tabindex': '0',
                  'aria-selected': 'true'
                }).focus();
                $title.attr({
                  'tabindex': '-1',
                  'aria-selected': 'false'
                });
              }
              return false;
            }
            case 40:   // Down
            case 39: { // Right
              // Try to select next item
              var $next = $content.next();
              if ($next.length) {
                $next.attr({
                  'tabindex': '0',
                  'aria-selected': 'true'
                }).focus();
                $title.attr({
                  'tabindex': '-1',
                  'aria-selected': 'false'
                });
              }
              return false;
            }

            case 32:   // SPACE
            case 13: { // ENTER
              toggleCollapse();
              return false;
            }
          }
        }
      }
    });

    // Create panel content
    var $content = $('<div>', {
      'id': contentId,
      'class': 'h5p-panel-content',
      'role': 'region',
      'aria-labelledby': titleId,
      'aria-hidden': 'true'
    });

    // Add the content itself to the content section
    self.instances[id].attach($content);

    // Gather all content
    self.elements.push($title[0]);
    self.elements.push($content[0]);
  };

  /**
   * Trigger the 'consumed' xAPI event when this commences
   *
   * (Will be more sophisticated in future version)
   */
  Accordion.prototype.triggerConsumed = function () {
    var xAPIEvent = this.createXAPIEventTemplate({
      id: 'http://activitystrea.ms/schema/1.0/consume',
      display: {
        'en-US': 'consumed'
      }
    }, {
      result: {
        completion: true
      }
    });
    this.trigger(xAPIEvent);
  };

  /**
   * Collapse all expanded panels
   */
  Accordion.prototype.collapseExpandedPanels = function () {
    var self = this;
    if (this.$expandedTitle !== undefined) {
      this.$expandedTitle
        .attr('aria-expanded', false)
        .removeClass('h5p-panel-expanded');
    }
    if (this.$expandedPanel !== undefined) {
      this.$expandedPanel
        .stop(false, true)
        .slideUp(200, function () {
          self.stopWorkLoop(self.resizing);
          self.trigger('resize');
        })
        .attr('aria-hidden', true);
    }
  };

  /**
   * Expand a panel
   *
   * @param {jQuery} $title The title of the panel that is to be expanded
   * @param {jQuery} $panel The panel that is to be expanded
   */
  Accordion.prototype.expandPanel = function($title, $panel) {
    var self = this;

    $title.attr('aria-expanded', true)
      .addClass('h5p-panel-expanded');

    $panel
      .stop(false, true)
      .slideDown(200, function () {
        self.stopWorkLoop(self.resizing);
        self.trigger('resize');
      })
      .attr('aria-hidden', false);

    self.$expandedTitle = $title;
    self.$expandedPanel = $panel;
  };

  /**
   * Collapse a panel
   *
   * @param {jQuery} $title The title of the panel that is to be collapsed
   * @param {jQuery} $panel The panel that is to be collapsed
   */
  Accordion.prototype.collapsePanel = function($title, $panel) {
    var self = this;
    $title.attr('aria-expanded', false)
      .removeClass('h5p-panel-expanded');
    $panel
      .stop(false, true)
      .slideUp(200, function () {
        self.stopWorkLoop(self.resizing);
        self.trigger('resize');
      })
      .attr('aria-hidden', true);
     self.$expandedTitle = self.$expandedPanel = undefined;
  };

  /**
   * Makes sure that the heigt of the iframe gets animated
   */
  Accordion.prototype.animateResize = function () {
    var self = this;
    self.stopWorkLoop(this.resizing);
    this.resizing = self.startWorkLoop(function () {
      self.trigger('resize');
    }, 40);
  };

  Accordion.prototype.startWorkLoop = function (func, wait) {
    var myId = nextLooperId++;
    var self = this;
    allowedLoopers.push(myId);
    var looper = function(func, wait, myId) {
      return function () {
        if (self.allowedToWork(myId)) {
          try {
            func.call(null);
          }
          catch (e) {
            self.stopWorkLoop(myId);
          }
          setTimeout(looper, wait, func, wait, myId);
        }
      };
    } (func, wait, myId);
    setTimeout(looper, wait);
    return myId;
  };

  Accordion.prototype.stopWorkLoop = function (myId) {
    var index;
    while ((index = allowedLoopers.indexOf(myId)) !== -1) {
      allowedLoopers.splice(index, 1);
    }
  };

  Accordion.prototype.allowedToWork = function (myId) {
    return allowedLoopers.indexOf(myId) !== -1;
  };

  return Accordion;
})(H5P.jQuery);
