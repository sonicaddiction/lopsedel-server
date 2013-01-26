var restify = require('restify');

var db;
var generator;

function getHeadline(req, res, next) {
    console.log('getHeadline()');

    generator.getHeadline().done(function (sentence) {
        var value = {
            headline: sentence
        };
        res.send(value);
    });
}

function parseSentence(req, res, next) {
    console.log('parseSentence():', req.query.expression);

    generator.getHeadline(req.query.expression).done(function (sentence) {
        var value = {
            headline: sentence
        };
        res.send(value);
    });
}

function getAllWords(req, res, next) {
    console.log('getAllWords()');
    var getList = db.getAllWords();

    getList.done(function (list) {
        res.send({
            results: list
        })
    });
}

function getWord(req, res, next) {
    console.log('getWord()');
    var getList = db.getWord(req.params.id);

    getList.done(function (list) {
        res.send({
            results: list
        })
    });

    return next();
}

function deleteWord(req, res, next) {
    var deleteWord = db.deleteWord(req.params.id);

    deleteWord.done(function () {
        res.send(204);
    });

    deleteWord.fail(function () {
        res.send(403);
    })

    return next();
}

function updateWord(req, res, next) {
    console.log('updateWord()');
    var updateWord = db.updateWord(req.body);

    updateWord.done(function () {
        res.send(204);
    });

    updateWord.fail(function () {
        res.send(403);
    })

    return next();
}

function addWord(req, res, next) {
    console.log("addWord()", req.body);

    var addWord = db.addWord(req.body);

    addWord.done(function () {
        res.send(204);
    });

    addWord.fail(function () {
        res.send(403);
    })

    return next();
}

function getExpressionTypes(req, res, next) {
    console.log('getExpressionTypes()');
    var getExpressionTypes = db.getExpressionTypes();

    getExpressionTypes.done(function (list) {
        res.send({
            results: list
        })
    });

    return next();
}

function corsHandler(req, res, next) {
    console.log("corsHandler()", req.method);

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept, Access-Control-Allow-Methods");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);

    return next();
}

function setOptions(req, res, next) {
    console.log("setOptions()");

    res.send(202);

    return next();
}

var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));
server.use(restify.queryParser({ mapParams: false }));
server.use(restify.fullResponse());

server.get('/headline/', corsHandler, getHeadline);
server.head('/headline/', corsHandler, getHeadline);
server.get('/db/sentence/', corsHandler, parseSentence);
server.get('/db/types/', corsHandler, getExpressionTypes);
server.get('/db/words/', corsHandler, getAllWords);
server.post('/db/words/', corsHandler, addWord);
server.get('/db/words/:id', corsHandler, getWord);
server.del('/db/words/:id', corsHandler, deleteWord);
server.put('/db/words/:id', corsHandler, updateWord);

server.opts('/\.*/', corsHandler, setOptions);

function init(database, headlineGenerator) {
    db = database;
    generator = headlineGenerator;
}

exports.server = server;
exports.init = init;