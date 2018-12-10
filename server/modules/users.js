var express = require('express');
var router = express.Router();
var DButilsAzure = require('../DButils');

router.get('/', function (req, res, next) {
    DButilsAzure.execQuery('select * from clients').then(
        function (user) {
            res.send(user);
        }).catch(function (error) {
        console.log(error);
        res.send({success: false, message: 'get all users failed.'});
    });
});


router.get('/savedAttractions/:userName', function (req, res, next) {
    DButilsAzure.execQuery('select * from attractions left join clientsavedattractions on ' +
        'attractions.ID = clientsavedattractions.Attraction_ID where clientsavedattractions.UserName = \''
        + req.params.userName + '\'').then(
        function (attractions) {
            res.send(attractions);
        }).catch(function (error) {
        console.log(error);
        res.send({success: false, message: 'get saved attraction for user failed.'});
    });
});

router.get('/recommendAttractions/:userName', function (req, res, next) {

    let randomCategories = [];
    let maxRankAttractions = [];

    getUserFavoriteCategoriesID(req.params.userName).then(function (userFavoriteCategories) {
        randomCategories = getTwoRandomFavoriteCategories(userFavoriteCategories);
    }).then(function () {
        return getMaxRankAttractionFromCategory(randomCategories[0]);
    }).then(function (maxRankAttraction) {
        maxRankAttractions[0] = maxRankAttraction[0];
        return getMaxRankAttractionFromCategory(randomCategories[1]);
    }).then(function (maxRankAttraction) {
        console.log(maxRankAttraction);
        maxRankAttractions[1] = maxRankAttraction[0];
        res.send(maxRankAttractions);
    }).catch(function (error) {
        res.send({success: false, message: 'GetUserRecommendAttractions failed.'});
    });
});

router.post('/saveAttractionsToDB/:userName', function (req, res, next) {
    deleteUserSavedAttractions(req.params.userName).then(function (){
        return insertUserSavedAttractions(req.body);
    }).then(function () {
        res.send({success: true, message: 'SaveAttractionsToDB success.'});
    }).catch(function (error) {
        res.send({success: false, message: 'SaveAttractionsToDB failed.'});
    })
});

function deleteUserSavedAttractions(userName) {
    return DButilsAzure.execQuery('DELETE FROM ClientSavedAttractions WHERE UserName =\'' + userName + '\'');
}

function insertUserSavedAttractions(attractions) {
    return DButilsAzure.execQuery('DECLARE @json NVARCHAR(MAX) SET @json = N\'' + JSON.stringify(attractions) + '\'' +
        'INSERT INTO ClientSavedAttractions (UserName, Attraction_ID, Order_ID, Date)\n' +
        ' SELECT UserName, Attraction_ID, Order_ID, Date \n' +
        ' FROM OPENJSON(@json)\n' +
        ' WITH (UserName varchar(200),Attraction_ID int, Order_ID int, Date datetime)');
}

function getTwoRandomFavoriteCategories(categories) {
    categories = categories.map(a => a.Category_ID);
    let randomFavoriteCategories = [];

    if (categories.length === 2) {
        randomFavoriteCategories[0] = categories[0];
        randomFavoriteCategories[1] = categories[1];
    }
    else {
        randomFavoriteCategories[0] = categories[Math.floor(Math.random() * categories.length)];
        randomFavoriteCategories[1] = categories[Math.floor(Math.random() * categories.length)];
        while (randomFavoriteCategories[0] === randomFavoriteCategories[1]) {
            randomFavoriteCategories[1] = categories[Math.floor(Math.random() * categories.length)];
        }
    }

    return randomFavoriteCategories;
}

function getMaxRankAttractionFromCategory(categoryID) {
    return DButilsAzure.execQuery('SELECT *\n' +
        'FROM Attractions a\n' +
        'INNER JOIN (\n' +
        '    SELECT Category_ID, MAX(Attraction_Rank) Attraction_Rank\n' +
        '    FROM Attractions\n' +
        '    GROUP BY Category_ID\n' +
        ') b ON a.Category_ID = b.Category_ID AND a.Attraction_Rank = b.Attraction_Rank\n' +
        'where a.Category_ID = ' + categoryID);
}

function getUserFavoriteCategoriesID(userName) {
    return DButilsAzure.execQuery('select Category_ID from ClientFavoriteCategories ' +
        'where UserName = \'' + userName + '\'');
}

module.exports = router;
