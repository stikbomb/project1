var mysql = require('mysql');

var connection = mysql.createConnection({
    database : 'mysql',
    user     : 'root',
    password : 'toor'
});

var x={};

var query = function(){
    connection.connect();
    connection.query("SELECT * FROM `contents`",  function(err, result) {
        if (err) throw err;
        x = rows[0].solution;
    });
    connection.end();
};

var answer = function(){
    return x;
};

module.exports.query = query;
module.exports.answer = answer;