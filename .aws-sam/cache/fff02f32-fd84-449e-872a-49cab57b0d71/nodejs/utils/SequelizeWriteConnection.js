const { Sequelize, QueryTypes, DataTypes } = require('sequelize');
const CURRENT_LAMBDA_FUNCTION_TIMEOUT = 60;
const Op = Sequelize.Op;

let database = process.env.DB_NAME
let  host = process.env.DB_HOST
let port = process.env.DB_PORT
let user = process.env.DB_USER
let password = process.env.DB_PASSWORD 


const sequelize = new Sequelize( database, user, password, {
    host: host,
    dialect: 'mysql',
    logging: console.log,
    port: port,
    define: {
      freezeTableName: true,
      timestamps: true, // true by default
      
    },
    pool: {
        max: parseInt(process.env.LIMIT),
        min: 0,
        idle: 0,
        acquire: 10000,
        evict: CURRENT_LAMBDA_FUNCTION_TIMEOUT
  },

});

module.exports = {
  sequelize,
  QueryTypes,
  Sequelize,
  DataTypes
};