const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const userService = require('../services/users.service');


router.post('/Login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const { token } = await authService.loginUser(email, password);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

router.post('/Sign-up', async (req, res) => {
    const { username, password, email, gsm } = req.body;
    try {
        const newUser = await userService.createUser(username, password, email, gsm);
        res.status(201).json(newUser);  // Başarıyla oluşturulan kullanıcıyı döndür
    } catch (error) {
        res.status(500).json({ error: error.message });  // Genel hata mesajı
    }
});

module.exports = router;
