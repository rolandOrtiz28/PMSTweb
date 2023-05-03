const dotenv = require('dotenv').config({ override: true });
const express = require('express');
const router = express.Router();
const passport = require('passport')
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken');
const { sendEmail, sendEmailReg } = require('../middleware')


router.get('/register', sendEmailReg, (req, res) => {
    res.redirect('/')
})


router.get('/registration/:url', (req, res) => {
    res.render('admin/register')
})


router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Password validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            req.flash('error', 'Password must contain at least one uppercase letter, one digit, and be at least 8 characters long');
            res.redirect('/registration/:url');
            return;
        }

        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.flash('success', `Welcome ${username}`)
        res.redirect('/articles');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/registration/:url');
    }
}));


router.get('/login', sendEmail, async (req, res) => {
    res.redirect('/')
})



router.get('/adminLogin/:url', (req, res) => {
    res.render('admin/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), (req, res) => {
    req.flash('success', "logged in")
    res.redirect('/')
})


router.get('/forgot-password', (req, res) => {
    res.render('admin/forgot-password');
});

// POST route for handling password reset requests

router.post('/forgot-password', catchAsync(async (req, res, next) => {
    const { email } = req.body;
    const registeredUser = await User.findOne({ email });
    if (!registeredUser) {
        req.flash('error', 'User not registered');
        res.redirect('/forgot-password');
        return;
    }

    const secret = process.env.JWT_PASS + registeredUser.password;
    const payload = {
        email: registeredUser.email,
        id: registeredUser._id.toString(),
    };
    const token = jwt.sign(payload, secret, { expiresIn: '15m' });
    const resetPasswordLink = `http://${req.headers.host}/reset-password/${registeredUser._id}/${token}`;

    const smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'paumalamedicalweb@gmail.com',
            pass: process.env.GMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: 'paumalamedicalweb@gmail.com',
        to: registeredUser.email,
        subject: 'Password Reset',
        text: `You are receiving this email because you (or someone else) have requested a password reset for your account.
  Please click on the following link, or paste this into your browser to complete the process:
  ${resetPasswordLink}
  If you did not request this, please ignore this email and your password will remain unchanged.`,
    };

    console.log('Sending email to: ', registeredUser.email);

    smtpTransport.sendMail(mailOptions, (err, info) => {
        if (err) {
            req.flash('error', `An error occurred while sending the password reset email: ${err.message}`);
            console.error('Error sending email: ', err);
            return next(err);
        }
    });

    req.flash('success', 'An email has been sent to your registered email address with instructions on how to reset your password.');
    res.redirect('/forgot-password');
}));

// GET route for displaying password reset form
router.get('/reset-password/:id/:token', catchAsync(async (req, res) => {
    const { id, token } = req.params;

    const user = await User.findById(id);
    if (!user) {
        req.flash('error', 'Invalid ID');
        res.redirect('/forgot-password');
        return;
    }

    const secret = process.env.JWT_PASS + user.password;
    try {
        const payload = await jwt.verify(token, secret);
        res.render('admin/reset-password', { email: user.email, id, token });
    } catch (error) {
        console.log(error.message);
        req.flash('error', 'Something went wrong');
        res.redirect('/forgot-password');
    }
}));

router.post('/reset-password/:id/:token', catchAsync(async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    const user = await User.findById(id);
    if (!user) {
        req.flash('error', 'Invalid ID');
        res.redirect('/forgot-password');
        return;
    }

    const secret = process.env.JWT_PASS + user.password;
    try {
        const payload = await jwt.verify(token, secret);
        await user.setPassword(password);
        await user.save();
        req.flash('success', 'Your password has been successfully reset.');
        res.redirect('/login');
    } catch (error) {
        console.log(error.message);
        req.flash('error', 'Something went wrong');
        res.redirect('/forgot-password');
    }
}));





router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', "Goodbye!");
        res.redirect('/login');
    });
})

module.exports = router;