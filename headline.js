var $ = require('jquery-deferred');
var _ = require('lodash');

var db;
var validClasses;

function getHeadline(sentence) {
    var sentenceDone = $.Deferred();

    if (sentence) {
        createRecursiveSentence(sentence, db).done(function (result) {
            sentenceDone.resolve(result);
        });
    } else {
        db.getSentence().done(function (sentence) {
            createRecursiveSentence(sentence.expression, db).done(function (result) {
                sentenceDone.resolve(result);
            });
        });
    }
    return sentenceDone.promise();
}

function getPerson() {
    return function (count) {
        var deferred = $.Deferred(),
            functions = [],
            words = [],
            i,
            count = count || 1;

        functions.push(getOldLady(db));
        functions.push(db.getCeleb);

        for (i = 0; i < count; i++) {
            var f = functions[Math.floor(Math.random() * functions.length)];
            words.push(f());
        }

        $.when.apply(null, words).done(function () {
            deferred.resolve(arguments[0]);
        });

        return deferred.promise();
    }
}

function getOldLady(count) {
    return function getOldLadyCallback(count) {
        var oldLady = db.getOldLady(count),
            deferred = $.Deferred();

        oldLady.done(function (result) {
            var nameAndAgeArray = _.map(result, function (name) {
                return name + ', ' + Math.floor(Math.random() * 34 + 65);
            });
            deferred.resolve(nameAndAgeArray);
        });

        return deferred.promise();
    }
}

function getCeleb(count) {
    return function (count) {
        var deferred = $.Deferred(),
            celeb = db.getCeleb(count);

        celeb.done(function (celebs) {
            deferred.resolve(celebs);
        });

        return deferred.promise();
    }
}

function tryNewMatch(match, sentence, deferred) {
    var wordClass;
    var asyncFunction;
    var errorMessage;

    if (match) {
        wordClass = match[0];

        asyncFunction = db.getRandomWord(wordClass.replace(/%/g, ''));

        asyncFunction.done(function (results) {
            replaceWords(wordClass, results.expression, sentence, deferred);
        });

        asyncFunction.fail(function () {
            errorMessage = '[UNKNOWN CLASS: "' + wordClass.replace(/%/g, "") + '"]';
            replaceWords(wordClass, errorMessage, sentence, deferred);
        })
    } else {
        deferred.resolve(sentence);
    }
}

function replaceWords(wordClass, replacementWord, sentenceStructure, deferred) {
    var replaceRegexp = new RegExp(wordClass);
    var match;

    sentenceStructure = sentenceStructure.replace(replaceRegexp, replacementWord);

    match = sentenceStructure.match(/%\w+%/);

    tryNewMatch(match, sentenceStructure, deferred);
}

function setupValidClasses() {
    validClasses = {
        '%person%': getPerson(),
        '%pvsp_verb%': db.getPvsPVerb,
        '%old_lady%': getOldLady(),
        '%comment%': db.getComment
    };
}

function createRecursiveSentence(sentenceStructure) {
    var sentenceDone = $.Deferred();
    var match = sentenceStructure.match(/%\w+%/);

    tryNewMatch(match, sentenceStructure, sentenceDone);

    return sentenceDone.promise();
}

HeadlineGenerator = function (database) {
    db = database;

    setupValidClasses();
}

HeadlineGenerator.prototype.getHeadline = getHeadline;

exports.HeadlineGenerator = HeadlineGenerator;
exports.getDatabase