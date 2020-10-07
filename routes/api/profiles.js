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

// @route   POST api/profiles
// @desc    Create/Update User Profile
// @access  Private
router.post('/', passport.authenticate('jwt', {session:false}), (req, res) => {
    //GET FIELDS
    const profileFileds = {};

    profileFileds.user = req.user.id;
    if(req.body.handle) {
        profileFileds.handle = req.body.handle;
    }
    if(req.body.company) {
        profileFileds.company = req.body.company;
    }
    if(req.body.website) {
        profileFileds.website = req.body.website;
    }
    if(req.body.location) {
        profileFileds.location = req.body.location;
    }
    if(req.body.bio) {
        profileFileds.bio = req.body.bio;
    }
    if(req.body.status) {
        profileFileds.status = req.body.status;
    }
    if(req.body.github) {
        profileFileds.github = req.body.github;
    }
    //SKILLS
    if(typeof req.body.skills !== 'undefined') {
        profileFileds.skills = req.body.skills.split(',');
    }
    //SOCIAL
    profileFileds.social = {};
    if(req.body.youtube) {
        profileFileds.social.youtube = req.body.youtube
    }
    if(req.body.twitter) {
        profileFileds.social.twitter = req.body.twitter
    }
    if(req.body.facebook) {
        profileFileds.social.facebook = req.body.facebook
    }
    if(req.body.linkedin) {
        profileFileds.social.linkedin = req.body.linkedin
    }
    if(req.body.instagram) {
        profileFileds.social.instagram = req.body.instagram
    }

    Profile.findOne({user: req.user.id})
        .then(profile => {
                if(profile) {
                    //Update
                    Profile.findOneAndUpdate(
                        {user: req.user.id},
                        {$set: profileFileds},
                        {new: true}
                    )
                    .then(profile => res.json(profile))
                }
                else{
                    //CREATE NEW

                    //Check if Handle Exist
                    Profile.findOne({ handle: profileFileds.handle })
                        .then(profile => {
                            if(profile) {
                                errors.handle = 'That Handle already Exist';
                                res.status(400).json(errors);
                            }
                        })

                    // Save Profile
                    new Profile(profileFileds)
                        .save()
                        .then(profile => res.json(profile))
                }
        })
    
})


module.exports = router;