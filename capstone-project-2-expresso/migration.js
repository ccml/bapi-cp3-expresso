const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// ***************************************
// DDL for the database creations
// ***************************************

// The Employee table
const dropTableEmployeeDDL = "drop table if exists Employee;";
const createTableEmployeeDDL = 
  "create table Employee ( " +
  "    id integer not null, " +
  "    name text not null, " +
  "    position text not null, " +
  "    wage text not null, " +
  "    is_current_employee integer default 1, " +
  "    primary key(id) " + 
  ");";

// The Timesheet table
const dropTableTimesheet = "drop table if exists Timesheet;";
const createTableTimesheetDDL = 
  "create table Timesheet ( " +
  "    id integer not null, " +
  "    hours integer not null, " +
  "    rate integer not null, " +
  "    date integer not null, " +
  "    employee_id integer not null, " +
  "    primary key(id), " + 
  "    foreign key(employee_id) references Epmloyee(id) " +
  ");";

// The Menu table
const dropTableMenuDDL = "drop table if exists Menu;";
const createTableMenuDDL = 
  "create table Menu ( " +
  "    id integer not null, " +
  "    title text not null, " +
  "    primary key(id) " + 
  ");";

// The MenuItem table
const dropTableMenuItemDDL = "drop table if exists MenuItem;";
const createTableMenuItemDDL = 
  "create table MenuItem ( " +
  "    id integer not null, " +
  "    name text not null, " +
  "    description text not null, " +
  "    inventory text not null, " +
  "    price integer not null, " +
  "    menu_id integer not null, " +
  "    primary key(id), " + 
  "    foreign key(menu_id) references Menu(id) " +
  ");";

// ***************************************
// Execute all the DDL to setup the database
// ***************************************

db.serialize(() => {
  db.run(dropTableEmployeeDDL);
  db.run(createTableEmployeeDDL);
  db.run(dropTableTimesheet);
  db.run(createTableTimesheetDDL);
  db.run(dropTableMenuDDL);
  db.run(createTableMenuDDL);
  db.run(dropTableMenuItemDDL);
  db.run(createTableMenuItemDDL);
});
