var express = require('express');
var router = express.Router();
var DButilsAzure = require('../DButils');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const superSecret = "SUMsumOpen"; // secret variable

// Login
router.post('/authenticate', function (req, res) {
    if (!req.body.username || !req.body.password)
        res.send({message: "bad values"});

    else {
        DButilsAzure.execQuery('select * from clients where UserName = ' + '\'' + req.body.username + '\'' + ' and Password = ' + '\'' + req.body.password + '\'').then(
            function (user) {
                if (Object.keys(user).length > 0)
                    sendToken(user, res);
                else {
                    res.send({success: false, message: 'Authentication failed.no such user'});
                }
            }).catch(function (error) {
            // console.log(error);
            res.send({success: false, message: 'Authentication failed.'});
        });
    }
});

router.post('/signUp', function (req, res) {
    if (signUpDetailsVerification(req, res)) {
        try {
            add('clients', ['\'' + req.body.username + '\'', '\'' + req.body.password + '\'', '\'' + req.body.firstname + '\'', '\'' + req.body.lastname + '\'',
                '\'' + req.body.city + '\'', '\'' + req.body.country + '\'', '\'' + req.body.email + '\'']);

            var questionsAndAnswers = req.body.questionsAndAnswersForRetrive;
            add('userQA', ['\'' + req.body.username + '\'', '\'' + questionsAndAnswers[0].question + '\'', '\'' + questionsAndAnswers[0].answer + '\'']);
            add('userQA', ['\'' + req.body.username + '\'', '\'' + questionsAndAnswers[1].question + '\'', '\'' + questionsAndAnswers[1].answer + '\'']);

            addCategories(req.body.username, req.body.categories);

            res.send({success: true, message: 'User SignUp process ended successfully.'});
        }
        catch (e) {
            deleteQuery('clients', 'username', req.body.username)
            deleteQuery('userQA', 'username', req.body.username);
            deleteQuery('ClientFavoriteCategories', 'username', req.body.usernames)

            res.send({success: false, message: 'sign up failed.'});
        }
    }
});

router.get('/questionsForAccountRetrieval/:userName', function (req, res) {
    DButilsAzure.execQuery('select Question, Answer from userQA where UserName = \'' + req.params.userName + '\'').then(
        function (questions) {
            res.send(questions);
        }).catch(function (error) {
        console.log(error);
    });
});

router.get('/randomTopAttraction', function (req, res) {
    getTopAttractions().then(function (topAttractions) {
        res.send(getThreeRandomTopAttractions(topAttractions));
    }).catch(function (error) {
        res.send({success: false, message: 'GetRandomTopAttraction failed.'});
    });
});

router.get('/categories', function (req, res, next) {
    DButilsAzure.execQuery('select * from Categories').then(
        function (categories) {
            res.send(categories);
        }).catch(function (error) {
        console.log(error);
    });
});

router.get('/password/:userName', function (req, res, next) {
    DButilsAzure.execQuery('select password from clients where UserName = \''
        + req.params.userName + '\'').then(
        function (password) {
            res.send(password);
        }).catch(function (error) {
        console.log(error);
        res.send({success: false, message: 'get password for user failed.'});
    });
});

function add(table_name, params) {
    var query = 'insert into ' + table_name + ' values (';
    for (i = 0; i < params.length - 1; i++) {
        query += params[i] + ',';
    }
    query += params[params.length - 1] + ')';

    DButilsAzure.execQuery(query).then(
        function () {
       console.log("success") }).catch(function (error) {
        throw error;
    });
}
function addCategories(user_name, categories) {
    var query = '';
    for (i = 0; i < categories.length; i++) {
        query +='insert into ClientFavoriteCategories values (\''+user_name+'\','+categories[i].ID+'); ';
    }

    DButilsAzure.execQuery(query).then(
        function () {
            console.log("success") }).catch(function (error) {
        throw error;
    });
}

function deleteQuery(table_name, identity_field, identity_value) {
    var query = 'delete from ' + table_name + ' where ' + identity_field + '=' + identity_value;
    DButilsAzure.execQuery(query).then(
        function () {
        }).catch(function (error) {
        throw error;
    });
}


function signUpDetailsVerification(req, res) {
    if (!req.body.username || !req.body.password || !req.body.firstname || !req.body.lastname ||
        !req.body.city || !req.body.country || !req.body.email || !req.body.questionsAndAnswersForRetrive || !req.body.categories)
        res.send({success: false, message: 'one or more values are missing.'});
    else if (req.body.username.length > 8 || req.body.username.length < 3 || !(/^[a-zA-Z]+$/.test(req.body.username)))
        res.send({success: false, message: 'user name must contain 3 to 8 characters which are letters only.'});
    else if (req.body.password.length > 10 || req.body.password.length < 5 || !(/^\w+$/.test(req.body.password)))
        res.send({
            success: false,
            message: 'password must contain 5 to 10 characters which are letters or numbers only.'
        });
    else {
        return true;
    }
}

function sendToken(user, res) {
    var payload = {
        userName: user.userName,
        admin: user.isAdmin
    };

    var token = jwt.sign(payload, superSecret, {
        expiresIn: "1d" // expires in 24 hours
    });
    // return the information including token as JSON
    res.json({
        success: true,
        message: 'Enjoy your token!',
        token: token
    });
}

function getTopAttractions() {
    //where Attraction_Rank > 3
    return DButilsAzure.execQuery('select * from Attractions ');
}

function getThreeRandomTopAttractions(topAttractions) {
    if (topAttractions.length < 4) {
        return topAttractions;
    }
    let randomTopAttractions = [];
    randomTopAttractions[0] = topAttractions[Math.floor(Math.random() * topAttractions.length)];
    randomTopAttractions[1] = topAttractions[Math.floor(Math.random() * topAttractions.length)];

    while (randomTopAttractions[0] === randomTopAttractions[1]) {
        randomTopAttractions[1] = topAttractions[Math.floor(Math.random() * topAttractions.length)];
    }

    randomTopAttractions[2] = topAttractions[Math.floor(Math.random() * topAttractions.length)];

    while (randomTopAttractions[2] === randomTopAttractions[0] || randomTopAttractions[2] === randomTopAttractions[1]) {
        randomTopAttractions[2] = topAttractions[Math.floor(Math.random() * topAttractions.length)];
    }
    return randomTopAttractions;
}

module.exports = router;
