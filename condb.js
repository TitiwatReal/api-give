const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'give_for_child',
  port: 3306,
});

connection.connect((error) => {
  if (error) throw error;
  console.log('Database connected successfully :) !');
});

module.exports = connection;
