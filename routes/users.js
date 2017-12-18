const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/db');
const User = require('../models/user');

// Register
router.post('/register', (req, res, next) => {

    let newUser = new User({ // Create new user object
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    User.getUserByUsername(newUser.username, (err, user) => { // Check if username already exists
        if(err) throw err;
        User.getUserByEmail(newUser.email, (err, emailExists) => { // Check if email is already in use
            if(err) throw err;

            if(user){ // If user exists
                return res.json({success: false, msg: 'User already exists'});
            } else if(emailExists){ // If email exists
                 return res.json({success: false, msg: 'That email is already in use'});
            } else { // Else create user
                User.addUser(newUser, (err, user) => {
                    if(err){
                        return res.json({success: false, msg: 'Failed to register'});
                    } else {
                        return res.json({success: true, msg: 'You have been successfully registered!'});
                    }
                });
            }


        });
    });

});

// Authenticate
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;

        if(!user){ // If the user doesn't exist
            return res.json({success: false, msg: 'User not found'});
        }
        
        User.comparePassword(password, user.password, (err, isMatch) => { // Else user exists
            if(err) throw err;
            if(isMatch){ // If the passwords match
                // Generate user token
                const token = jwt.sign(user, config.secret, {
                    expiresIn: 604800 // Token expires in 1 week
                });
                // Send json response with token
                res.json({
                    success: true,
                    msg: 'Successfully logged in!',
                    token: 'JWT '+token,
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                });
            } else { // Wrong password
                return res.json({success: false, msg: 'Invalid password'});
            }
        });
    });
});

// User profile
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => { // Protected route, required to be authenticated to access
    res.json({user: req.user});
});

// Update password
router.put('/update-password', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    if(currentPassword == undefined || newPassword == undefined){ // Checks if fields are empty
        return res.json({success: false, msg: 'Please make sure all necessary fields are filled out'});
    }

    // Make sure current password is correct
    User.comparePassword(currentPassword, req.user.password, (err, isMatch) => {
        if(err) throw err;

        if(!isMatch){ // If it doesn't match, send this json
            return res.json({success: false, msg: 'Incorrect current password'});
        }

        User.updatePassword(newPassword, req.user._id, (err, user) => { // Update password
            if(err) throw err;
            return res.json({success: true, msg: 'Password successfully updated'});
        });
    });
});


module.exports = router;