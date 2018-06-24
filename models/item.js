module.exports = function(sequelize, Sequelize) {

    var Item = sequelize.define('item', {

        content: {
            type: Sequelize.STRING,
            notEmpty: true
        }


    });

    return Item;

}