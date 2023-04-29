const express = require('express');
const router = express.Router();
const Csr = require('../models/csr');
const mongoosePaginate = require('mongoose-paginate-v2');
const multer = require('multer');
const catchAsync = require('../utils/catchAsync');
const { validateCsr } = require('../middleware')
const { storage } = require('../cloudinary');
const { addLoadingVariable } = require('../middleware')
const upload = multer({ storage })



router.get('/', catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const options = {
        sort: { createdAt: 'desc' },
        page: page,
        limit: pageSize
    };
    const csrs = await Csr.paginate({}, options);
    res.render('csr/index', { csrs });
}));






router.get('/new', catchAsync(async (req, res) => {
    res.render('csr/new')
}))

router.post('/', upload.array('image'), validateCsr, addLoadingVariable, catchAsync(async (req, res) => {
    const csr = new Csr(req.body.csr);
    csr.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await csr.save();
    res.redirect(`/csr/${csr._id}`)
}))


router.get('/:id', catchAsync(async (req, res) => {
    const csr = await Csr.findById(req.params.id)
    res.render('csr/show', { csr })
}))

router.get('/:id/edit', addLoadingVariable, catchAsync(async (req, res) => {
    const csr = await Csr.findById(req.params.id);
    res.render('csr/edit', { csr });
}));

router.put('/:id', upload.array('image'), addLoadingVariable, catchAsync(async (req, res) => {
    const { id } = req.params;
    const csr = await Csr.findByIdAndUpdate(id, { ...req.body.csr });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    csr.images.push(...imgs);
    await csr.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await csr.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Updated')
    res.redirect(`/csr/${csr._id}`);
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Csr.findByIdAndDelete(id);
    res.redirect('/csr');

}))


module.exports = router;

