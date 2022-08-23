var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.QuestionSet'] = (function ($) {
  return {
    1: {
      3: function (parameters, finished) {
        for (var i = 0; i < parameters.questions.length; i++) {
          if (parameters.questions[i].subContentId === undefined) {
            // NOTE: We avoid using H5P.createUUID since this is an upgrade script and H5P function may change in the
            // future
            parameters.questions[i].subContentId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(char) {
              var random = Math.random()*16|0, newChar = char === 'x' ? random : (random&0x3|0x8);
              return newChar.toString(16);
            });
          }
        }
        finished(null, parameters);
      },

      /**
       * Asynchronous content upgrade hook.
       * Upgrades content parameters to support IV 1.7.
       *
       * Groups all UI text strings to make them eaiser to translate and handle.
       *
       * @params {Object} parameters
       * @params {function} finished
       */
      8: function (parameters, finished) {

        if (parameters.override) {
          if (parameters.override.overrideButtons) {
            // Set new variables
            parameters.override.showSolutionButton =
                (parameters.override.overrideShowSolutionButton ? 'on' : 'off');
            parameters.override.retryButton =
                (parameters.override.overrideRetry ? 'on' : 'off');
          }

          // Remove old field variables
          delete parameters.override.overrideButtons;
          delete parameters.override.overrideShowSolutionButton;
          delete parameters.override.overrideRetry;
        }

        // Move copyright dialog question label
        if (parameters.questionLabel) {
          parameters.texts = parameters.texts || {};
          parameters.texts.questionLabel = parameters.questionLabel;
        }

        // Remove old copyright dialog question label
        delete parameters.questionLabel;

        finished(null, parameters);
      },

      /**
       * Asynchronous content upgrade hook.
       *
       * Upgrade params to support overall feedback
       *
       * @param  {Object} parameters
       * @param  {function} finished
       */
      13: function (parameters, finished) {

        parameters.endGame = parameters.endGame || {};
        parameters.endGame.overallFeedback = [];

        if (parameters.endGame.scoreString) {
          parameters.endGame.overallFeedback.push({
            from: 0,
            to: 100,
            feedback: parameters.endGame.scoreString
          });

          delete parameters.endGame.scoreString;
        }

        // Group old feedback fields
        if (parameters.endGame.successGreeting ||
            parameters.endGame.successComment ||
            parameters.endGame.failGreeting ||
            parameters.endGame.failComment) {
          parameters.endGame.oldFeedback = {};
          if (parameters.endGame.successGreeting) {
            parameters.endGame.oldFeedback.successGreeting = parameters.endGame.successGreeting;
          }
          if (parameters.endGame.successComment) {
            parameters.endGame.oldFeedback.successComment = parameters.endGame.successComment;
          }
          if (parameters.endGame.failGreeting) {
            parameters.endGame.oldFeedback.failGreeting = parameters.endGame.failGreeting;
          }
          if (parameters.endGame.failComment) {
            parameters.endGame.oldFeedback.failComment = parameters.endGame.failComment;
          }
        }

        finished(null, parameters);
      }
    }
  };
})(H5P.jQuery);
