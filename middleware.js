const dotenv = require('dotenv').config({ override: true });
const { articleSchema, csrSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Csr = require('./models/csr')
const Article = require('./models/article');
const nodemailer = require('nodemailer')





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




module.exports.sendEmail = (req, res, next) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD,
        }
    });
    const url = Math.floor(Math.random(10) * 10000) + process.env.ADMIN_ROUTE;
    const link = `http://${req.headers.host}/adminLogin/${url}`;

    const mailOptions = {
        from: process.env.GMAIL_EMAIL,
        to: process.env.GMAIL_EMAIL,
        subject: 'Login attempt',
        html: `A user is trying to log in, If it is you click this link to continue logging in ${link}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        } else {
            console.log(`Email sent: ${info.response}`);
            next();
        }
    });
}

module.exports.sendEmailReg = (req, res, next) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD,
        }
    });
    const url = Math.floor(Math.random(10) * 10000) + process.env.ADMIN_ROUTE;
    const link = `http://${req.headers.host}/registration/${url}`;

    const mailOptions = {
        from: process.env.GMAIL_EMAIL,
        to: process.env.GMAIL_EMAIL,
        subject: 'Login attempt',
        html: `A user is trying to register, If it is you click this link to continue logging in ${link}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
        } else {
            console.log(`Email sent: ${info.response}`);
            next();
        }
    });
}


