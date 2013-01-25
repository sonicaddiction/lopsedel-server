var database = require('./database');
var headline = require('./headline');
var server = require('./server');

var generator;

database.init().done(function () {
    generator = new headline.HeadlineGenerator(database);
    server.init(database, generator);

    server.server.listen(8080, function () {
        console.log('%s listening at %s', server.server.name, server.server.url);
    });
});



