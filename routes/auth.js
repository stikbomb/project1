let authController = require('../controllers/authcontroller.js');
let mysqlcon = require('../mysqlcon');
var faker = require('faker');
var request = require('request');
var http = require('http');
var fs = require('fs');
var moment = require('moment');

let titleEdit;

mysqlcon.connection.connect();

module.exports = function(app, passport) {
    // app.get('/', function(req, res) {
    //     res.send(req.flash());
    // });
    //
    // app.post('/download2', async (req, res) => {
    //
    //     var link = req.body.link;
    //     var title = req.body.title;
    //     var path = "/uploads/";
    //     res.setHeader("content-disposition", "attachment; filename="+ title +".jpg");
    //     await request(link).pipe(fs.createWriteStream("public"+path + title+".jpg"));
    //     res.sendStatus(200);
    // });
    //
    // app.post('/download', function (req, res) {
    //     var path = "/uploads/";
    //     var title = req.body.title;
    //     var file = fs.createWriteStream("public"+path + title+".jpg");
    //     http.get(req.body.link, function (response) {
    //         response.pipe(file);
    //     });
    // });


    ///////
    //AUTH
    ///////

    app.get('/signup', authController.signup);

    app.get('/signin', authController.signin);

    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect: '/',

            failureRedirect: '/signin'
        }
    ));

    app.post('/signin', passport.authenticate('local-signin', {
            successRedirect: '/admin',

            failureRedirect: '/signin'
        }
    ));

    app.get('/logout', authController.logout);


    /////////
    //VK AUTH
    /////////

    app.get('/auth/vk', rememberUrl,
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
            res.redirect(backUrl);
        });


    ////////////
    //PAGINATION
    ////////////

    // app.get('/', (req, res) => {
    //
    //     mysqlcon.connection.query("SELECT * FROM `contents` LIMIT 5", async (err, rows) => {
    //         let tagsArray = [];
    //         console.log(rows);
    //         console.log(rows[0].slug);
    //         // const promises = rows.forEach(async (row) => {
    //         //     // let tags = await mysqlcon.connection.query("SELECT * FROM `tags` where (slug='" + row.slug + "')");
    //         //     let tags = await mysqlcon.connection.query("SELECT * FROM `tags` LIMIT 1");
    //         //     // console.log(JSON.stringify(tags));
    //         //     // tagsArray.push(tags);
    //         //         // console.log(tagsArray);
    //         // });
    //         // // console.log(jRows[0]);
    //         // await Promise.all(promises);
    //         console.log(tagsArray);
    //         res.render('./guest/index', {rows: rows});
    //     });
    // });

    app.get('/', (req, res) => {

        mysqlcon.connection.query("SELECT * FROM `contents` LIMIT 5", async (err, rows) => {
            console.log(typeof rows);
            let tagsArray = [];
            await rows.forEach(async (row) => {

                await mysqlcon.connection.query("SELECT * FROM `tags` where (slug='" + row.slug + "')", async (err, tags) => {
                    // console.log(tags);
                    await tagsArray.push(tags);
                });

            });
            console.log(tagsArray);
            // console.log(jRows[0]);
            res.render('./guest/index', {rows: rows, user: req.user});
        });
    });

    app.get('/articles/page/:num', (req, res) => {
        let offset = req.params.num * 5 - 5;
        let query = 'SELECT * FROM `contents` ORDER BY createdAt DESC LIMIT ' + offset + ',5';
        mysqlcon.connection.query(query, (err, rows) => {
            console.log(rows);
            mysqlcon.connection.query('SELECT COUNT(*) AS count FROM contents', (err, count) => {
                console.log(count[0].count);
                console.log(JSON.stringify(count));
                let pages = Math.ceil(count[0].count / 5);
                console.log(pages);
                if (req.isAuthenticated()) {
                    res.render('./guest/page', {rows: rows, pages: pages, current: req.params.num});
                } else {
                    res.render('./guest/page', {rows: rows, pages: pages, current: req.params.num});
                }
            });

        });
    });



    app.get('/admin', isLoggedIn, isAdmin, authController.admin);


    app.get('/admin/articles', isLoggedIn, isAdmin,(req, res) => {

        mysqlcon.connection.query("SELECT * FROM `contents`", function (err, rows) {
            console.log(rows);
            res.render('./admin/articles', {rows: rows});

        });
    });

    app.get('/admin/articles/add', isAdmin, authController.adminadd);


    app.post('/admin/article', async (req, res) => {

        let title = req.body.title;
        let content1 = req.body.content1;
        let content2 = req.body.content2;
        let content3 = req.body.content3;
        let slug = faker.random.uuid();
        let tags = req.body.tags;
        let tagsArr = tags.split(';');
        let link = req.body.image;
        let path = "/uploads/";
        let createFormat = moment(new Date()).format("HH:mm:ss DD.MM.YYYY");
        await request(link).pipe(fs.createWriteStream("public"+path + slug +".jpg"));
        let sql = "INSERT INTO contents (content1, content2, content3, title, slug, createFormat) VALUES ?";
        let values = [[content1.toString(), content2.toString(), content3.toString(), title.toString(), slug.toString(), createFormat]];
        mysqlcon.connection.query(sql, [values], async (err, result) => {
            if (err) throw err;
            console.log('Item was added!' + result.affectedRows);
            await tagsArr.forEach((element) => {
                let sql = "INSERT INTO tags (tag, slug) VALUES ?";
                let values = [[element.toString(), slug.toString()]];
                mysqlcon.connection.query(sql, [values], async (err, result) => {
                    if (err) throw err;
                })

            });
            console.log('OHOHOHO!!');
            res.redirect('/admin');
        });
    });

    app.post('/admin/articles/edit/:slug', isAdmin, async (req, res) => {
        let title = req.body.title;
        let content1 = req.body.content1;
        let content2 = req.body.content2;
        let content3 = req.body.content3;
        let slug = req.params.slug;
        let tags = req.body.tags;
        let tagsArr = tags.split(';');

        let sql = "UPDATE contents SET content1='" + content1 + "', content2='" + content2 +"', content3='" +
            content3 +"', title='" + title+ "' WHERE slug='" + slug + "';";

        console.log(sql);
        mysqlcon.connection.query(sql, (err) => {
            let sql2 = "DELETE FROM tags WHERE (slug='" + slug + "');";
            mysqlcon.connection.query(sql2, async (err, result) => {
                if (err) throw err;
                console.log('Item was deleted!');
                await tagsArr.forEach((element) => {
                    let sql = "INSERT INTO tags (tag, slug) VALUES ?";
                    let values = [[element.toString(), slug.toString()]];
                    mysqlcon.connection.query(sql, [values], async (err, result) => {
                        if (err) throw err;
                    })

                });
                console.log('OHOHOHO!!');
                res.redirect('/admin/articles');
            });
        });

        res.redirect('/admin/articles')



    });


    app.get('/404', function(res, req) {
        req.render('./404');
    });

    app.get('/articles/:slug', function (req, res) {
        let index = req.params.slug;
        let sql = "SELECT * FROM `contents` where (slug='" + index + "')";
        mysqlcon.connection.query(sql, (err, fields) => {


            var strng = JSON.stringify(fields);
            var json = JSON.parse(strng);
            let sql2 = "SELECT * FROM `comments` where (slug='" + index + "')";
            mysqlcon.connection.query(sql2, (err, result) => {
                console.log(result);
                let sql2 = "SELECT * FROM `tags` where (slug='" + index + "')";
                mysqlcon.connection.query(sql2, (err, tags) => {
                    res.render('./guest/article', {json: json, user: req.user, comments: result, tags: tags});
                });
            });
        });
    });

    // app.get('/admin/articles/:slug', isAdmin, (req, res) => {
    //     let index = req.params.slug;
    //
    //     let sql = "SELECT * FROM `contents` where (slug='" + index + "')";
    //     console.log(sql);
    //     mysqlcon.connection.query(sql, (err, fields) => {
    //
    //
    //         let strng = JSON.stringify(fields);
    //
    //         let json =  JSON.parse(strng);
    //         console.log(strng);
    //         let sql2 = "SELECT * FROM `tags` where (slug='" + index + "')";
    //         mysqlcon.connection.query(sql2, (err, tags) => {
    //             if (err) throw err;
    //             let string = JSON.stringify(tags);
    //             let tagsJson =  JSON.parse(string);
    //             console.log(tagsJson);
    //             res.render('./admin/slug', {json, tagsJson});
    //         });
    //
    //
    //
    //
    //     });
    // });

    app.get('/admin/articles/delete/:slug', isAdmin, function (req, res) {


        var slug = req.params.slug;

        var sql = "DELETE FROM contents WHERE (slug='" + slug + "');";
        mysqlcon.connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log('Item was deleted!' + result.affectedRows)
            let sql2 = "DELETE FROM `tags` WHERE (slug='" + slug + "')";
            mysqlcon.connection.query(sql2, function (err, result) {
                if (err) throw err;
                console.log(result);
                console.log('ok');
            })
        });
        res.redirect('/admin/articles')
    });

    app.get('/admin/articles/edit/:slug', isAdmin, function (req, res) {
        var index = req.params.slug;
        titleEdit = index;

        console.log("строка0");
        var sql = "SELECT * FROM `contents` where (slug='" + index + "');";
        console.log(sql);
        mysqlcon.connection.query(sql, function (err, fields) {


            var strng = JSON.stringify(fields);

            var json = JSON.parse(strng);
            var oldContent = json[0];
            console.log(oldContent);
            let sql2 = "SELECT * FROM `tags` where (slug='" + index + "')";
            mysqlcon.connection.query(sql2, async (err, tags) => {
                if (err) throw err;
                console.log(tags);
                let tagsString = '';
                await tags.forEach((element) => {
                    tagsString = tagsString + element.tag + ";"
                });
                tagsString = tagsString.slice(0, -1);
                res.render('./admin/edit', {oldContent, tagsString});


            });
        });
    });

    app.post('/articles/comment/:slug', isLoggedIn, function (req, res) {
        let user = JSON.parse(req.session.passport.user);
        let content = req.body.content;
        let name = user.username;
        let avatar = user.photoUrl;
        let url = user.profileUrl;
        let slug = req.params.slug;
        let createFormat = moment(new Date()).format("HH:mm:ss DD.MM.YYYY");
        let sql = "INSERT INTO comments (slug, content, name, avatar, url, createFormat) VALUES ?";
        let values = [[slug, content.toString(), name, avatar, url, createFormat]];
        mysqlcon.connection.query(sql, [values], (err, result) => {
            if (err) throw err;
            console.log('itsok');
            res.redirect('/articles/'+slug);

        });
    });
    app.get('/vksucces', isLoggedIn, function (req, res) {
        var usern = JSON.parse(req.session.passport.user);
        console.log(req.session.passport.user);
        console.log(usern);
        res.render("./vksucces", {usern});
    });



};

