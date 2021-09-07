/**
 * Defines the H5P.ArithmeticQuiz.ArithmeticGenerator class
 */
H5P.ArithmeticQuiz.ArithmeticGenerator = (function (ArithmeticType) {

  // Helper functions for creating wrong alternatives
  function add (question, param) {
    return question.correct + param;
  }
  function subtract (question, param) {
    return question.correct - param;
  }
  function randomInt (question) {
    // Creates random number between correct-10 and correct+10:
    return (question.correct - 10) + Math.floor(Math.random() * 20);
  }
  function multiply (question, param) {
    if (Math.random() > 0.5) {
      return (question.x+param) * question.y;
    }
    else {
      return (question.y+param) * question.x;
    }
  }
  function divide (question, param) {
    if (Math.random() > 0.5) {
      return Math.floor((question.x + param) / question.y);
    }
    else {
      return Math.floor(question.x / (question.y + param));
    }
  }

  /**
   * The alternative generator setup for the different arithmetic types
   * @type {Object}
   */
  var alternativesSetup = {};
  alternativesSetup[ArithmeticType.SUBTRACTION] = alternativesSetup[ArithmeticType.ADDITION] = [
    { weight: 0.15, type: add, param: 10 },
    { weight: 0.15, type: subtract, param: 10 },
    { weight: 0.15, type: add, param: 1 },
    { weight: 0.15, type: subtract, param: 1 },
    { weight: 0.15, type: add, param: 2 },
    { weight: 0.15, type: subtract, param: 2 },
    { weight: 0.10, type: randomInt }
  ];
  alternativesSetup[ArithmeticType.MULTIPLICATION] = [
    { weight: 0.15, type: add, param: 10 },
    { weight: 0.15, type: subtract, param: 10 },
    { weight: 0.15, type: add, param: 1 },
    { weight: 0.15, type: subtract, param: 1 },
    { weight: 0.15, type: multiply, param: 1 },
    { weight: 0.15, type: multiply, param: -1 },
    { weight: 0.10, type: randomInt }
  ];
  alternativesSetup[ArithmeticType.DIVISION] = [
    { weight: 0.15, type: add, param: 10 },
    { weight: 0.15, type: subtract, param: 10 },
    { weight: 0.15, type: add, param: 1 },
    { weight: 0.15, type: subtract, param: 1 },
    { weight: 0.15, type: divide, param: 1 },
    { weight: 0.15, type: divide, param: -1 },
    { weight: 0.10, type: randomInt }
  ];

  /**
   * Utility function that picks a alternative setup based on the weight
   * @method getRandomWeightedAlternativeSetup
   * @param  {H5P.ArithmeticQuiz.ArithmeticType} type
   * @return {Object}
   */
  function getRandomWeightedAlternativeSetup (type) {
    var setups = alternativesSetup[type];

    var i;
    var sum = 0;
    var r = Math.random();
    for (i in setups) {
      sum += setups[i].weight;
      if (r <= sum) {
        return setups[i];
      }
    }

    return setups[0];
  }

  /**
   * Arithmetic Questions generator classes
   * @method ArithmeticGenerator
   * @constructor
   * @param  {H5P.ArithmeticQuiz.ArithmeticType}   type
   * @param  {number}           maxQuestions
   */
  function ArithmeticGenerator(type, maxQuestions) {
    var self = this;
    var questions = [];
    var i, j;

    /**
     * Generates alternative for a question
     * @method generateAlternatives
     * @param  {Object}             question
     */
    function generateAlternatives(question) {
      question.alternatives = [];

      // Generate 5 wrong ones:
      while (question.alternatives.length !== 5) {
        var setup = getRandomWeightedAlternativeSetup(type);
        var alternative = setup.type(question, setup.param);
        // check if alternative is present allready and is not the correct one and is not negative number
        if (alternative !== question.correct && question.alternatives.indexOf(alternative) === -1 && alternative >= 0 && alternative <= 100) {
          question.alternatives.push(alternative);
        }
      }

      // Add correct one
      question.alternatives.push(question.correct);

      // Shuffle alternatives:
      question.alternatives = H5P.shuffleArray(question.alternatives);
    }

    /**
     * Creates textual representation for question
     * @method createTextualQuestion
     * @param  {Object}              question Question Object
     * @return {string}
     */
    function createTextualQuestion(question) {
      switch (type) {
        case ArithmeticType.ADDITION:
          return question.x + " + " + question.y;
        case ArithmeticType.SUBTRACTION:
          return question.x + " − " + question.y;
        case ArithmeticType.MULTIPLICATION:
          return question.x + " × " + question.y;
        case ArithmeticType.DIVISION:
          return question.x + " ÷ " + question.y;
        default:
          return '';
      }
    }

    // Generate questions
    switch (type) {
      case ArithmeticType.DIVISION:
      case ArithmeticType.MULTIPLICATION:
        for (i=1; i<10; i++) {
          for (j=1; j<10; j++) {
            questions.push({
              x:  type === ArithmeticType.DIVISION ? i * j : i,
              y: j,
              correct: type === ArithmeticType.DIVISION ? (i * j) / j : i * j
            });
          }
        }
        break;
      case ArithmeticType.ADDITION:
      case ArithmeticType.SUBTRACTION:
        for (i=100; i>=0; i--) {
          for (j=i; j>=0; j--) {
            questions.push({
              x: type === ArithmeticType.ADDITION ? i - j : i,
              y: j,
              correct: type === ArithmeticType.ADDITION ? i : i - j
            });
          }
        }
        break;
    }
    // Let's shuffle
    questions = H5P.shuffleArray(questions);

    if (questions.length > maxQuestions) {
      questions = questions.slice(0, maxQuestions);
    }

    // Create alternatives
    for (i = 0; i < questions.length; i++) {
      generateAlternatives(questions[i]);
      questions[i].textual = createTextualQuestion(questions[i]);
    }

    /**
     * Returns the questions including alternatives and textual representation
     * @public
     * @return {array}
     */
    self.get = function () {
      return questions;
    };
    
  }

  ArithmeticGenerator.prototype.readableQuestion = function (translations, readableSigns, question) {
    return translations.humanizedQuestion
      .replace(':arithmetic', readableSigns);
  };

  ArithmeticGenerator.prototype.readableText = function (question) {
    return question.textual + ' = ?';    
  };
    
  return ArithmeticGenerator;
}(H5P.ArithmeticQuiz.ArithmeticType));
