var exports = module.exports = {}
var mysql      = require('mysql');
exports.signup = function(req, res) {

    res.render('signup');

}

exports.signin = function(req, res) {

    res.render('signin');

}

exports.dashboard = function(req, res) {
    var connection = mysql.createConnection({

        host     : 'localhost',
        user     : 'root',
        password : '128500',
        database : 'project1'

    });

    connection.connect();

    connection.query("SELECT * FROM `contents`",  function(err, result) {
        res.render('dashboard', { object: result });
    });


}

exports.admin = function(req, res) {

    res.render('admin');
}

exports.logout = function(req, res) {

    req.session.destroy(function(err) {

        res.redirect('/');

    });

}