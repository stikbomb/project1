var authController = require('../controllers/authcontroller.js');
var mysql = require('mysql');
var db = require('../db.json');


var titleEdit;

connection = mysql.createConnection({

    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database
});

connection.connect();

module.exports = function(app, passport) {

    app.get('/', function (req, res) {

        connection.query("SELECT * FROM `contents`", function (err, rows) {
        console.log(rows);
        if (req.isAuthenticated()) {
            res.render('./user/index', {rows: rows});
        } else {
            res.render('./guest/index', {rows: rows});
        };
        });
    });

    app.get('/signup', authController.signup);


    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/',

            failureRedirect: '/signin'
        }
    ));

    app.get('/admin', isLoggedIn, isAdmin, authController.admin);


    app.get('/admin/articles', isAdmin, function (req, res) {

        connection.query("SELECT * FROM `contents`", function (err, rows) {
            console.log(rows);
            res.render('./admin/articles', {rows: rows});

        });
    });

    app.get('/admin/articles/add', isAdmin, authController.adminadd);

    app.get('/logout', authController.logout);

    app.post('/admin', passport.authenticate('local-sendItem', {
            successRedirect: '/admin',

            failureRedirect: '/signin'
        }
    ));

    app.post('/admin/articles/sendItem', isAdmin, function (req, res) {

        var content = req.body.content;
        var title = req.body.title;
        var slug = req.body.slug;

        var sql = "INSERT INTO contents (content, title, slug) VALUES ?";
        var values = [[content.toString(), title.toString(), slug.toString()]];
        connection.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log('Item was added!' + result.affectedRows)
        });
        res.redirect('/admin/articles');
    });

    app.post('/signin', passport.authenticate('local-signin', {
            successRedirect: '/',

            failureRedirect: '/signin'
        }
    ));


    function isLoggedIn(req, res, next) {

        if (req.isAuthenticated())
            return next();

        res.redirect('/404');

    }

    function isAdmin(req, res, next) {

        var userJ = JSON.parse(req.session.passport.user);

        var sql = "SELECT * FROM `users` where (id='" + userJ.id + "')";
        console.log(sql);
        connection.query(sql, function (err, fields) {


            var strng = JSON.stringify(fields);

            var json =  JSON.parse(strng);
            console.log(strng);
            console.log(json);
            if (json[0].role === 'admin') {
                return next();
                }
                res.redirect('/404')

        });
    };


    app.get('/404', function(res, req) {
        req.render('./404');
    });

    app.get('/articles/:slug', function (req, res) {
        var index = req.params.slug;
        var sql = "SELECT * FROM `contents` where (slug='" + index + "')";
        connection.query(sql, function (err, fields) {


            var strng = JSON.stringify(fields);

            var json =  JSON.parse(strng);
            console.log(strng);
            console.log(json);
            console.log(json[0].title);

            if (req.isAuthenticated()) {
                res.render('./user/slug', {json});
            } else {
                res.render('./guest/slug', {json});
            };



        });
    });

    app.get('/admin/articles/:slug', isAdmin, function (req, res) {
        var index = req.params.slug;

        var sql = "SELECT * FROM `contents` where (slug='" + index + "')";
        console.log(sql);
        connection.query(sql, function (err, fields) {


            var strng = JSON.stringify(fields);

            var json =  JSON.parse(strng);
            console.log(strng);
            console.log(json);
            console.log(json[0].title);


            res.render('./admin/slug', {json});


        });
    });

    app.post('/admin/articles/delete/:slug', isAdmin, function (req, res) {


        var slug = req.params.slug;

        var sql = "DELETE FROM contents WHERE (slug='" + slug + "');";
        connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log('Item was deleted!' + result.affectedRows)
        });
        res.redirect('/admin/articles')
    });

    app.get('/admin/articles/edit/:slug', isAdmin, function (req, res) {
        var index = req.params.slug;
        titleEdit = index;

        console.log("строка0");
        var sql = "SELECT * FROM `contents` where (slug='" + index + "');";
        console.log(sql);
        connection.query(sql, function (err, fields) {


            var strng = JSON.stringify(fields);

            var json =  JSON.parse(strng);
            var oldContent = json[0].content;



            res.render('./admin/edit', {oldContent});

        });
    });

    app.post('/admin/articles/edit/editArticle', isAdmin, function (req, res) {
        var article = req.body.content;

        var sql = "UPDATE contents SET content='" + article + "' WHERE slug='" + titleEdit + "';";

        console.log(sql);
        connection.query(sql);

        res.redirect('/admin/articles')



    });

    app.get('/auth/vk',
        passport.authenticate('vk', {
            scope: ['friends']
        }),
        function (req, res) {
            // The request will be redirected to vk.com
            // for authentication, so
            // this function will not be called.
        });

    app.get('/auth/vk/callback',
        passport.authenticate('vk', {
            failureRedirect: '/auth'
        }),
        function (req, res) {
            // Successful authentication
            //, redirect home.
            console.log("Удачная аутентификация!!!длаа")
            res.redirect('/');
        });

    app.get('/vksucces', isLoggedIn, function (req, res) {
        var usern = JSON.parse(req.session.passport.user);
        console.log(req.session.passport.user);
        console.log(usern);
        res.render("./vksucces", {usern});
    });
};


