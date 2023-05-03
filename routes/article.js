const express = require('express');
const router = express.Router();
const { validateArticle, isLoggedIn } = require("../middleware");
const catchAsync = require('../utils/catchAsync');
const Article = require('../models/article');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage })
const { cloudinary } = require('../cloudinary');
const mongoosePaginate = require('mongoose-paginate-v2');
const { addLoadingVariable } = require('../middleware')
const nodemailer = require('nodemailer')




router.get('/', addLoadingVariable, catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const options = {
        sort: { createdAt: 'desc' },
        page: page,
        limit: pageSize
    };
    const articles = await Article.paginate({}, options);
    res.render('articles/index', { articles });
}));



router.get('/new', addLoadingVariable, (req, res) => {
    res.render('articles/new');

})

router.post('/', upload.array('image'), validateArticle, addLoadingVariable, catchAsync(async (req, res) => {
    const article = new Article(req.body.article);
    article.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await article.save();
    req.flash('success', 'Blog added')
    res.redirect(`/articles/${article._id}`);

}));



router.get('/:id', addLoadingVariable, catchAsync(async (req, res) => {
    const article = await Article.findById(req.params.id);
    res.render('articles/show', { article });

}))

router.get('/:id/edit', isLoggedIn, addLoadingVariable, catchAsync(async (req, res) => {
    const article = await Article.findById(req.params.id);
    res.render('articles/edit', { article });

}));


router.put('/:id', upload.array('image'), addLoadingVariable, catchAsync(async (req, res) => {
    const { id } = req.params;
    const article = await Article.findByIdAndUpdate(id, { ...req.body.article });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    article.images.push(...imgs);
    await article.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await article.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Updated')
    res.redirect(`/articles/${article._id}`);

}))

router.post('/send', catchAsync(async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD,
        },
    });

    // create a mail options object that defines the email content
    const mailOptions = {
        from: `${email}`,
        to: process.env.GMAIL_EMAIL,
        subject: `New contact form submission: ${subject}`,
        html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
    };

    // send the email using the transporter object
    await transporter.sendMail(mailOptions);

    req.flash('success', 'Thank you for your message! We will get back to you soon.');
    res.redirect('/articles');
}));




router.delete('/:id', addLoadingVariable, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Article.findByIdAndDelete(id);
    res.redirect('/articles');

}))





module.exports = router;