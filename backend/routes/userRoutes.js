const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/', userController.createUser);
router.get('/', userController.getUser);
router.get("/:id/permissions", userController.getUserPermissions);
router.put("/:id/assign-role", userController.assignRoleToUser);
router.get('/:id', userController.getUser);
router.put('/:id', userController.editUser);
router.delete('/:id', userController.removeUser);
router.post('/check', userController.checkUserByEmail);


module.exports = router;