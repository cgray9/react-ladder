'use strict';

var $ = jQuery;
var Reflux = require('reflux');
var Firebase = require('firebase');
var ref = new Firebase('https://resplendent-inferno-6001.firebaseio.com/');
var usersRef = ref.child('users');
var md5 = require('MD5');

var actions = Reflux.createActions([
    // user actions
    'login',
    'logout',
    'register',
    'createProfile',
    'updateProfile',
    // error actions
    'loginError',
    // ui actions
    'showOverlay'
])

// user actions
actions.login.preEmit = function(user, userData) {
    // username only provided when registering a new user
    // used to create a user profile
    ref.authWithPassword(user, function(error, authData) {
        if (error !== null) {
            actions.loginError(error.code);
        } else if (userData) {
            // new user
            var uid = authData.uid;
            var email = authData.password.email;
            actions.createProfile(uid, userData, email);
        }
    });
};

actions.logout.preEmit = function() {
    ref.unauth();
};

actions.register.preEmit = function(userData, loginData) {

    function checkForUsername(name) {
        // checks if username is taken
        var defer = $.Deferred();
        usersRef.orderByChild('username').equalTo(name).once('value', function(user) {
            defer.resolve(!!user.val());
        });
        return defer.promise();
    }

    if (!username) {
        // no username provided
        actions.loginError('NO_USERNAME');
    } else {
        // check if username is already taken
        checkForUsername(userData.username).then(function(usernameTaken) {
            if (usernameTaken) {
                actions.loginError('USERNAME_TAKEN');
            } else {
                ref.createUser(loginData, function(error) {
                    if (error !== null) {
                        // error during user creation
                        actions.loginError(error.code);
                    } else {
                        // user successfully created
                        actions.login(loginData, userData);
                    }
                });
            }
        });
    }
};

actions.createProfile.preEmit = function(uid, userData, email) {
    var md5hash = md5(email);
    var profile = {
        name: userData.name,
        username: userData.username,
        md5hash: md5hash,
        email: email,
        upvoted: {}
    };
    usersRef.child(uid).set(profile, function(error) {
        if (error === null) {
            // user profile successfully created
            actions.updateProfile(uid, profile);
        }
    });
};

module.exports = actions;