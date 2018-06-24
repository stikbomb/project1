var authController = require('../controllers/authcontroller.js');
var mysql      = require('mysql');
var pug = require('pug');

var db = require('../db.json');


module.exports = function(app, passport) {

    app.get('/', function (req, res) {
        var connection = mysql.createConnection({

            host: db.host,
            user: db.user,
            password: db.password,
            database: db.database

        });

        connection.connect();
        connection.query("SELECT * FROM `contents`", function (err, rows) {
            console.log(rows);
            res.render('./user/index', {rows: rows});

        });

    });

    app.get('/signup', authController.signup);


    app.get('/signin', authController.signin);


    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/admin',

            failureRedirect: '/signin'
        }
    ));

    app.get('/admin', isLoggedIn, authController.admin);


    app.get('/admin/articles', isLoggedIn, function (req, res) {
        var connection = mysql.createConnection({

            host: db.host,
            user: db.user,
            password: db.password,
            database: db.database

        });

        connection.connect();
        connection.query("SELECT * FROM `contents`", function (err, rows) {
            console.log(rows);
            res.render('./admin/articles', {rows: rows});

        });
    });

    app.get('/admin/articles/add', isLoggedIn, authController.adminadd);

    app.get('/logout', authController.logout);

    app.post('/admin', passport.authenticate('local-sendItem', {
            successRedirect: '/admin',

            failureRedirect: '/signin'
        }
    ));

    app.post('/admin/articles/sendItem', function (req, res) {

        var content = req.body.content;
        var title = req.body.title;
        var slug = req.body.slug;
        var connection = mysql.createConnection({

            host: db.host,
            user: db.user,
            password: db.password,
            database: db.database

        });

        connection.connect();
        var sql = "INSERT INTO contents (content, title, slug) VALUES ?";
        var values = [[content.toString(), title.toString(), slug.toString()]];
        connection.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log('Item was added!' + result.affectedRows)
        });
        res.send(content);
    });

    app.post('/signin', passport.authenticate('local-signin', {
            successRedirect: '/admin',

            failureRedirect: '/signin'
        }
    ));


    function isLoggedIn(req, res, next) {

        if (req.isAuthenticated())

            return next();

        res.redirect('/signin');

    }


    app.get('/articles/:slug', function (req, res) {
        var index = req.params.slug;
        var connection = mysql.createConnection({
            host: db.host,
            user: db.user,
            password: db.password,
            database: db.database

        });

        connection.connect();
        var sql = "SELECT * FROM `contents` where (slug='" + index + "')";
        console.log(sql);
        connection.query(sql, function (err, fields) {


            var strng = JSON.stringify(fields);

            var json =  JSON.parse(strng);
            console.log(strng);
            console.log(json);
            console.log(json[0].title);


            res.render('./user/slug', {json});


        });
    });
}

