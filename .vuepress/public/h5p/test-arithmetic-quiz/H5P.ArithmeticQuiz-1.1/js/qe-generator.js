/**
 * Defines the H5P.ArithmeticQuiz.EquationsGenerator class
 */
H5P.ArithmeticQuiz.EquationsGenerator = (function (EquationType) {
  var unknown = ["x", "y", "z", "a", "b"];
  var Fraction = algebra.Fraction;
  var Expression = algebra.Expression;
  var Equation = algebra.Equation;

  // Helper functions for creating wrong alternatives
  function add (question, param) {
    return question.correct + param;
  }
  function subtract (question, param) {
    return question.correct - param;
  }

  function randomNum (min, max) {
    min = min || 1;
    max = max || 7;

    // Creates random number between min and max:
    var num = Math.floor(Math.random()*(max-min+1)+min);
    if (num === 0) {
      num = randomNum(min, max);
    }
    return num;
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

  //
  /**
   * Do a random operation on equation expression
   * @method randomOperation
   * @param  {operations}  array of operations to choose from randomly
   * @param  {expr}  algebra.js expression
   * @param  {useFractions}  use fractions as number
   */
  function randomOperation(operations, expr, useFractions) {
    // get a random operation
    var operation = operations[Math.floor(Math.random() * operations.length)];
    var number = randomNum(1, 7);
    switch (operation) {
      case "/":
        if (number > 0) {
          expr = expr.divide(number);
        }
        break;
      case "*":
        expr = expr.multiply(number);
        break;
      case "+":
        if (useFractions === true) {
          number = new Fraction(randomNum(1, 7), randomNum(3, 7));
        }
        expr = expr.add(number);
        break;
      case "-":
        if (useFractions === true) {
          number = new Fraction(randomNum(1, 7), randomNum(3, 7));
        }
        expr = expr.subtract(number);
        break;
    }
    return expr;
  }

  /**
   * Generates equation type for a question
   * @method generateEquation
   * @param  {item}  variable name of expression
   * @param  {expr}  algebra.js expression
   * @param  {equationType}  type of equation (basic, intermediate, advanced)
   * @param  {useFractions}  use fractions as number
   */
  function generateEquation(item, type, equationType, useFractions) {
    var equation = undefined;
    var solution = undefined;
    var number1 = undefined;
    var operations = undefined;

    number1 = randomNum();

    if (useFractions === true) {
      number1 = new Fraction(randomNum(), randomNum(3, 7));
    }

    var expression1 = new Expression(item);
    var expression2 = new Expression(item);

    switch (equationType) {
      case EquationType.BASIC:
        // [ 3x = 12 ]
        expression1 = expression1.multiply(randomNum(2, 4));
        equation = new Equation(expression1, number1);
        break;
      case EquationType.INTERMEDIATE:
        // [ 4x - 3 = 13 ]
        operations = ["+", "-"];
        expression1 = randomOperation(operations, expression1, useFractions);
        expression1 = expression1.multiply(randomNum(2, 3));
        equation = new Equation(expression1, number1);
        break;
      case EquationType.ADVANCED:
        // [ 5x + 3 = 3x + 15 ]
        operations = ["+", "-"];
        // expression1 = expression1.multiply(item); // Quadratic equations ..
        expression1 = randomOperation(operations, expression1, useFractions);
        expression2 = randomOperation(operations, expression2, useFractions);
        expression1 = expression1.multiply(randomNum(2, 3));
        expression2 = expression2.multiply(randomNum(2, 3));
        expression1 = expression1.simplify();
        expression2 = expression2.simplify();
        equation = new Equation(expression1, expression2);
        break;
    }
    try {
      solution = equation.solveFor(item);
    } catch(err) {
      equation = generateEquation(item, type, equationType, useFractions);
      solution = equation.solveFor(item);
    }
    if ( (solution.toString() === "0") || (solution.toString() === "1") || solution.toString().length > 4) {
      // Rebuild
      equation = generateEquation(item, type, equationType, useFractions);
    }

    return equation;
  }

  /**
   * Equation Questions generator classes
   * @method EquationsGenerator
   * @constructor
   * @param  {H5P.ArithmeticQuiz.ArithmeticType}   type
   * @param  {H5P.ArithmeticQuiz.EquationType}   equationType
   * @param  {number}           maxQuestions
   * @param  {boolean}          use fractions in equations
   */
  function EquationsGenerator(type, equationType, maxQuestions, useFractions) {
    var self = this;
    var questions = [];
    var i, j;

    /**
     * Generates alternative for a question
     * @method generateAlternatives
     * @param  {Object}             question
     * @param  {H5P.ArithmeticQuiz.EquationType}   equation type
     * @param  {boolean}          use fractions in equations
     */
    function generateAlternatives(question, equationType, useFractions) {
      question.alternatives = [];
      var equation = undefined;
      // Generate 5 wrong ones:
      while (question.alternatives.length !== 5) {
        equation = generateEquation(question.variable, question.type, equationType, useFractions);
        var solution = equation.solveFor(question.variable).toString();

        // check if alternative is present already and is not the correct one
        if (solution !== question.correct && question.alternatives.indexOf(solution) === -1) {
          question.alternatives.push(solution);
        }
      }

      // Add correct one
      question.alternatives.push(question.correct);

      // Shuffle alternatives:
      question.alternatives = H5P.shuffleArray(question.alternatives);
    }

    // Generate equations
    for (i=50; i>=0; i--) {
      for (j=i; j>=0; j--) {
        var item = unknown[Math.floor(Math.random()*unknown.length)];
        var equation = generateEquation(item, type, equationType, useFractions);
        var solution = equation.solveFor(item);
        questions.push({
          variable: item,
          expression: equation.toString(),
          correct: solution.toString(),
          textual: equation.toString(),
        });
      }
    }

    // Let's shuffle
    questions = H5P.shuffleArray(questions);

    if (questions.length > maxQuestions) {
      questions = questions.slice(0, maxQuestions);
    }

    // Create alternatives
    for (i = 0; i < questions.length; i++) {
      generateAlternatives(questions[i], equationType, useFractions);
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

  EquationsGenerator.prototype.readableQuestion = function (translations, readableSigns, question) {
    return translations.humanizedEquation
      .replace(':equation', readableSigns)
      .replace(':item', question.variable);
  };

  EquationsGenerator.prototype.readableText = function (question) {
    return question.textual;
  };

  return EquationsGenerator;
}(H5P.ArithmeticQuiz.EquationType));
