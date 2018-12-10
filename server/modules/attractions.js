var express = require('express');
var router = express.Router();
var DButilsAzure = require('../DButils');


router.get('/attraction/:attraction_ID', function (req, res, next) {
    DButilsAzure.execQuery('select * from attractions where [ID] = ' + req.params.attraction_ID ).then(
        function (attraction) {
            res.send(attraction);
        }).catch(function (error) {
        console.log(error);
        res.send({success: false, message: 'no such attraction.'});
    });
});

router.post('/increaseNumberOfViewers/:attraction_ID', function(req, res, next) {
    increaseViewersCount(req.params.attraction_ID).then(
        function () {
            res.send({success: true, message: 'update Number Of Viewers success.'});
        }).catch(function (error) {
        console.log(error);
        res.send({success: false, message: 'update Number Of Viewers failed.'});
    });
});

router.get('/getAllAttractions', function (req, res, next) {
    DButilsAzure.execQuery('select * from attractions ').then(
        function (attractions) {
            res.send(attractions);
        }).catch(function (error) {
        console.log(error);
        res.send({success: false, message: 'get all attractions.'});
    });
});

router.post('/updateReview/:attraction_ID', function(req, res, next) {
    updateReview(req.params.attraction_ID,req.body.reviews).then(
        function () {
            res.send({success: true, message: 'update Reviews success.'});
        }).catch(function (error) {
        console.log(error);
        res.send({success: false, message: 'update Reviews failed.'});
    });
});

router.post('/updateRank/:attraction_ID', function(req, res, next) {
    updateRank(req.params.attraction_ID,req.body.rank,req.body.rankersCount).then(
        function () {
            res.send({success: true, message: 'update Rank success.'});
        }).catch(function (error) {
        console.log(error);
        res.send({success: false, message: 'update Rank failed.'});
    });
});

function updateRank(attraction_ID,rank,rankersCount) {
    return DButilsAzure.execQuery(
        'UPDATE [dbo].[Attractions]\n' +
        'SET [Attraction_Rank] = '+rank+', [RankersCount] = '+ rankersCount +
        ' WHERE [ID] = ' + attraction_ID
    );
}

function updateReview(attraction_ID,reviews) {
    return DButilsAzure.execQuery(
        'UPDATE [dbo].[Attractions]\n' +
        'SET [Reviews] = \''+JSON.stringify(reviews) +
        '\' WHERE [ID] = ' + attraction_ID
    );
}

function increaseViewersCount(attraction_ID){
    return DButilsAzure.execQuery(
        'DECLARE @IncrementValue int\n' +
        'SET @IncrementValue = 1\n' +
        'UPDATE [dbo].[Attractions] SET [ViewersCount] = [ViewersCount] + @IncrementValue\n' +
        'WHERE [ID] = '+attraction_ID);
}



module.exports = router;
