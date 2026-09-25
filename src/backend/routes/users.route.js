const express = require('express');
const router = express.Router();
const userService = require('../services/users.service');
const verifyToken = require('../middleware/authMiddleware')
const dynamicAuthorize = require('../middleware/dynamic-authorize');

router.use(verifyToken); 

router.get('/GetAllUsers', dynamicAuthorize, async (req, res) => {

    try {
        const users = await userService.getUsers();
        res.status(200).json(users); 
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
});


router.post('/CreateUser', dynamicAuthorize, async (req, res) => {
    const { username, password, email, gsm } = req.body;
    try {
        const newUser = await userService.createUser(username, password, email, gsm);
        res.status(201).json(newUser);  
    } catch (error) {
        res.status(500).json({ error: error.message });  
    }
});

router.put('/UpdateUserById/:id', dynamicAuthorize, async (req, res) => {
    const { id } = req.params;
    const { userData } = req.body;
    try {
        const updatedUser = await userService.updateUser(id, userData);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/DeleteUserById/:id', dynamicAuthorize, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await userService.deleteUser(id);
        res.status(200).json(deletedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/GetUserByUsername/:username', async (req, res) => {
    const {username} = req.params;
    try {
        const userData = await userService.getUserByUsername(username);
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;