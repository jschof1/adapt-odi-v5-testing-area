

import QuestionModel from 'core/js/models/questionModel';
// import { max } from 'underscore';

export default class fileInputModel extends QuestionModel {
    // _setScore out of  100
    _setScore(score) {
        // get max score from views
    this.get('_maxScore') = 100
        // set score to max score if score is greater than max score
        if (score > maxScore) {
            score = maxScore;
        }
        // set score to 0 if score is less than 0
        if (score < 0) {
            score = 0;
        }
        console.log('score: ' + score);
        this.set('_score', score);
    }
// get score from view
    getScore() {
        return this.get('_score');
    }

    _setScore()
}