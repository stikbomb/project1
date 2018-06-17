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

    app.get('/dashboard', isLoggedIn, authController.dashboard);



    app.get('/logout', authController.logout);

    app.post('/admin', passport.authenticate('local-sendItem', {
            successRedirect: '/admin',

            failureRedirect: '/signin'
        }

    ));

    app.post('/sendItem', function(req, res){
        // app.use(bodyParser.json());
        // app.use(bodyParser.urlencoded({extended: false}));
        var content = req.body.content;
        var connection = mysql.createConnection({

            host     : 'localhost',
            user     : 'root',
            password : '128500',
            database : 'project1'

        });

        connection.connect();
        connection.query("INSERT INTO contents (content) VALUES (?)", content.toString(), function(err, result){
            if(err) throw err;
            console.log("1 record inserted");
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

}