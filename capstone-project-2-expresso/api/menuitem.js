const express = require('express');
const dbaccess = require('./helpers/dbaccess');

// Router that will be used to serve /api/menus/:menuId/menu-items routes
const menuItemRouter = express.Router({ mergeParams: true });
module.exports = menuItemRouter;

// ***************************************
// DML for MenuItem table
// ***************************************

// Retrieve a menu item by id
const retrieveMenuItemByIdQuery = 
    "select * from MenuItem where id = $id;";

// Retrieve all menu items of a menu
const retrieveAllMenuItemsOfAMenuQuery = 
    "select * from MenuItem where menu_id = $menuId;";

// Insert a menu item
const insertMenuItemCommand = 
    "insert into MenuItem (name, description, inventory, price, menu_id) " +
    " values ($name, $description, $inventory, $price, $menu_id);";

// Update a menu item
const updateMenuItemCommand =
    "update MenuItem set " +
    "        name = $name, " +
    "        description = $description, " +
    "        inventory = $inventory, " +
    "        price = $price " +
    "    where id = $id;";

// Delete a menu item
const deleteMenuItemCommand =
    "delete from MenuItem where id = $id;";

// ***************************************
// Manage the menu-items routes
// ***************************************

// If a menuItemId is in the request parameter then retrieve the menu item 
// and populate the query with the menu item
menuItemRouter.param("menuItemId", (req, res, next, menuItemId) => {
    dbaccess.retrieveRowById(
        retrieveMenuItemByIdQuery, menuItemId, 'menuItem', 
        req, res, next
    );
});

// Retrieve all menu items of a menu
menuItemRouter.get('/', (req, res, next) => {
    dbaccess.getAllRows(
        retrieveAllMenuItemsOfAMenuQuery, {
            $menuId : req.menu.id
        }, 
        'menuItems', res);
});

// Retrieve a specific menu item
menuItemRouter.get('/:menuItemId', (req, res, next) => {
    res.status(200).send({ menuItem : req.menuItem });
});

// Check if the information of a menu item is complete
const isValidMenuItem = menuItem => 
    menuItem &&
    menuItem.name &&
    menuItem.description &&
    menuItem.inventory &&
    menuItem.price;

// Insert a menu item
menuItemRouter.post('/', (req, res, next) => {
    const menuItem = req.body.menuItem;
    if(isValidMenuItem(menuItem)) {
        dbaccess.addRow(
            insertMenuItemCommand, {
                $name : menuItem.name,
                $description : menuItem.description,
                $inventory : menuItem.inventory,
                $price : menuItem.price,
                $menu_id : req.menu.id
            }, 
            retrieveMenuItemByIdQuery, 'menuItem', res
        );
    } else {
        res.status(400).send();
    }
});

// Update a menu item
menuItemRouter.put('/:menuItemId', (req, res, next) => {
    var menuItem = req.body.menuItem;
    if(isValidMenuItem(menuItem)) {
        dbaccess.updateRow(
            updateMenuItemCommand, {
                $id : req.menuItem.id,
                $name : menuItem.name,
                $description : menuItem.description,
                $inventory : menuItem.inventory,
                $price : menuItem.price
            }, 
            retrieveMenuItemByIdQuery, 'menuItem', res
        );
    } else {
        res.status(400).send();
    }
});

// Delete a menu item
menuItemRouter.delete('/:menuItemId', (req, res, next) => {
    dbaccess.deleteRow(
        deleteMenuItemCommand, { 
            $id : req.menuItem.id 
        },
        res
    );
});