const fakeslugs = async (r) => {
    for (let i = 0; i < r; i++) {
        let tagsArray = ['iusto', 'saepe', 'sint', 'ea', 'sint', 'qui', 'voluptatem', 'fugiat', 'similique',
            'consequatur'];
        let tags = [tagsArray[Math.floor(Math.random()*tagsArray.length)],
            tagsArray[Math.floor(Math.random()*tagsArray.length)],
            tagsArray[Math.floor(Math.random()*tagsArray.length)]];
        let content1 = await faker.lorem.paragraphs();
        let content2 = await faker.lorem.paragraphs(3);
        let content3 = await faker.lorem.paragraphs(2);
        let title = faker.lorem.words();
        let slug = faker.random.uuid();
        let createFormat = moment(new Date()).format("HH:mm:ss DD.MM.YYYY");

        var sql = "INSERT INTO contents (content1, content2, content3, title, slug, createFormat) VALUES ?";
        var values = [[content1.toString(), content2.toString(), content3.toString(), title.toString(),
            slug.toString(), createFormat]];
        await mysqlcon.connection.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log('Item was added!' + result.affectedRows)
        });
        await tags.forEach((element) => {
            let sql = "INSERT INTO tags (tag, slug) VALUES ?";
            let values = [[element.toString(), slug.toString()]];
            mysqlcon.connection.query(sql, [values], async (err, result) => {
                if (err) throw err;
            })

        });

        var link = 'http://picsum.photos/900/300/?random';
        var path = "/uploads/";
        // res.setHeader("content-disposition", "attachment; filename="+ slug +".jpg");
        await request(link).pipe(fs.createWriteStream("public"+path + slug +".jpg"));
        // res.sendStatus(200);
    }
};
//
// fakeslugs(5);

function isAdmin(req, res, next) {

    var userJ = JSON.parse(req.session.passport.user);

    var sql = "SELECT * FROM `users` where (id='" + userJ.id + "')";
    console.log(sql);
    mysqlcon.connection.query(sql, function (err, fields) {


        var strng = JSON.stringify(fields);

        var json =  JSON.parse(strng);
        console.log(strng);
        console.log(json[0]);
        if (json[0] === undefined) {
            return res.redirect('/signin');
        } else if (json[0].role === 'admin') {
            return next();
        }
        res.redirect('/signin')

    });
}

function rememberUrl(req, res, next) {
    global.backUrl = req.header('Referer') || '/';
    next();
}

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
        return next();

    res.redirect('/signin');

}