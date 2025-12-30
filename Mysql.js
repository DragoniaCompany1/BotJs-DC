const MySQL = require("mysql");
const config = require("./config.json")

let Mysql = MySQL.createPool(config.mysql)
Mysql.getConnection((err, connect) => {
    if(connect) return console.log("[MYSQL]: Database MySql telah berhasil terhubung!");
    console.log("[MYSQL]: Database MySql tidak dapat terhubung!")
})

module.exports = Mysql;