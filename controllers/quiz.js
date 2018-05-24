const Sequelize = require("sequelize");
const {models} = require("../models");

// Autoload the quiz with id equals to :quizId
exports.load = (req, res, next, quizId) => {

    models.quizzes.findById(quizId)
    .then(quiz => {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error('There is no quiz with id=' + quizId);
        }
    })
    .catch(error => next(error));
};


// GET /quizzes
exports.index = (req, res, next) => {

    models.quizzes.findAll()
    .then(quizzes => {
        res.render('quizzes/index.ejs', {quizzes});
    })
    .catch(error => next(error));
};


// GET /quizzes/:quizId
exports.show = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/show', {quiz});
};


// GET /quizzes/new
exports.new = (req, res, next) => {

    const quiz = {
        question: "", 
        answer: ""
    };

    res.render('quizzes/new', {quiz});
};

// POST /quizzes/create
exports.create = (req, res, next) => {

    const {question, answer} = req.body;

    const quiz = models.quizzes.build({
        question,
        answer
    });

    // Saves only the fields question and answer into the DDBB
    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz created successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/new', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error creating a new Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
exports.edit = (req, res, next) => {

    const {quiz} = req;

    res.render('quizzes/edit', {quiz});
};


// PUT /quizzes/:quizId
exports.update = (req, res, next) => {

    const {quiz, body} = req;

    quiz.question = body.question;
    quiz.answer = body.answer;

    quiz.save({fields: ["question", "answer"]})
    .then(quiz => {
        req.flash('success', 'Quiz edited successfully.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, error => {
        req.flash('error', 'There are errors in the form:');
        error.errors.forEach(({message}) => req.flash('error', message));
        res.render('quizzes/edit', {quiz});
    })
    .catch(error => {
        req.flash('error', 'Error editing the Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = (req, res, next) => {

    req.quiz.destroy()
    .then(() => {
        req.flash('success', 'Quiz deleted successfully.');
        res.redirect('/quizzes');
    })
    .catch(error => {
        req.flash('error', 'Error deleting the Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || '';

    res.render('quizzes/play', {
        quiz,
        answer
    });
};


// GET /quizzes/:quizId/check
exports.check = (req, res, next) => {

    const {quiz, query} = req;

    const answer = query.answer || "";
    const result = answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz,
        result,
        answer
    })
};

// GET /quizzes/randomplay
exports.randomplay = (req, res, next) => {
    quizzes = ""
    
    models.quizzes.findAll().then(resp => {
        req.session.total = resp.length
        var score = 0
        var aux = []

        if (req.session.arrayIdContestadas == undefined) {
            req.session.arrayIdContestadas = []
            var i;
            for (i = 0; i<resp.length; i++){
                    aux.push(resp[i])
            }
        } else {
            for (i = 0; i<resp.length; i++){
                    aux.push(resp[i])
            }
                score = req.session.arrayIdContestadas.length
           
        }
        
        
        if (resp) {
            // creo un array de ids
            var ids = []
            var y
            for (y = 0; y<resp.length; y++) {
                ids.push(resp[y].id)
            }
            
            if (req.session.arrayIdContestadas.length > 0) {
                aux = resp
            }
            var i
            for (j = 0; j<aux.length; j++) {
                var i
                for (i=0; i<req.session.arrayIdContestadas.length; i++){
                    if(aux[j].id == req.session.arrayIdContestadas[i]) {
                        aux.splice(j,1)
                    }            
                }
            }
            for (i = 0; i<aux.length; i++){
                console.log("\n")
                console.log("IDs GUARDADOS", aux[i].id)
            
            }
            let rand = parseInt(Math.random() * aux.length)
            var quiz =  aux[rand]
            
            score = req.session.arrayIdContestadas.length
            res.render('random_play',{
                score,
                quiz
            });
        } else {
            throw new Error('There is no quizzes in the database');
        }
    })
};

// GET /quizzes/randomcheck/:quizId?answer=respuesta
exports.randomcheck = (req, res, next) => {
    
    var quiz = models.quizzes.find
    var quizId = req.params.quizId
    var answer = req.query.answer

    models.quizzes.findById(quizId)
    .then(quiz => {
        score = req.session.arrayIdContestadas.length
        let result = true
        if (quiz.answer == answer) {

            req.session.arrayIdContestadas.push(quiz.id)
            score = req.session.arrayIdContestadas.length
            if (score == req.session.total) {
                
                req.session.arrayIdContestadas = []
                res.render('random_nomore',{
                    score
                })
            } else {
                res.render('random_result', {
                    score,
                    answer,
                    result
                })
            }
        } else {
            req.session.arrayIdContestadas = []
            result = false
            res.render('random_result',{
               score,
               answer,
               result
            })
        }
    })
    .catch(error => next(error));
}

