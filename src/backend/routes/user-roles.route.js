const express = require('express');
const router = express.Router();
const userRoleService = require('../services/user-roles.service');
const verifyToken = require('../middleware/authMiddleware');
const dynamicAuthorize = require('../middleware/dynamic-authorize')

router.get('/GetAllUserRoles', dynamicAuthorize,  async (req, res) => {
    try {
        const allUserRoles = await userRoleService.getAllUserRoles();
        res.status(200).json(allUserRoles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
// User rol ataması
router.post('/CreateUserRoles', dynamicAuthorize, async (req, res) => {
    const { userId, roleId, createdUserId } = req.body;
    try {
        const newUserRole = await userRoleService.createUserRole(userId, roleId, createdUserId);
        res.status(201).json(newUserRole);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
})

router.delete('/DeleteUserRoleById/:id', dynamicAuthorize, async (req, res) => {
    const {id} = req.params;
    try {
        const deletedUserRole = await userRoleService.deleteUserRoleById(id);
        res.status(200).json(deletedUserRole);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
})
module.exports = router;
