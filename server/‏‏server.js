//this is only an example, handling everything is yours responsibilty !

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

var  superSecret = "SUMsumOpen"; // secret variable

//complete your code here

var indexRouter = require('./modules/index');
var usersRouter = require('./modules/users');
var categoriesRouter = require('./modules/categories');
var attractionsRouter = require('./modules/attractions');



// route middleware to verify a token
app.use('/reg', function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    //decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, superSecret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                // get the decoded payload and header
                var decoded = jwt.decode(token, {complete: true});
                req.decoded= decoded;
                console.log(decoded.header);
                console.log(decoded.payload);
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});


app.use('/', indexRouter);
app.use('/reg/users', usersRouter);
app.use('/reg/categories', categoriesRouter);
app.use('/reg/attractions', attractionsRouter);

var port = 3000;
app.listen(port, function () {
    console.log('app listening on port ' + port);
});
//-------------------------------------------------------------------------------------------------------------------


