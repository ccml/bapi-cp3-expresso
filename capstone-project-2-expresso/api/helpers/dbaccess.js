const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// This function allow to retrieve a single based on its id.
//
// Parameters are :
//   - query : The query that retrieve the row. It must use the $id parameter
//             to match the id of the row.
//   - id : The value of the id.
//   - propertyName : The name of the property of the body response that must be 
//                    populated with the result of the query.
//   - req, res, next : the standard parameters of an express middleware.
exports.retrieveRowById = (query, id, propertyName, req, res, next) => {
    db.get(query, { $id : id }, (err, row) => {
        if(err) {
            res.status(500).send();
        } else {
            if(row) {
                req[propertyName] = row;
                next();
            } else {
                res.status(404).send();
            }
        }
    });
};

// This function retrieve a list of rows.
//
// Parameters are :
//   - query : The query that retrieve the rows.
//   - data : An object that contains the parameters values for the query.
//   - propertyName : The name of the property of the body response that must be 
//                    populated with the result of the query.
//   - res : The response object of the express middleware
exports.getAllRows = (query, data, propertyName, res) => {
    db.all(query, data, (err, rows) => {
        if(err) {
            res.status(500).send();
        } else {
            var responseData = {};
            responseData[propertyName] = rows;
            res.status(200).send(responseData);
        }
    });
};

// This function insert a new row.
//
// Parameters are :
//   - command : The insert command to execute.
//   - data : An object that contains the parameters values for the insert.
//   - query : The query that will be used to retrieve the inserted row.
//             It must use the $id parameter to match the id of the row.
//   - propertyName : The name of the property of the body response that must be 
//                    populated with the inserted row.
//   - res : The response object of the express middleware
exports.addRow = (command, data, query, propertyName, res) => {
    db.run(command, data, function(err) {
        if(err) {
            res.status(500).send();
        } else {
            db.get(query, { $id : this.lastID }, (err, row) => {
                var responseData = {};
                responseData[propertyName] = row;
                res.status(201).send(responseData);
            });
        }
    });
};

// This function update an existing row.
//
// Parameters are :
//   - command : The update command to execute.
//   - data : An object that contains the parameters values for the update.
//   - query : The query that will be used to retrieve the updated row.
//             It must use the $id parameter to match the id of the row.
//   - propertyName : The name of the property of the body response that must be 
//                    populated with the updated row.
//   - res : The response object of the express middleware
exports.updateRow = (command, data, query, propertyName, res) => {
    db.run(command, data, (err) => {
        if(err) {
            res.status(500).send();
        } else {
            db.get(query,{ $id : data.$id }, (err, row) => {
                if(err) {
                    res.status(500).send();
                } else {
                    var responseData = {};
                    responseData[propertyName] = row;
                    res.status(200).send(responseData);
                }
            });    
        }
    });
};

// This function delete an existing row.
//
// Parameters are :
//   - command : The delete command to execute.
//   - data : An object that contains the parameters values for the delete.
//   - res : The response object of the express middleware
exports.deleteRow = (command, data, res) => {
    db.run(command, data, (err) => {
        if(err) {
            res.status(500).send();
        } else {
            res.status(204).send();
        }
    });
};

// This function execute a scalar query and then execute a callback 
// with the result of the query.
//
// Parameters are :
//   - query : The scalar query to execute.
//   - data : An object that contains the parameters values for the query.
//   - res : The response object of the express middleware
//   - fieldName : The name field of the row that must be passed to the callback.
exports.executeScalar = (query, data, res, fieldName, callback) => {
    db.get(query, data, (err, row) => {
        if(err) {
            res.status(500).send();
        } else {
            callback(row[fieldName]);
        }
    })
}
