const express = require('express');
const router = express.Router();
const endpointRoleService = require('../services/endpoint-roles.services');
const verifyToken = require('../middleware/authMiddleware');
const dynamicAuthorize = require('../middleware/dynamic-authorize'); 


router.use(verifyToken);

router.get('/GetAllEndpointRoles', dynamicAuthorize, async (req, res) => {
    try {
        const allEndpointRoles = await endpointRoleService.getAllEndpointRoles();
        res.status(200).json(allEndpointRoles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post('/CreateEndpointRole', dynamicAuthorize, async (req, res) => {
    const { endpointId, roleId} = req.body;
    try {
        const newEndpointRole = await endpointRoleService.createEndpointRole(endpointId, roleId);
        res.status(201).json(newEndpointRole);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.delete('/DeleteEndpointRoleById/:id', dynamicAuthorize, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedEndpointRole = await endpointRoleService.deleteEndpointRole(id); 
        res.status(200).json(deletedEndpointRole);  
    } catch (error) {
        res.status(500).json({ error: error.message });  
    }
});

module.exports = router;
