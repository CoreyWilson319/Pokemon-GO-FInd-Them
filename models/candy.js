'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class candy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  candy.init({
    candy: DataTypes.INTEGER,
    pokemon_id: DataTypes.INTEGER,
    form: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'candy',
  });
  return candy;
};