const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

router.get('/', roleController.getRoles);
router.post('/', roleController.addRole);
router.delete('/:roleName', roleController.deleteRole);
router.put('/:roleName/permissions', roleController.updateRolePermissions);
router.get('/:roleName/permissions', roleController.getRolePermissions);
router.put('/edit-name', roleController.editRoleName);

module.exports = router;
