const express = require('express');
const timesheetRouter = require('./timesheet');
const dbaccess = require('./helpers/dbaccess');

// Router that will be used to serve /api/employees routes
const employeeRouter = express.Router();
module.exports = employeeRouter;

// Delegate /api/employees/:employeeId/timesheets to a child router
employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

// ***************************************
// DML for Employee table
// ***************************************

// Retrieve an employee by id
const retrieveEmployeeByIdQuery = 
    "select * from Employee where id = $id;";

// Retrieve all current employees
const retrieveAllCurrentEmployeesQuery = 
    "select * from Employee where is_current_employee = 1;";

// Insert an employee
const insertEmployeeCommand = 
    "insert into Employee (name, position, wage, is_current_employee) " +
    " values ($name, $position, $wage, $is_current_employee);";

// Update an employee
const updateEmployeeCommand =
    "update Employee set " +
    "        name = $name, " +
    "        position = $position, " +
    "        wage = $wage, " +
    "        is_current_employee = $is_current_employee " +
    "    where id = $id;";

// Delete an employee
const deleteEmployeeCommand =
    "update Employee set " +
    "        is_current_employee = 0 " +
    "    where id = $id;";

// ***************************************
// Manage the employees routes
// ***************************************

// If an employeeId is in the request parameter then retrieve the employee 
// and populate the query with the employee
employeeRouter.param("employeeId", (req, res, next, employeeId) => {
    dbaccess.retrieveRowById(
        retrieveEmployeeByIdQuery, employeeId, 'employee', 
        req, res, next
    );
});

// Retrieve all current employee
employeeRouter.get('/', (req, res, next) => {
    dbaccess.getAllRows(retrieveAllCurrentEmployeesQuery, undefined, 'employees', res);
});

// Retrieve a specific employee
employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).send({ employee : req.employee });
});

// Check if the information about an employee is complete
const isValidEmployee = employee => 
    employee &&
    employee.name &&
    employee.position &&
    employee.wage;

// Insert an employee
employeeRouter.post('/', (req, res, next) => {
    const employee = req.body.employee;
    if(isValidEmployee(employee)) {
        if(employee.is_current_employee == undefined) {
            employee.is_current_employee = 1;
        }
        dbaccess.addRow(
            insertEmployeeCommand, {
                $name : employee.name,
                $position : employee.position,
                $wage : employee.wage,
                $is_current_employee : employee.is_current_employee
            }, 
            retrieveEmployeeByIdQuery, 'employee', res
        );
    } else {
        res.status(400).send();
    }
});

// Update an employee
employeeRouter.put('/:employeeId', (req, res, next) => {
    var employee = req.body.employee;
    if(isValidEmployee(employee)) {
        if(employee.is_current_employee == undefined) {
            employee.is_current_employee = req.employee.is_current_employee;
        }
        dbaccess.updateRow(
            updateEmployeeCommand, {
                $id : req.employee.id,
                $name : employee.name,
                $position : employee.position,
                $wage : employee.wage,
                $is_current_employee : employee.is_current_employee
            }, 
            retrieveEmployeeByIdQuery, 'employee', res
        );
    } else {
        res.status(400).send();
    }
});

// Delete an employee
employeeRouter.delete('/:employeeId', (req, res, next) => {
    dbaccess.updateRow(
        deleteEmployeeCommand, { 
            $id : req.employee.id 
        }, 
        retrieveEmployeeByIdQuery, 'employee', res);
});
