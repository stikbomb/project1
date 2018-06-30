var mysql = require('mysql');
var db = require('./db.json');

var connection = mysql.createConnection({

    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database
});

var result= new Array();

// var query = function(){
//     connection.connect();
//     connection.query("SELECT * FROM `contents`",  function(err, result) {
//         if (err) throw err;
//         x = rows[0].solution;
//     });
//     connection.end();
// };

var answer = function(){
    return result;
};

var showAll = function(err, rows){
    connection.connect();
    connection.query("SELECT * FROM `contents`", function (err, rows) {
        console.log('Show all' + rows);

    });
    connection.end();

};

module.exports.showAll = showAll;
// module.exports.query = query;
module.exports.answer = answer;
module.exports.connection = connection;

// module.exports = function createConnection() {
//     var connection = mysqlcon.createConnection({
//
//         host: 'localhost',
//         user: 'root',
//         password: '128500',
//         database: 'project1',
//
//     });
//     connection.connect;
// }
