/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bs_city', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement:true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    province_code:{
      type: DataTypes.INTEGER(6),
      allowNull: false,
      allowNull: false
    }
  },
  {
    timestamps:false,
    tableName: 'bs_city'
  });
};
