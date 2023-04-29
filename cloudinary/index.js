const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'PMST',
        allowed_formats: ['jpeg', 'png', 'jpg'],
        quality: 80,
        maxFileSize: 100000000
    },

})







module.exports = {
    cloudinary,
    storage
}