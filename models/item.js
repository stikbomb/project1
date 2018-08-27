module.exports = function(sequelize, Sequelize) {

    var Content = sequelize.define('content', {

        content: {
            type: Sequelize.TEXT,
            notEmpty: true
        },
        title: {
            type: Sequelize.TEXT,
            notEmpty: true
        },
        slug: {
            type: Sequelize.STRING,
            notEmpty: true
        }
    });

    return Content;

};