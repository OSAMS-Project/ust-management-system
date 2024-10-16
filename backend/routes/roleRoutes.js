const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

router.get('/', roleController.getRoles);
router.post('/', roleController.addRole);
router.delete('/:roleName', roleController.deleteRole);

module.exports = router;