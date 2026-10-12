const express = require('express');
const router = express.Router();
const userService = require('../services/users.service');
const verifyToken = require('../middleware/authMiddleware')
const dynamicAuthorize = require('../middleware/dynamic-authorize');

router.use(verifyToken); 

const getStudentAffairsScope = (user) => (
    user.roles?.some(({ roleName }) => roleName === 'Öğrenci İşleri')
        ? ['Öğrenci', 'Mezun']
        : null
);

router.get('/GetAllUsers', dynamicAuthorize, async (req, res) => {

    try {
        const users = await userService.getUsers(getStudentAffairsScope(req.user));
        res.status(200).json(users); 
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
});

router.get('/GetAcademics', dynamicAuthorize, async (req, res) => {
    try {
        const canListAcademics = req.user.roles?.some(({ roleName }) => ['Root', 'Admin', 'Öğrenci İşleri'].includes(roleName));
        if (!canListAcademics) return res.status(403).json({ error: 'You cannot list academics' });
        const academics = await userService.getUsers(['Akademisyen', 'Öğretim Görevlisi']);
        res.status(200).json(academics.map(({ id, name, email }) => ({ id, name, email })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/CreateUser', dynamicAuthorize, async (req, res) => {
    const { name, password, email, number, bysStudentId, roleId, departmentIds } = req.body;
    try {
        const newUser = await userService.createUser(name, password, email, number, bysStudentId, roleId, getStudentAffairsScope(req.user), departmentIds);
        res.status(201).json(newUser);  
    } catch (error) {
        res.status(400).json({ error: error.message });  
    }
});

router.put('/UpdateUserById/:id', dynamicAuthorize, async (req, res) => {
    const { id } = req.params;
    const { name, email, number, password, bysStudentId, roleId, academicRoleId, departmentIds } = req.body;
    try {
        const updatedUser = await userService.updateUser(id, { name, email, number, bysStudentId, password, roleId, academicRoleId, departmentIds }, getStudentAffairsScope(req.user));
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/DeleteUserById/:id', dynamicAuthorize, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await userService.deleteUser(id, getStudentAffairsScope(req.user));
        res.status(200).json(deletedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
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