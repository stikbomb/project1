let mysqlcon = require('../mysqlcon');
let request = require('request');
var fs = require('fs');

exports.profile = (req, res) => {
    let user = JSON.parse(req.session.passport.user);
    res.render('./admin/profile', {user: user});
};

exports.changeEmail = (req, res) => {
    let usern = JSON.parse(req.session.passport.user);
    let email = req.body.newemail;
    mysqlcon.connection.query("UPDATE users SET email='" + email + "' WHERE email='" + usern.email + "';", async (err) => {
        if (err) throw err;
        await mysqlcon.connection.query("SELECT * FROM `users` WHERE email='" + email + "';", (err, user) => {
            console.log(user);
            let string = JSON.stringify(user);
            let jUser = JSON.parse(string);
            console.log(jUser);
            res.render('./admin/profile', {user: jUser[0]});
        })
    })
}

exports.changeName = (req, res) => {
    let usern = JSON.parse(req.session.passport.user);
    let name = req.body.newname;
    mysqlcon.connection.query("UPDATE users SET username='" + name + "' WHERE email='" + usern.email + "';", async (err) => {
        if (err) throw err;
        await mysqlcon.connection.query("SELECT * FROM `users` WHERE email='" + usern.email + "';", (err, user) => {
            console.log(user);
            let string = JSON.stringify(user);
            let jUser = JSON.parse(string);
            console.log(jUser);
            res.render('./admin/profile', {user: jUser[0]});
        })
    })
};

exports.changeAvatar = (req, res) => {
    let link = req.body.link;
    request(link).pipe(fs.createWriteStream("public/images/avatar.jpg"));
    res.redirect('/admin/profile');
};