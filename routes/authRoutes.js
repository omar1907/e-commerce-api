const express = require('express');
const { register, login, logout, verifyEmail, forgetPassword, resetPassword } = require('../controllers/authController');
const {authenticateUser,authorizePermissions,} = require('../middleware/authentication');

const router = express.Router()

router.post('/register',register)
router.get('/verify-email',verifyEmail)
router.post('/forget-password',forgetPassword)
router.post('/reset-password',resetPassword)
router.post('/login',login)
router.get('/logout',authenticateUser,logout)

module.exports = router