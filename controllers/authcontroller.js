

exports.signup = function(req, res) {

    res.render('./guest/signup');

};

exports.signin = function(req, res) {

    res.render('./guest/signin');

};

exports.index = function(req, res) {
    res.render('./user/index');
};


exports.admin = function(req, res) {

    res.render('./admin/main');
};

exports.adminadd = function(req, res) {

    res.render('./admin/add');
};
exports.slug = function(req, res) {

    res.render('slug');
};

exports.logout = function(req, res, ) {

    req.session.destroy(function(err) {

        res.redirect('/');

    });

};