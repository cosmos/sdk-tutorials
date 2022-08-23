var H5PPresave = H5PPresave || {};

/**
 * Resolve the presave logic for the content type Multi Choice
 *
 * @param {object} content
 * @param finished
 * @constructor
 */
H5PPresave['H5P.MultiChoice'] = function (content, finished) {
  var presave = H5PEditor.Presave;
  var score = 0;
  var correctAnswers = 0;

  if (isContentInvalid()) {
    throw new presave.exceptions.InvalidContentSemanticsException('Invalid Multi Choice Error');
  }

  if (isSinglePoint()) {
    score = 1;
  }
  else {
    correctAnswers = content.answers.filter(function (answer) {
      return answer.correct === true;
    });
    score = Math.max(correctAnswers.length, 1);
  }

  presave.validateScore(score);

  finished({maxScore: score});

  /**
   * Check if required parameters is present
   * @return {boolean}
   */
  function isContentInvalid() {
    return !presave.checkNestedRequirements(content, 'content.answers') || !Array.isArray(content.answers);
  }

  /**
   * Check if content gives one point for all
   * @return {boolean}
   */
  function isSinglePoint() {
    return (presave.checkNestedRequirements(content, 'content.behaviour.singlePoint') && content.behaviour.singlePoint === true) ||
      (presave.checkNestedRequirements(content, 'content.behaviour.type') && content.behaviour.type === 'single');
  }
};
