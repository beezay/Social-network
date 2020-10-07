const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport')

// Load PROFILE MODEL
const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route   GET api/profiles/test
// @desc    Tests profiles route
// @access  Public
router.get('/test', (req, res) => {
    res.json({ msg: 'profile Works'})
});

// @route   GET api/profiles
// @desc    User Profile Load
// @access  Private
router.get('/', passport.authenticate('jwt', {session:false}), (req, res) => {
    const errors = {}

    Profile.findOne({ user: req.user.id })
        .then( profile => {
            if(!profile){
                errors.noProfile = 'No Profile found for the User'
                return res.status(404).json(errors);
            }

            res.status(200).json(profile);
        })
        .catch(err => res.status(404).json(err))
})

module.exports = router;