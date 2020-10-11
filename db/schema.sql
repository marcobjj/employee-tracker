DROP DATABASE IF EXISTS track;
CREATE DATABASE track;
USE track;

DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS department;


CREATE TABLE department (

    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE role (

  id INT NOT NULL AUTO_INCREMENT,
title VARCHAR(30),
salary DECIMAL,
department_id INTEGER,
CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE,
PRIMARY KEY(id)

);

CREATE TABLE employee (

    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INTEGER,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
    manager_id INTEGER NULL,
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) references employee(id) ON DELETE SET NULL,
    PRIMARY KEY(id)
);