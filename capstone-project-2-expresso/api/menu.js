const express = require('express');
const menuItemRouter = require('./menuitem');
const dbaccess = require('./helpers/dbaccess');

// Router that will server the /api/menus routes
const menuRouter = express.Router();
module.exports = menuRouter;

// Delegate /api/menus/:menuId/menu-items to a child router
menuRouter.use('/:menuId/menu-items', menuItemRouter);

// ***************************************
// DML for Menu table
// ***************************************

// Retrieve an menu by id
const retrieveMenuByIdQuery = 
    "select * from Menu where id = $id;";

// Retrieve all menus
const retrieveAllMenusQuery = 
    "select * from Menu;";

// Insert a menu
const insertMenuCommand = 
    "insert into Menu (title) " +
    " values ($title);";

// Update a menu
const updateMenuCommand =
    "update Menu set " +
    "        title = $title " +
    "    where id = $id;";

// Count number of menu items of a menu
const countMenuItemsOfAMenuQuery =
    "select count(*) as nbrMenuItem from MenuItem " + 
    " where menu_id = $menuId;";

// Delete a menu
const deleteMenuCommand =
    "delete from Menu where id = $id;";

// ***************************************
// Manage the menus routes
// ***************************************

// If a menuId is in the request parameter then retrieve the menu 
// and populate the query with the menu
menuRouter.param("menuId", (req, res, next, menuId) => {
    dbaccess.retrieveRowById(
        retrieveMenuByIdQuery, menuId, 'menu', 
        req, res, next
    );
});

// Retrieve all menus
menuRouter.get('/', (req, res, next) => {
    dbaccess.getAllRows(retrieveAllMenusQuery, undefined, 'menus', res);
});

// Retrieve a specific menu
menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).send({ menu : req.menu });
});

// Check if the information about an menu is complete
const isValidMenu = menu => 
    menu &&
    menu.title;

// Insert a menu
menuRouter.post('/', (req, res, next) => {
    const menu = req.body.menu;
    if(isValidMenu(menu)) {
        dbaccess.addRow(
            insertMenuCommand, {
                $title : menu.title
            }, 
            retrieveMenuByIdQuery, 'menu', res
        );
    } else {
        res.status(400).send();
    }
});

// Update a menu
menuRouter.put('/:menuId', (req, res, next) => {
    var menu = req.body.menu;
    if(isValidMenu(menu)) {
        dbaccess.updateRow(
            updateMenuCommand, {
                $id : req.menu.id,
                $title : menu.title
            }, 
            retrieveMenuByIdQuery, 'menu', res
        );
    } else {
        res.status(400).send();
    }
});

// Delete a menu (but only if it has no related menu items)
menuRouter.delete('/:menuId', (req, res, next) => {
    // count the related menu items
    dbaccess.executeScalar(
        countMenuItemsOfAMenuQuery, {
            $menuId : req.menu.id
        },
        res, 'nbrMenuItem', nbrMenuItem => {
            if(nbrMenuItem == 0) {
                // there are no related menu items
                // then we can remove the menu
                dbaccess.deleteRow(
                    deleteMenuCommand, { 
                        $id : req.menu.id 
                    }, 
                    res
                );
            } else {
                // there are related menu items
                // we can't remove the menu
                res.status(400).send();
            }
        }
    );
});
