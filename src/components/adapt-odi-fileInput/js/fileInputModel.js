

import QuestionModel from 'core/js/models/questionModel';

export default class fileInputModel extends QuestionModel {
    // _setScore out of  100
    _setScore(score) {
        this.set('_score', score);
    }
// get score from view
    getScore() {
        return this.get('_score');
    }
    
}