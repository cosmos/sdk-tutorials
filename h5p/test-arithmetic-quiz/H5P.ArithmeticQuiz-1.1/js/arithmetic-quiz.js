var H5P = H5P || {};

/**
 * Defines the H5P.ArithmeticQuiz class
 */
H5P.ArithmeticQuiz = (function ($) {

  /**
   * Creates a new ArithmeticQuiz instance
   *
   * @class
   * @augments H5P.EventDispatcher
   * @namespace H5P
   * @param {Object} options
   * @param {number} id
   */
  function ArithmeticQuiz(options, id) {
    // Add viewport meta to iframe
    $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">');

    var self = this;
    // Extend defaults with provided options
    self.options = $.extend(true, {}, {
      intro: '',
      quizType: 'arithmetic',
      arithmeticType: 'addition',
      equationType: undefined,
      useFractions: undefined,
      maxQuestions: undefined,
      UI: {
        score: 'Score @score',
        scoreInPercent: '(@percent% correct)',
        time: 'Time: @time',
        resultPageHeader: 'Finished!',
        retryButton: 'Retry',
        startButton: 'Start',
        go: 'GO!',
        correctText: 'Correct',
        incorrectText: 'Incorrect. Correct answer was :num',
        durationLabel: 'Duration in hours, minutes and seconds.',
        humanizedQuestion: 'What does :arithmetic equal?',
        humanizedEquation: 'For the equation :equation, what does :item equal?',
        humanizedVariable: 'What does :item equal?',
        plusOperator: 'plus',
        minusOperator: 'minus',
        multiplicationOperator: 'times',
        divisionOperator: 'divided by',
        equalitySign: 'equal',
        slideOfTotal: 'Slide :num of :total'
      }
    }, options);
    self.currentWidth = 0;

    self.gamePage = new H5P.ArithmeticQuiz.GamePage(self.options.quizType, self.options, id);
    
    self.gamePage.on('last-slide', function (e) {
      self.triggerXAPIScored(e.data.score, e.data.numQuestions, 'answered');
    });

    self.gamePage.on('started-quiz', function () {
      self.setActivityStarted();
    });

    self.gamePage.on('alternative-chosen', function () {
      self.triggerXAPI('interacted');
    });

    self.introPage = new H5P.ArithmeticQuiz.IntroPage(self.options.intro, self.options.UI);
    self.introPage.on('start-game', function() {
      self.introPage.remove();
      self.gamePage.startCountdown();
    });

    self.on('resize', function () {
      // Set size based on gamePage
      var height = self.gamePage.getMaxHeight() + 'px';
      this.$container.css({height: height});
      // Need to set height in pixels because of FF-bug
      $('.h5p-baq-countdown').css({height: height});
      $('.h5p-baq-result-page').css({height: height});
    });


    /**
     * Attach function called by H5P framework to insert H5P content into page
     *
     * @param {H5P.jQuery} $container
     */
    self.attach = function ($container) {
      if (self.isRoot()) {
        self.setActivityStarted();
      }

      if (this.$container === undefined) {
        this.$container = $container;
        this.addFont();
        this.$container.addClass('h5p-baq');
        this.introPage.appendTo($container);

        // Set gamePage xAPI parameters and append it.
        self.gamePage.contentId = id;
        self.gamePage.libraryInfo = self.libraryInfo;
        self.gamePage.appendTo(self.$container);

        self.trigger('resize');

        setTimeout(function () {
          H5P.ArithmeticQuiz.SoundEffects.setup(self.getLibraryFilePath(''));
        }, 1);
      }
    };

    /**
     * Adds fonts from google
     */
    self.addFont = function () {
      window.WebFontConfig = {
        google: { families: [ 'Lato::latin' ] }
      };

      var wf = document.createElement('script');
      wf.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
    };
  }

  /**
   * Replaces placeholders in translatables texts
   *
   * @static
   * @param  {String} text description
   * @param  {Object} vars description
   * @return {String}      description
   */
  ArithmeticQuiz.tReplace = function (text, vars) {
    for (var placeholder in vars) {
      text = text.replace('@'+placeholder, vars[placeholder]);
    }
    return text;
  };

  return ArithmeticQuiz;
})(H5P.jQuery);

/**
 * Enum defining the different arithmetic types
 * @readonly
 * @enum {string}
 */
H5P.ArithmeticQuiz.ArithmeticType = {
  ADDITION: 'addition',
  SUBTRACTION: 'subtraction',
  MULTIPLICATION: 'multiplication',
  DIVISION: 'division'
};

/**
 * Enum defining the different equation types
 * @readonly
 * @enum {string}
 */
H5P.ArithmeticQuiz.EquationType = {
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

/**
 * Enum defining the different quiz types
 * @readonly
 * @enum {string}
 */
H5P.ArithmeticQuiz.QuizType = {
  ARITHMETIC: 'arithmetic',
  LINEAREQUATION: 'linearEquation'
};