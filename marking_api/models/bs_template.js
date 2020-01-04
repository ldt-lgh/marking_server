/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bs_template', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement:true
    },
    area: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    template_style: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: ''
    },
    template_pos:{
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status:{
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: 0
    },
    creator_id:{
      type: DataTypes.INTEGER(11),
    },
    modified_id:{
      type: DataTypes.INTEGER(11),
    },
    create_at:{
      type: DataTypes.DATE,
      allowNull: true
    },
    modified_at:{
      type: DataTypes.DATE,
      allowNull: true
    },
    is_del:{
      type: DataTypes.INTEGER(4),
    }
  },
  {
    timestamps:false,
    tableName: 'bs_template'
  });
};
