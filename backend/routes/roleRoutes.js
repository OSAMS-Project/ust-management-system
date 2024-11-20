const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

router.get('/', roleController.getRoles);
router.post('/', roleController.addRole);
router.delete('/:roleName', roleController.deleteRole);
router.put('/:roleName/permissions', roleController.updateRolePermissions);
router.get('/:roleName/permissions', roleController.getRolePermissions);
// Add this route to your roles API
router.get('/permissions/:role', async (req, res) => {
    const { role } = req.params;
    try {
      const permissions = await getRolePermissions(role);
      res.status(200).json({ permissions });
    } catch (err) {
      console.error("Error fetching permissions:", err);
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  });
  

module.exports = router;
