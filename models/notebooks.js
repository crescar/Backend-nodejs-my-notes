'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notebooks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Notebooks.init({
    user_id: DataTypes.INTEGER,
    notebook_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Notebooks',
  });
  return Notebooks;
};