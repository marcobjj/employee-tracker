const mysql = require('mysql2');
const cTable = require('console.table');
const inquirer = require('inquirer');


const employeeQuery = `SELECT e1.id, e1.first_name, e1.last_name, role.title AS role_title, role.salary , CONCAT( ifNull(e2.first_name,'') ,' ', ifNull(e2.last_name,'') ) AS manager_name, department.name AS department_name
FROM employee e1 LEFT JOIN employee e2 ON e1.manager_id = e2.id AND e1.manager_id IS NOT NULL
LEFT JOIN role ON e1.role_id = role.id LEFT JOIN department ON role.department_id = department.id`;

const roleQuery = 'SELECT role.id AS role_id, role.title AS role_title, role.salary, department.name AS department_name FROM role LEFT JOIN department ON role.department_id = department.id';

const departmentQuery = 'SELECT * FROM department';

const question1 = {
  type: 'rawlist',
  name: 'action',
  message: 'What would you like to do?',
  choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add New Employee', 'Add New Role', 
  'Add New Department', 'Update Employee Role','Delete Employee','Delete Department','Delete Role',"EXIT"]
}



// inquirer prompt
const promptUser = (questions) => {

  return inquirer.prompt(questions);
};


// questionnaire to delete department, role or employee

const del = (query,table) => {
// stores names for inquirer questionnaire choices
  const resultArray = [];

// stores name/id pairs , the name selection is used to idenfity the id that will used in the DELETE query
  const resultObject = {};

  sqlQuery(query,"json")
  .then(result => {

    result.forEach(element => {

      resultArray.push(element.name);
      resultObject[element.name] = element.id;

    })

    const question1 = {
      type: 'rawlist',
      name: 'id',
      message: `Select the ${table} you would like to delete`,
      choices: resultArray
    }

    promptUser([question1])
    .then(answer => {

      const delete_id = resultObject[answer.id];

      sqlQuery(`DELETE FROM ${table} WHERE id = ${delete_id}`,"json")
      .then(result =>{


        init();

      })


    })

  })
}

// questionnaire to update employee role

const updateEmployeeRole = () => {

  const employeeArray = [];
  const employeeObject = {};

  sqlQuery("SELECT * FROM employee", "json")
    .then(result => {

      result.forEach(element => {

        employeeArray.push(element.first_name + " " + element.last_name);
        employeeObject[element.first_name + " " + element.last_name] = element.id;

      })

      const question1 = {
        type: 'rawlist',
        name: 'employee',
        message: 'Select employee',
        choices: employeeArray
      }

      promptUser([question1])
        .then(answer => {

          const employee_name = answer.employee;
          const employee_id = employeeObject[employee_name];

         const roleArray = [];
         const roleObject = {};

         sqlQuery("SELECT id, title FROM role","json")
         .then(result => {

          result.forEach(element =>{

            roleArray.push(element.title);
            roleObject[element.title] = element.id;

          })

          const question2 = {
            type: 'rawlist',
            name: 'role',
            message: `Select new role for ${employee_name}`,
            choices: roleArray
          }

          promptUser([question2])
          .then(answer => {

            const new_role = answer.role;
            const role_id = roleObject[new_role];

            updateRole(role_id,employee_id)
            .then(result => {

              console.log(result);
              init();
            })
          
          })
          

         })



        })


    })
}

// questionnaire to add new department

const newDepartment = () => {

  const deptQuestions = [{

    type: 'input',
    name: 'name',
    message: "Please enter department name",
    validate: nameInput => nameInput ? true : false
  }]

  promptUser(deptQuestions)
    .then(answers => {

      addDepartment(answers.name)
        .then(result => {

          init();

        })

    })
}

//questionnaire to add new role

const newRole = () => {

  const departmentArray = [];
  const departmentObject = {};

  sqlQuery("SELECT * FROM department", "json")
    .then(dept => {

      dept.forEach(element => {

        departmentArray.push(element.name);
        departmentObject[element.name] = element.id;

      })

      const roleQuestions = [{

        type: 'input',
        name: 'title',
        message: "Please enter role's title",
        validate: nameInput => nameInput ? true : false
      },
      {
        type: 'input',
        name: 'salary',
        message: "Please enter role's salary",
        validate: nameInput => nameInput ? true : false
      },
      {
        type: 'rawlist',
        name: 'department',
        message: 'Select department',
        choices: departmentArray
      }]

      promptUser(roleQuestions)
        .then(answers => {

          const dept_id = departmentObject[answers.department];

          addRole(answers.title, answers.salary, dept_id)
            .then(result => {

              init();

            })

        })

    })
}

// questionnaire to add new employee

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

      sqlQuery("SELECT first_name, last_name, id FROM employee", "json")
        .then(manager => {

          manager.forEach(element => {

            managerArray.push(element.first_name + " " + element.last_name + " - ID: " + element.id);
            managerObject[element.first_name + " " + element.last_name + " - ID: " + element.id] = element.id;

          })

          managerArray.splice(0,0,"No One");
          managerObject["No One"] = null;

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

              addEmployee(data.first_name, data.last_name, role_id, manager_id)
                .then(result => {

                  // console.log(result);
                  init();

                })



            })



        })

    }

    );



}

//initiate app

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
        case "Add New Role":
          newRole();
          return null;
        case "Add New Department":
          newDepartment();
          return null;
        case "Update Employee Role":
          updateEmployeeRole();
          return null;
        case "Delete Employee":
          del("SELECT CONCAT(first_name,' ',last_name) AS name, id FROM employee","employee");
          return null;
        case "Delete Department":
          del("SELECT name, id FROM department","department");
          return null;
        case "Delete Role":
          del("SELECT id, title AS name FROM role","role");
          return null;
        case "EXIT":
          console.log("bye!");
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

// general query function
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

// query to add department
const addDepartment = name => {

  return new Promise((resolve, reject) => {

    const query = "INSERT INTO department (name) VALUES (?)"

    connection.query(query, name,
      function (err, results) {
        if (err) reject(err);
        resolve(results);

      }
    );
  })
}

// query to add employee
const addEmployee = (first_name, last_name, role_id, manager_id) => {

  return new Promise((resolve, reject) => {

    const query = "INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)";

    connection.query(query, [first_name, last_name, role_id, manager_id],
      function (err, results) {
        if (err) reject(err);
        resolve(results);

      }
    );
  })
}

//query to add role

const addRole = (title, salary, department_id) => {

  return new Promise((resolve, reject) => {

    const query = "INSERT INTO role (title,salary,department_id) VALUES (?,?,?)";

    connection.query(query, [title, salary, department_id],
      function (err, results) {

        if (err) reject(err);
        resolve(results);

      }
    );
  })
}

//query to update employee role
const updateRole = (newRoleID, employeeID) => {

  return new Promise((resolve, reject) => {
  const query = "UPDATE employee SET role_id = ? WHERE id = ?";
  
  connection.query(query, [newRoleID, employeeID],
    function (err, results) {
      if(err) reject(err);
      resolve(results);

    }
  );
  })
}

init();







