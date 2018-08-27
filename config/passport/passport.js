//load bcrypt
var bCrypt = require('bcrypt-nodejs');
const VKontakteStrategy = require('passport-vkontakte').Strategy;
var vk = require('../vk.json');

module.exports = function(passport,user){

    var User = user;
    var LocalStrategy = require('passport-local').Strategy;


    // passport.serializeUser(function(user, done) {
    //     done(null, user.id);
    // });
    passport.serializeUser(function (user, done) {
        done(null, JSON.stringify(user));
        console.log("HERE!!!!!!" + JSON.stringify(user));
        console.log(user);
        console.log(user.username);
    });


    // used to deserialize the user
    // passport.deserializeUser(function(id, done) {
    //     User.findById(id).then(function(user) {
    //         if(user){
    //             done(null, user.get());
    //         }
    //         else{
    //             done(user.errors,null);
    //         }
    //     });
    //
    // });

    passport.deserializeUser(function (data, done) {
        try {
            done(null, JSON.parse(data));
        } catch (e) {
            done(err)
        }
    });


    passport.use('local-signup', new LocalStrategy(

        {
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },

        function(req, email, password, done){


            var generateHash = function(password) {
                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
            };

            User.findOne({where: {email:email}}).then(function(user){

                if(user)
                {
                    return done(null, false, {message : 'That email is already taken'} );
                }

                else
                {
                    var userPassword = generateHash(password);
                    var data =
                        { email:email,
                            password:userPassword,
                            firstname: req.body.firstname,
                            lastname: req.body.lastname
                        };


                    User.create(data).then(function(newUser,created){
                        if(!newUser){
                            return done(null,false);
                        }

                        if(newUser){
                            return done(null,newUser);

                        }


                    })

                    //mail send

                    // Use at least Nodemailer v4.1.0
                    const nodemailer = require('nodemailer');

                    // Generate SMTP service account from ethereal.email
                    nodemailer.createTestAccount((err, account) => {
                        if (err) {
                            console.error('Failed to create a testing account. ' + err.message);
                            return process.exit(1);
                        }

                        console.log('Credentials obtained, sending message...');

                        // Create a SMTP transporter object
                        const transporter = nodemailer.createTransport({
                            host: 'smtp.ethereal.email',
                            port: 587,
                            auth: {
                                user: 'qx3ylrxvzfdmoaxt@ethereal.email',
                                pass: 'nzwtA7T1Q6Y45DvKDA'
                            }
                        });

                        // Message object
                        let message = {
                            from: 'Александр Молодид <a.molodid@gmail.com>',
                            to: email,
                            subject: 'Подтверждение регистрации ✔',
                            text: 'Добро пожаловать!',
                            html: '<p><b>Добро</b> пожаловать!!!</p>'
                        };

                        transporter.sendMail(message, (err, info) => {
                            if (err) {
                                console.log('Error occurred. ' + err.message);
                                return process.exit(1);
                            }

                            console.log('Message sent: %s', info.messageId);
                            // Preview only available when sending through an Ethereal account
                            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                        });
                    });
                }


            });



        }



    ));

    //LOCAL SIGNIN
    passport.use('local-signin', new LocalStrategy(

        {

            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },

        function(req, email, password, done) {

            var User = user;

            var isValidPassword = function(userpass,password){
                return bCrypt.compareSync(password, userpass);
            }

            User.findOne({ where : { email: email}}).then(function (user) {

                if (!user) {
                    return done(null, false, { message: 'Email does not exist' });
                }

                if (!isValidPassword(user.password,password)) {

                    return done(null, false, { message: 'Incorrect password.' });

                }

                var userinfo = user.get();

                return done(null,userinfo);

            }).catch(function(err){

                console.log("Error:",err);

                return done(null, false, { message: 'Something went wrong with your Signin' });


            });

        }
    ));


    passport.use('vk', new VKontakteStrategy(
        {
            clientID: vk.VK_APP_ID,
            clientSecret: vk.VK_APP_SECRET,
            callbackURL:  "http://192.168.1.9:3000/auth/vk/callback"
        },

        function (accessToken, refreshToken, profile, done) {

            return done(null, {
                username: profile.displayName,
                photoUrl: profile.photos[0].value,
                profileUrl: profile.profileUrl
            });
        }
    ));




}


