const express = require('express')
const { getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword } = require('../controllers/userController')
const {authenticateUser, authorizePermissions} = require('../middleware/authentication')
const router = express.Router()


router.route('/').get(authenticateUser,authorizePermissions('admin'),getAllUsers)
router.route('/showMe').get(authenticateUser,showCurrentUser)
router.put('/updateUser',authenticateUser,updateUser)
router.patch('/updateUserPassword',authenticateUser,updateUserPassword)
router.route('/:id').get(authenticateUser,getSingleUser)


// router.get('/allusers',getAllUsers)
// router.get('/singleuser',getSingleUser)
// router.get('/show',showCurrentUser)


module.exports = router

