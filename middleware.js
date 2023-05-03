const dotenv = require('dotenv').config({ override: true });
const { articleSchema, csrSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Csr = require('./models/csr')
const Article = require('./models/article');
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken');
const User = require('./models/user.js')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.gobackTo = req.originalUrl
        return res.redirect('/')
    }
    next();
}



module.exports.validateArticle = (req, res, next) => {

    const { error } = articleSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


module.exports.validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.validateCsr = (req, res, next) => {

    const { error } = csrSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }

}


module.exports.addLoadingVariable = (req, res, next) => {
    res.locals.loading = true;
    next();
}




module.exports.sendEmail = async (req, res, next) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD,
        }
    });

    try {
        const secret = process.env.JWT_PASS + process.env.ADMIN_ROUTE;
        const payload = {
            pass: process.env.JWT_PASS,
            route: process.env.ADMIN_ROUTE,
        };
        const token = jwt.sign(payload, secret, { expiresIn: "15m" });
        const link = `http://${req.headers.host}/adminLogin/${token}`;
        const mailOptions = {
            from: process.env.GMAIL_EMAIL,
            to: process.env.GMAIL_EMAIL,
            subject: "Login attempt",
            html: `A user is trying to Login, If it is you click this link to continue logging in ${link}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                res.status(500).send("Internal server error");
            } else {
                next();
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
};

module.exports.sendEmailReg = async (req, res, next) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD,
        },
    });

    try {
        const secret = process.env.JWT_PASS + process.env.ADMIN_ROUTE;
        const payload = {
            pass: process.env.JWT_PASS,
            route: process.env.ADMIN_ROUTE,
        };
        const token = jwt.sign(payload, secret, { expiresIn: "360s" });
        const link = `http://${req.headers.host}/registration/${token}`;
        const mailOptions = {
            from: process.env.GMAIL_EMAIL,
            to: process.env.GMAIL_EMAIL,
            subject: "Register attempt",
            html: `A user is trying to register, If it is you click this link to continue logging in ${link}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                res.status(500).send("Internal server error");
            } else {
                next();
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
};

