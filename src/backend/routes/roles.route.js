const express = require('express');
const router = express.Router();
const roleService = require('../services/roles.service');
const verifyToken = require('../middleware/authMiddleware');
const dynamicAuthorize = require('../middleware/dynamic-authorize'); 


router.use(verifyToken);

router.get('/GetAllRoles', dynamicAuthorize, async (req, res) => {
    try {
        const allRoles = await roleService.getAllRoles();
        res.status(200).json(allRoles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post('/CreateRole', dynamicAuthorize, async (req, res) => {
    const {roleName, description, createdUserId} = req.body;
    try {
        const newRole = await roleService.createRole(roleName, description, createdUserId);
        res.status(201).json(newRole);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.put('/UpdateRoleById/:id', dynamicAuthorize, async (req, res) => {
    const {id} = req.params;
    const { roleName, description } = req.body;
    try {
        const updatedRole = await roleService.updateRole(id, roleName, description);
        res.status(200).json(updatedRole);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.delete('/DeleteRoleById/:id', dynamicAuthorize, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRole = await roleService.deleteRole(id); 
        res.status(200).json(deletedRole);  
    } catch (error) {
        res.status(400).json({ error: error.message });  
    }
});

module.exports = router;
