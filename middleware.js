const {hallSchema,reviewSchema,bookSchema}=require('./schemas.js')
const Hall=require('./models/hall.js')
const Review=require('./models/review.js')
const ExpressError=require('./utils/ExpressError.js')
const nodemailer = require("nodemailer")


module.exports.isLoggedIn=(req,res,next)=>{
    //.isAuthenticated() is from passport
    if(!req.isAuthenticated()){
        //making .returnTo and putting the path for redirecting on it
        req.session.returnTo = req.originalUrl
        req.flash('error','Must be signed in!')
        return res.redirect('/login')
    }
    next()
}
module.exports.isNotLoggedIn=(req,res,next)=>{
    //.isAuthenticated() is from passport
    if(req.isAuthenticated()){
        req.flash('error','Already logged in!')
        return res.redirect('/halls')
    }
    next()
}
module.exports.hasOwnerPerm=(req,res,next)=>{
    if(req.user.mode!=='owner'){
        req.flash('error','Must have an hall owner account')
        return res.redirect('/halls')
    }else{
        next()
    }
}
module.exports.storeReturnTo = (req, res, next) => {
    //we are putting it in locals because session gets cleared after succesful login in passport.js, so we wont have access to the returnTo after logging in
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validatehall=(req,res,next)=>{
    const {error}=hallSchema.validate(req.body)
    if(error){
        //making an error message with all the errors and joining them with ','
        const msg=error.details.map(el=>el.message).join(',')
        return next(new ExpressError(msg,400))
    }else{
        next()
    }
}
//server side eidt/delete protection from wrong user for halls
module.exports.isAuthor=async(req,res,next)=>{
    const {id}=req.params
    const hall=await Hall.findById(id)
    if(!hall.author.equals(req.user._id)){
        req.flash('error','your dont have permission to do that')
        return res.redirect(`/halls/${id}`)
    }
    next()
}
module.exports.validatebook=(req,res,next)=>{
    req.body.bookedDate.date=req.body.bookedDate.date.split(" and ")
    req.body.bookedDate.timeSlot=JSON.parse(req.body.bookedDate.timeSlot)
    req.body.price=parseInt(req.body.price)
    const {id}=req.params
    const sample_time=["10:00 - 13:00","13:00 - 16:00","13:00 - 19:00","19:00 - 22:00"]
    try{
        const msg=''
        for(let arr of req.body.bookedDate.timeSlot){
            if(!arr.length){
                msg="Properly Select Time!!"
                throw new ExpressError(msg,400)
            }
            for(let time of arr){
                if(!sample_time.includes(time)){
                    msg="Not a valid Time!!"
                    throw new ExpressError(msg,422)
                }
            }
        }
    }catch(e){
        req.flash('error',e.message)
        return res.redirect(`/halls/${id}/book`)
    }

    const {error}=bookSchema.validate(req.body)
    if(error){
        req.flash('error','Date-Time Validation Failed!!')
        return res.redirect(`/halls/${id}/book`)
    }else{
        next()
    }
}
module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body)
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        return next(new ExpressError(msg,400))
    }else{
        next()
    }
}

//server side delete protection from wrong user for reviews
module.exports.isReviewAuthor=async(req,res,next)=>{
    const {id,reviewId}=req.params
    const review=await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)){
        req.flash('error','your dont have permission to do that')
        return res.redirect(`/halls/${id}`)
    }
    next()
}

module.exports.sendmail=async(req,res,next)=>{
    const {email,username,token}=req.body
    try{
        //set the smtp
        const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
            user: "jameson.effertz78@ethereal.email",
            pass: "eDDvGDZAcC1evtWfZU",
        },
        });
        //send mail
        const info = await transporter.sendMail({
            from: '"YelpHall" <yelphall8756@gmail.com>',
            to: email,
            subject: "Verification Email",
            text: `otp: ${token}`,
            html: `<b>verify for user: ${username}</b><br><b>otp: ${token}</b>`,
        });
        next()

    }catch(e){
        console.log(e)
        req.flash('error',e.message)
        return res.redirect(`/register`)
    }
}