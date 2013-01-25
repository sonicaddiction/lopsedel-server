var mongoose = require('mongoose');
var $ = require('jquery-deferred');
var _ = require('lodash');

var models;

var WordModel;

function addWord(expression, expressionType) {
    var word = new WordModel({
        expression: expression,
        expressionType: expressionType
    });
    word.save();
}

function setupSchemas() {
    var wordSchema = new mongoose.Schema({
        expression: {
            type: String,
            index: {
                unique: true
            }
        },
        expressionType: String
    });

    WordModel = mongoose.model('word', wordSchema);

    //addWord('%celebrity%', 'person');
    //addWord('%oldLady%, %age%', 'person');
}

function getRandomWords(expressionType) {
    var deferred = $.Deferred();

    WordModel.find({ expressionType: expressionType }, 'expression', function (err, response) {
        var length = response.length;
        var randomIndex = Math.floor(Math.random() * length);
        var result;
        if (err) {
            deferred.reject("Error: " + expressionType + " not found");
            return;
        }

        result = response[randomIndex];

        deferred.resolve(result);
    });


    return deferred;
}

function getSentence(count) {
    return getRandomWords('sentence');
}

function init() {
    var db;
    var initialized = $.Deferred();

    mongoose.connect('mongodb://localhost/lopsedel');

    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        setupSchemas();

        initialized.resolve();
    });

    return initialized;
}

function listModel(model) {
    var deferred = $.Deferred();
    var query;
    var Model = models[model];

    if (!Model) {
        return null;
    }

    query = Model.find();

    query.select('value').exec(function (err, res) {
        var list = _.pluck(res, 'value');
        deferred.resolve(res);
    });

    return deferred.promise();

}

function listModels() {
    var deferred = $.Deferred();

    mongoose.connection.db.collectionNames(function (err, names) {
        deferred.resolve(names);
    });

    return deferred.promise();
}

function getWord(id) {
    var deferred = $.Deferred();

    WordModel.find({ _id: id}, 'expression', function (err, response) {
        if (err) {
            deferred.reject();
            return;
        }

        deferred.resolve(response)
    });

    return deferred.promise();
}

function getAllWords() {
    var deferred = $.Deferred();

    WordModel.find().sort('expressionType expression').exec(function (err, response) {
        if (err) {
            deferred.reject();
            return;
        }

        deferred.resolve(response)
    });

    return deferred.promise();
}

function deleteWord(id) {
    var deferred = $.Deferred();

    WordModel.remove({ _id: id}, function (err, response) {
        if (err) {
            deferred.reject();
            return;
        }

        deferred.resolve()
    });

    return deferred.promise();
}

function updateWord(model) {
    var deferred = $.Deferred();

    WordModel.update({ _id: model['_id']}, {
        expression: model['expression'],
        expressionType: model['expressionType']
    },function (err, response) {
        if (err) {
            console.log("Error:", err)
            deferred.reject();
            return;
        }

        deferred.resolve()
    });

    return deferred.promise();
}

function addWord(model) {
    var deferred = $.Deferred();

    var newModel = new WordModel(model);

    console.log("New model: ", newModel);

    newModel.save(function (err, response) {
        if (err) {
            console.log("Error:", err)
            deferred.reject();
            return;
        }

        deferred.resolve();
    });

    return deferred.promise();
}

function getExpressionTypes() {
    var deferred = $.Deferred();

    WordModel.distinct('expressionType').exec(function (err, response) {
        if (err) {
            deferred.reject();
            return;
        }

        deferred.resolve(response);
    });

    return deferred.promise();
}

exports.init = init;

exports.getSentence = getSentence;

exports.getAllWords = getAllWords;
exports.getWord = getWord;
exports.deleteWord = deleteWord;
exports.updateWord = updateWord;
exports.addWord = addWord;

exports.getExpressionTypes = getExpressionTypes;

exports.getRandomWord = getRandomWords;