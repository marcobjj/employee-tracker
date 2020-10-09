// get the client
const mysql = require('mysql2');
 
// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'track',
  password:'manhoefKO'
});

// connection.query(
//     'SELECT role.*, department.name AS department_name FROM role LEFT JOIN department ON role.department_id = department.id',
//     function(err, results) {
//       console.log(results);
//       console.log(err);
//     }
//   );

  connection.query(
    'SELECT role.*, department.name AS department_name FROM role LEFT JOIN department ON role.department_id = department.id',
    function(err, results) {
      console.log(results);
      console.log(err);
    }
  );

connection.on("open", () => {console.log("connected!")});

 