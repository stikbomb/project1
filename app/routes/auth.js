var authController = require('../controllers/authcontroller.js');
var mysql      = require('mysql');


module.exports = function(app, passport) {


    app.get('/signup', authController.signup);


    app.get('/signin', authController.signin);


    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/dashboard',

            failureRedirect: '/signup'
        }
    ));

    app.get('/admin', isLoggedIn, authController.admin);

    // app.get('/dashboard', isLoggedIn, authController.dashboard);

    app.get('/dashboard', function (req, res) {
        var connection = mysql.createConnection({

            host: 'localhost',
            user: 'root',
            password: '128500',
            database: 'project1'

        });

        connection.connect();
        connection.query("SELECT * FROM `contents`", function (err, rows) {
            console.log(rows);
            res.render('dashboard', {rows: rows});

        });

    });


    app.get('/logout', authController.logout);

    app.post('/admin', passport.authenticate('local-sendItem', {
            successRedirect: '/admin',

            failureRedirect: '/signin'
        }
    ));

    app.post('/sendItem', function (req, res) {
        // app.use(bodyParser.json());
        // app.use(bodyParser.urlencoded({extended: false}));
        var content = req.body.content;
        var title = req.body.title;
        var slug = req.body.slug;
        var connection = mysql.createConnection({

            host: 'localhost',
            user: 'root',
            password: '128500',
            database: 'project1'

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
            successRedirect: '/dashboard',

            failureRedirect: '/signin'
        }
    ));


    function isLoggedIn(req, res, next) {

        if (req.isAuthenticated())

            return next();

        res.redirect('/signin');

    }


    app.get('/element/:slug', function (req, res) {
        var index = req.params.slug;
        var connection = mysql.createConnection({

            host: 'localhost',
            user: 'root',
            password: '128500',
            database: 'project1'

        });

        connection.connect();
        var sql = "SELECT * FROM `contents` where (slug='" + index + "')";
        console.log(sql);
        connection.query(sql, function (err, fields) {


            var string = JSON.stringify(fields);

            var json =  JSON.parse(string);
            console.log(string);
            console.log(json);


            res.render('slug', {json});


        });
    });
}

