var H5PPresave = H5PPresave || {};

/**
 * Resolve the presave logic for the content type Arithmetic Quiz
 *
 * @param {object} content
 * @param finished
 * @constructor
 */
H5PPresave['H5P.ArithmeticQuiz'] = function (content, finished) {
  var presave = H5PEditor.Presave;
  var score = 0;

  if (isContentValid()) {
    score = content.maxQuestions;
  }

  presave.validateScore(score);

  finished({maxScore: score});

  /**
   * Check if required parameters is present
   * @return {boolean}
   */
  function isContentValid() {
    return presave.checkNestedRequirements(content, 'content.maxQuestions');
  }
};
