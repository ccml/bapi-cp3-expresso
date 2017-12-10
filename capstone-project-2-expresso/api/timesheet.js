const express = require('express');
const dbaccess = require('./helpers/dbaccess');

// Router that will be used to serve /api/employees/:employeeId/Timesheets routes
const timesheetRouter = express.Router({ mergeParams: true });
module.exports = timesheetRouter;

// ***************************************
// DML for Timesheet table
// ***************************************

// Retrieve a timesheet by id
const retrieveTimesheetByIdQuery = 
"select * from Timesheet where id = $id;";

// Retrieve all timesheet of an employee
const retrieveAllTimesheetOfAnEmployeeQuery = 
"select * from Timesheet where employee_id = $employeeId;";

// Insert a timesheet
const insertTimesheetCommand = 
    "insert into Timesheet (hours, rate, date, employee_id) " +
    " values ($hours, $rate, $date, $employee_id);";

// Update a timesheet
const updateTimesheetCommand =
    "update Timesheet set " +
    "        hours = $hours, " +
    "        rate = $rate, " +
    "        date = $date " +
    "    where id = $id;";

// Delete a timesheet
const deleteTimesheetCommand =
    "delete from Timesheet where id = $id;";

// ***************************************
// Manage the timesheet routes
// ***************************************

// If a timesheetId is in the request parameter then retrieve the timesheet 
// and populate the query with the timesheet
timesheetRouter.param("timesheetId", (req, res, next, timesheetId) => {
    dbaccess.retrieveRowById(
        retrieveTimesheetByIdQuery, timesheetId, 'timesheet', 
        req, res, next
    );
});

// Retrieve all timesheets of an employee
timesheetRouter.get('/', (req, res, next) => {
    dbaccess.getAllRows(
        retrieveAllTimesheetOfAnEmployeeQuery, {
            $employeeId : req.employee.id
        }, 
        'timesheets', res);
});

// Retrieve a specific timesheet
timesheetRouter.get('/:timesheetId', (req, res, next) => {
    res.status(200).send({ timesheet : req.timesheet });
});

// Check if the information of a timesheet is complete
const isValidTimesheet = timesheet => 
    timesheet &&
    timesheet.hours &&
    timesheet.rate &&
    timesheet.date;

// Insert a timesheet
timesheetRouter.post('/', (req, res, next) => {
    const timesheet = req.body.timesheet;
    if(isValidTimesheet(timesheet)) {
        dbaccess.addRow(
            insertTimesheetCommand, {
                $hours : timesheet.hours,
                $rate : timesheet.rate,
                $date : timesheet.date,
                $employee_id : req.employee.id
            }, 
            retrieveTimesheetByIdQuery, 'timesheet', res
        );
    } else {
        res.status(400).send();
    }
});

// Update a timesheet
timesheetRouter.put('/:timesheetId', (req, res, next) => {
    var timesheet = req.body.timesheet;
    if(isValidTimesheet(timesheet)) {
        dbaccess.updateRow(
            updateTimesheetCommand, {
                $id : req.timesheet.id,
                $hours : timesheet.hours,
                $rate : timesheet.rate,
                $date : timesheet.date
            }, 
            retrieveTimesheetByIdQuery, 'timesheet', res
        );
    } else {
        res.status(400).send();
    }
});

// Delete a timesheet
timesheetRouter.delete('/:timesheetId', (req, res, next) => {
    dbaccess.deleteRow(
        deleteTimesheetCommand, { 
            $id : req.timesheet.id 
        },
        res
    );
});
