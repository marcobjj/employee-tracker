INSERT INTO department (name)
VALUES
("Sales"),
("Finance"),
("Engineering");

INSERT INTO role (title,salary,department_id)
VALUES
("Lead Engineer",90000,3),
("Software Engineer",60000,3),
("Junior Engineer",40000,3),
("Underwriter",40000,2),
("Underwriting Manager",85000,2),
("Sales Associate",35000,1),
("Sales Manager",65000,1);

INSERT INTO employee (first_name,last_name,role_id,manager_id)
VALUES
("Jack","Nance",7,NULL),
("Miguel","Ferrer",5,NULL),
("Michael","Ontkean",1,NULL);
