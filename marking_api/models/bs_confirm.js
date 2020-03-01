/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('bs_confirm', {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
      autoIncrement: true
      },
      appkey: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: ''
      },
      machine_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: ''
      },
      uuid: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: ''
      },
      template_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: ''
      },
      area: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: ''
      },
      create_at:{
        type: DataTypes.DATE,
        allowNull: true
      },
    },
    {
      timestamps:false,
      tableName: 'bs_confirm'
    });
  };
  