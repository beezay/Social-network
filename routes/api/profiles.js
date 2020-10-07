const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport')
//Load Validation
const validateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education')

// Load PROFILE MODEL
const Profile = require('../../models/Profile')
// Load USER MOdel
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
        .populate('user', ['name', 'avatar'])
        .then( profile => {
            if(!profile){
                errors.noProfile = 'No Profile found for the User'
                return res.status(404).json(errors);
            }

            res.status(200).json(profile);
        })
        .catch(err => res.status(404).json(err))
})

// @route   GET api/profiles/all
// @desc    Get All Profile
// @access  Public
router.get('/all', (req,res) => {

    const errors = {}

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if(!profiles) {
                errors.noProfile = 'There are no Profiles'
                return res.status(404).json(errors)
            }
            res.status(200).json(profiles)
        })
        .catch(err => res.status(404).json(err))
})

// @route   GET api/profiles/handle/:handle
// @desc    Get Profile by Handle
// @access  Public
router.get('/handle/:handle', (req,res) => {

    const errors = {}

    Profile.findOne({handle: req.params.handle})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noProfile = 'There is no Profile for this Handle'
                return res.status(404).json(errors)
            }
            res.json(profile)

        })
        .catch(err => res.status(404).json(err))
})

// @route   GET api/profiles/user/:user_id
// @desc    Get Profile by ID
// @access  Public
router.get('/user/:user_id', (req,res) => {

    const errors = {}

    Profile.findOne({user: req.params.user_id})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noProfile = 'There is no Profile for this Handle'
                return res.status(404).json(errors)
            }
            res.json(profile)

        })
        .catch(err => res.status(404).json({profile: 'There is no Profile for this user'}))
})

// @route   POST api/profiles
// @desc    Create/Update User Profile
// @access  Private
router.post('/', passport.authenticate('jwt', {session:false}), (req, res) => {

    const { errors, isValid } = validateProfileInput(req.body);

    //Check Validation
    if(!isValid) {
        //Return any errors with 400 status
        return res.status(400).json(errors);
    }

    //GET FIELDS
    const profileFields = {};

    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    
    if(req.body.company) profileFields.company = req.body.company;
    
    if(req.body.website) profileFields.website = req.body.website;
    
    if(req.body.location) profileFields.location = req.body.location;
    
    if(req.body.bio) profileFields.bio = req.body.bio;
    
    if(req.body.status) profileFields.status = req.body.status;
    
    if(req.body.github) profileFields.github = req.body.github;
    
    //SKILLS
    if(typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }
    //SOCIAL
    profileFields.social = {};
    if(req.body.youtube) {
        profileFields.social.youtube = req.body.youtube
    }
    if(req.body.twitter) {
        profileFields.social.twitter = req.body.twitter
    }
    if(req.body.facebook) {
        profileFields.social.facebook = req.body.facebook
    }
    if(req.body.linkedin) {
        profileFields.social.linkedin = req.body.linkedin
    }
    if(req.body.instagram) {
        profileFields.social.instagram = req.body.instagram
    }

    Profile.findOne({user: req.user.id})
        .then(profile => {
                if(profile) {
                    //Update
                    Profile.findOneAndUpdate(
                        {user: req.user.id},
                        {$set: profileFields},
                        {new: true}
                    )
                    .then(profile => res.json(profile))
                }
                else{
                    //CREATE NEW
                    //Check if Handle Exist
                    Profile.findOne({ handle: profileFields.handle })
                        .then(profile => {
                            if(profile) {
                                errors.handle = 'That Handle already Exist';
                                res.status(400).json(errors);
                            }
                        })

                    // Save Profile
                    new Profile(profileFields)
                        .save()
                        .then(profile => res.json(profile))
                }
        })
    
})

// @route   POST api/profiles/experience
// @desc    ADD Experience to Profile
// @access  Private
router.post('/experience', passport.authenticate('jwt', {session: false}), (req,res) => {
    const {errors, isValid} = validateExperienceInput(req.body)

    //Check validation
    if(!isValid) {
        //Return any errors with 400 status
        return res.status(400).json(errors)
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // Add to Experience Array
            profile.experience.unshift(newExp);

            profile.save()
                .then(profile => res.json(profile))
        })
})

// @route   POST api/profiles/education
// @desc    ADD Education to Profile
// @access  Private
router.post('/education', passport.authenticate('jwt', {session: false}), (req,res) => {
    const {errors, isValid} = validateEducationInput(req.body)

    //Check validation
    if(!isValid) {
        //Return any errors with 400 status
        return res.status(400).json(errors)
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldOfStudy: req.body.fieldOfStudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // Add to Experience Array
            profile.education.unshift(newEdu);

            profile.save()
                .then(profile => res.json(profile))
        })
})


module.exports = router;