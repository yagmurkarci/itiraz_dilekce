const express = require('express');
const router = express.Router();
const endpointService = require('../services/endpoints.services');
const verifyToken = require('../middleware/authMiddleware');
const dynamicAuthorize = require('../middleware/dynamic-authorize'); 


router.use(verifyToken);

router.get('/GetAllEndpoints', async (req, res) => {
    try {
        const allEndpoints = await endpointService.getAllEndpoints();
        res.status(200).json(allEndpoints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post('/CreateEndpoint', dynamicAuthorize, async (req, res) => {
    const {routerPath, endpointPath, method, description} = req.body;
    try {
        const newEndpoint = await endpointService.createEndpoint(routerPath, endpointPath, method, description);
        res.status(201).json(newEndpoint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.put('/UpdateEndpointById/:id', dynamicAuthorize, async (req, res) => {
    const {id} = req.params;
    const { routerPath, endpointPath, method, description } = req.body;
    try {
        const updatedEndpoint = await endpointService.updateEndpoint(id, routerPath, endpointPath, method, description);
        res.status(200).json(updatedEndpoint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.delete('/DeleteEndpointById/:id', dynamicAuthorize, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedEndpoint = await endpointService.deleteEndpoint(id); 
        res.status(200).json(deletedEndpoint);  
    } catch (error) {
        res.status(500).json({ error: error.message });  
    }
});

module.exports = router;
