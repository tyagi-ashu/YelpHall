const baseJoi = require('joi')
const sanitizeHtml=require('sanitize-html')
//using joi..this is not a mongoose schema// this is for server side validation(as somemone could be using postman)..client side already done by bootstrap

//defining extention for html sanitizing
const extension=(joi)=>({
    type:'string',
    base:joi.string(),
    messages:{
        'string.escapeHTML':'{{#label}} must not include HTML'
    },
    rules:{
        escapeHTML:{
            validate(value,helpers){
                const clean=sanitizeHtml(value,{
                'allowedTags': [],
                'allowedAttributes': {}
                })
                if(clean!==value) return helpers.error('string.escapeHTML',{value})
                return clean
            }
        }
    }
})

const joi=baseJoi.extend(extension).extend(require('@joi/date'))

module.exports.hallSchema=joi.object({
    hall:joi.object({
        title:joi.string().required().escapeHTML(),
        price:joi.number().required().min(0),
        //image:joi.string().required(),
        location:joi.string().required().escapeHTML(),
        description:joi.string().required().escapeHTML()
    }).required(),
    deleteImages:joi.array()

})

module.exports.reviewSchema=joi.object({
    review:joi.object({
        rating:joi.number().required().min(1).max(5),
        body:joi.string().required().escapeHTML()
    }).required()
})

module.exports.bookSchema=joi.object({
    bookedDate:joi.object({
        date:joi.array().items(joi.date().format('YYYY-MM-DD').required()),
        timeSlot:joi.array().items(joi.array().items(joi.string().required().escapeHTML()).required()).required(),
    }).required(),
    price:joi.number().required()
})