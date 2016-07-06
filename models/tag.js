"use strict";

module.exports = function(sequelize, DataTypes) {
  var Tag = sequelize.define("Tag", {
    area : DataTypes.STRING(200),
    signType: DataTypes.STRING(200),
    tagId: {
        type: DataTypes.STRING(200),
        allowNull: false,
        primaryKey: true
    },
    assetId: {
        type: DataTypes.STRING(200),
        allowNull: false
    },  
    address: { type: DataTypes.STRING(200) },
    lat: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    lon: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
  });
  return Tag;
};