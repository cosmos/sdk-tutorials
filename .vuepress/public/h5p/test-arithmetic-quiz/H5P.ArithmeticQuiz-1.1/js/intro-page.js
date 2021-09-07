H5P.ArithmeticQuiz.IntroPage = (function ($, UI) {
  /**
   * Creates an IntroPage instance
   *
   * @class
   * @namespace H5P.ArithmeticQuiz
   * @augments H5P.EventDispatcher
   *
   * @param  {string} text Introduction text
   * @param  {Object} t Translation object
   * @fires H5P.Event
   */
  function IntroPage(text, t) {
    H5P.EventDispatcher.call(this);
    var self = this;

    this.$introPage = $('<div>', {
      'class': 'h5p-baq-intro-page'
    });

    var $innerWrapper = $('<div>', {
      'class': 'h5p-baq-intro-page-inner'
    });

    $innerWrapper.append($('<div>', {
      'class': 'h5p-baq-intro-page-title'
    }).append($('<span>', {
      html: text
    })));

    // Create and add the start button:
    UI.createButton({
      text: t.startButton,
      'class': 'mq-control-button',
      click: function () {
        self.trigger('start-game');
      }
    }).appendTo($innerWrapper);

    $innerWrapper.appendTo(this.$introPage);

    /**
     * Append Intropage to a container
     *
     * @param  {H5P.jQuery} $container
     */
    self.appendTo = function ($container) {
      this.$introPage.appendTo($container);
    };


    /**
     * Remove me from DOM
     */
    self.remove = function () {
      this.$introPage.remove();
    };
  }

  IntroPage.prototype = Object.create(H5P.EventDispatcher.prototype);
  IntroPage.prototype.constructor = IntroPage;

  return IntroPage;

})(H5P.jQuery, H5P.JoubelUI);
