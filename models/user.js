const mongoose = require('mongoose'); // Mongoose
const bcrypt = require('bcryptjs'); // Bcryptjs for hashing passwords
const config = require('../config/db');

// Define User schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String
    },  
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
    
});

const User = module.exports = mongoose.model('User', UserSchema); // Exports the user schema to make it visible outside the file

// Model methods

module.exports.getUserById = function(id, callback){ // Find user by ID
    User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){ // Find by username
    const query = {username: username};
    User.findOne(query, callback);
}

module.exports.getUserByEmail = function(email, callback){ // Check if email already exists
    const query = {email: email};
    User.findOne(query, callback);
} 

module.exports.addUser = function(newUser, callback){ // Add user method
    bcrypt.genSalt(10, (err, salt) => { // Generate salt
        bcrypt.hash(newUser.password, salt, (err, hash) => { // Combines the password passed and the generated salt to create a hash
            if(err) throw err;
            newUser.password = hash; // Set the newUser's password to the hash
            newUser.save(callback); // Save user
        });
    });
}  

module.exports.comparePassword = function(candidatePassword, hash, callback){ // Compares candidate password to the hashed password in the database
    bcrypt.compare(candidatePassword, hash, (err, isMatch)=> {
        if(err) throw err;
        callback(null, isMatch);
    });

}

module.exports.updatePassword = function(newPassword, userId, callback){ // Update password
    bcrypt.genSalt(10, (err, salt) => {
        if(err) throw err;
        bcrypt.hash(newPassword, salt, (err, hash) => {
            if(err) throw err;
            newPassword = hash;
            User.update({_id: userId}, { $set: { password: newPassword } }, callback); // Update passed users password to the hashed new password
        });
    });
}
