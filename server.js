const mysql = require('mysql2');
const cTable = require('console.table');
const inquirer = require('inquirer');


const employeeQuery = `SELECT e1.id, e1.first_name, e1.last_name, role.title AS role_title, role.salary , ifNull(e2.first_name,'') AS manager_firstname , ifNull(e2.last_name,'') AS manager_lastname, department.name AS department_name
FROM employee e1 LEFT JOIN employee e2 ON e1.manager_id = e2.id AND e1.manager_id IS NOT NULL
LEFT JOIN role ON e1.role_id = role.id LEFT JOIN department ON role.department_id = department.id`;

const roleQuery = 'SELECT role.id AS role_id, role.title AS role_title, role.salary, department.name AS department_name FROM role LEFT JOIN department ON role.department_id = department.id';

const departmentQuery = 'SELECT * FROM department';


// {
//   type: 'input',
//   name: 'email',
//   message: 'Please enter your email address',
//   validate: nameInput => nameInput? true : false
//    },
//    {
//   type: 'rawlist',
//   name: 'license',
//   message: 'Enter your license',
//   choices: ['Apache v2.0', 'MIT License','GNU General Public License v3.0','Mozilla Public License 2.0']
//    }
// ];

const question1 = {
  type: 'rawlist',
  name: 'action',
  message: 'What would you like to do?',
  choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add New Employee']
}



// inquirer prompt
const promptUser = (questions) => {

  return inquirer.prompt(questions);
};

const newEmployee = () => {

  const rolesArray = [];
  const rolesObject = {};
  const managerArray = [];
  const managerObject = {};

  sqlQuery("SELECT role.title, role.id FROM role", "json")
    .then(roles => {

      roles.forEach(element => {

        rolesArray.push(element.title);
        rolesObject[element.title] = element.id;

      });

      // console.log(rolesArray,rolesObject,rolesObject["Underwriter"]);

      sqlQuery("SELECT first_name, last_name, id FROM employee", "json")
        .then(manager => {

          manager.forEach(element => {

            managerArray.push(element.first_name + " " + element.last_name + " - ID: " + element.id);
            managerObject[element.first_name + " " + element.last_name + " - ID: " + element.id] = element.id;

          })

          // console.log(managerArray,managerObject);

          const employeeQuestions = [{

            type: 'input',
            name: 'first_name',
            message: "Please enter employee's first name",
            validate: nameInput => nameInput ? true : false
          },
          {
            type: 'input',
            name: 'last_name',
            message: "Please enter employee's last name",
            validate: nameInput => nameInput ? true : false
          },
          {
            type: 'rawlist',
            name: 'role',
            message: 'Select employee role',
            choices: rolesArray
          },
          {
            type: 'rawlist',
            name: 'manager',
            message: "Select employee's manager",
            choices: managerArray
          }

          ];

          promptUser(employeeQuestions)
          .then(data => {
           
           // console.log(data)

           const role_id = rolesObject[data.role];
           const manager_id = managerObject[data.manager];

           addEmployee(data.first_name,data.last_name,role_id,manager_id)
           .then(result => {

              console.log(result);
              init();

           })
          
          
          
          })



        })

    }

    );



}

const init = () => {

  const q = [question1];

  promptUser(q)
    .then(data => {

      let newquery = null;

      switch (data.action) {
        case "View All Departments":
          newquery = departmentQuery;
          break;
        case "View All Employees":
          newquery = employeeQuery;
          break;
        case "View All Roles":
          newquery = roleQuery;
          break;
        case "Add New Employee":
          newEmployee();
          return null;

      }

      return sqlQuery(newquery);

    })
    .then(table => {

      if (!table) return

      console.log("                   ");
      console.log(table);
      init();

    })
}

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'track',
  password: 'manhoefKO'
});


const sqlQuery = (query, json = null) => {
  return new Promise((resolve, reject) => {
    connection.query(query,
      function (err, results) {

        if (err) reject(err);

        if (json) {
          resolve(results);
        }
        else {
          const table = cTable.getTable(results);

          resolve(table);
        }

      }
    );
  })

}

const addDepartment = name => {

  const query = "INSERT INTO department (name) VALUES (?)"
  connection.query(query, name,
    function (err, results) {

      console.log(results);

    }
  );
}

const addEmployee = (first_name, last_name, role_id, manager_id) => {

  return new Promise((resolve, reject) => {

  const query = "INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)";
  connection.query(query, [first_name, last_name, role_id, manager_id],
    function (err, results) {
      if(err) reject(err);
      resolve(results);

    }
  );
  })
}

const addRole = (title, salary, department_id) => {
  const query = "INSERT INTO role (title,salary,department_id) VALUES (?,?,?)";
  connection.query(query, [title, salary, department_id],
    function (err, results) {

      console.log(results);

    }
  );

}

const updateRole = (newRoleID, employeeID) => {

  const query = "UPDATE employee SET role_id = ? WHERE id = ?";
  connection.query(query, [newRoleID, employeeID],
    function (err, results) {

      console.log(results);

    }
  );

}

init();

//updateRole(8,8);

//addRole("Attorney General","120000",4);

//addEmployee("Richard","Beymer",8,null);

//sqlQuery(departmentQuery,"json")
//.then(row => {console.log(JSON.parse(JSON.stringify(row)))})







