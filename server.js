const mysql = require('mysql2');
const cTable = require('console.table');


const employeeQuery =     `SELECT e1.id, e1.first_name, e1.last_name, role.title AS role_title, role.salary , ifNull(e2.first_name,'') AS manager_firstname , ifNull(e2.last_name,'') AS manager_lastname, department.name AS department_name
FROM employee e1 LEFT JOIN employee e2 ON e1.manager_id = e2.id AND e1.manager_id IS NOT NULL
LEFT JOIN role ON e1.role_id = role.id LEFT JOIN department ON role.department_id = department.id`;

const roleQuery = 'SELECT role.*, department.name AS department_name FROM role LEFT JOIN department ON role.department_id = department.id';

const departmentQuery = 'SELECT * FROM department';


 
// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'track',
  password:'manhoefKO'
});


const sqlQuery = (query,json=null) =>
{
    return new Promise((resolve, reject) => {
    connection.query(query,
    function(err, results) {

      if (err) reject(err);

      if (json) {
      resolve(results);
      }
      else
      {
      const table = cTable.getTable(results);

      resolve(console.log(table));
      }
     
    }
  );
})

}

const addDepartment = name => {

    const query = "INSERT INTO department (name) VALUES (?)"
    connection.query(query, name,
        function(err, results) {
         
          console.log(results);
         
        }
      );
}

const addEmployee = (first_name,last_name,role_id,manager_id) => {

    const query = "INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)";
    connection.query(query, [first_name,last_name,role_id,manager_id],
        function(err, results) {
         
          console.log(results);
         
        }
      );
}

const addRole = (title,salary,department_id) => {
    const query = "INSERT INTO role (title,salary,department_id) VALUES (?,?,?)";
    connection.query(query, [title,salary,department_id],
        function(err, results) {
         
          console.log(results);
         
        }
      );

}

const updateRole = (newRoleID,employeeID) => {

    const query = "UPDATE employee SET role_id = ? WHERE id = ?";
    connection.query(query, [newRoleID,employeeID],
        function(err, results) {
         
          console.log(results);
         
        }
      );

}



//updateRole(8,8);

//addRole("Attorney General","120000",4);

//addEmployee("Richard","Beymer",8,null);

sqlQuery(departmentQuery,"json")
.then(row => {console.log(JSON.parse(JSON.stringify(row)))})




  


 