const Joi = require('joi');


module.exports.articleSchema = Joi.object({
    article: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        subDescription: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.csrSchema = Joi.object({
    csr: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        subDescription: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
})



