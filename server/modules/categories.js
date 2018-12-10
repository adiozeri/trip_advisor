var express = require('express');
var router = express.Router();
var DButilsAzure = require('../DButils');



router.get('/attractions/:category_ID', function(req, res, next) {
    DButilsAzure.execQuery('select * from Attractions where Category_ID = '+req.params.category_ID).then(
        function (attractions) {
            res.send(attractions);
        }).catch(function (error) {
        console.log(error);
    });
});

module.exports = router;
