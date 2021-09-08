/**
 * Defines the H5P.ArithmeticQuiz.CountdownWidget class
 */
H5P.ArithmeticQuiz.CountdownWidget = (function ($) {

  /**
   * A count down widget
   *
   * @class
   * @augments H5P.EventDispatcher
   * @namespace H5P.ArithmeticQuiz
   * @fires H5P.Event
   *
   * @param {number} seconds Number of seconds to count down
   * @param {Object} t Translations
   */
  function CountdownWidget(seconds, t) {
    H5P.EventDispatcher.call(this);
    var originalSeconds = seconds;

    this.$countdownWidget = $('<div>', {
      'class': 'h5p-baq-countdown',
      'aria-hidden': true
    }).append($('<div>', {
      'class': 'h5p-baq-countdown-inner',
    }).append($('<span>', {
      'class': 'h5p-baq-countdown-text',
      text: seconds,
      'aria-live': 'polite'
    }), $('<span>', {
      'class': 'h5p-baq-countdown-bg'
    })));

    this.$countdownText = this.$countdownWidget.find('.h5p-baq-countdown-text');

    /**
     * Returns reference to DOM object
     *
     * @return {H5P.jQuery}
     */
    this.create = function () {
      return this.$countdownWidget;
    };


    /**
     * Start countdown
     */
    this.start = function () {
      var self = this;
      this.$countdownWidget.attr('aria-hidden', false);

      if (!self.$countdownWidget.find('.h5p-baq-countdown-bg').hasClass('fuel')) {
        setTimeout(function(){
          self.$countdownWidget.find('.h5p-baq-countdown-bg').addClass('fuel');
        },1);
      }

      if (seconds <= 0) {
        self.$countdownWidget.attr('aria-hidden', true);
        self.trigger('ignition');
        return;
      }

      self.decrement();

      setTimeout(function(){
        self.start();
      }, 1000);
    };


    /**
     * Restart the countdown
     */
    this.restart = function () {
      var self = this;
      seconds = originalSeconds+1;
      self.decrement();
      self.$countdownWidget.find('.h5p-baq-countdown-bg').removeClass('fuel');
      setTimeout(function () {
        self.start();
      }, 600);
    };


    /**
     * Decrement counter
     */
    this.decrement = function () {
      seconds--;
      this.$countdownText.html(seconds === 0 ? t.go : seconds);
    };
  }
  CountdownWidget.prototype = Object.create(H5P.EventDispatcher.prototype);
  CountdownWidget.prototype.constructor = CountdownWidget;

  return CountdownWidget;

})(H5P.jQuery);
