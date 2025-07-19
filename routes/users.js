const express=require('express')
const router =express.Router()
const User=require('../models/user.js')
const Book=require('../models/book.js')
const Hall=require('../models/hall.js')
const passport=require('passport')
const {storeReturnTo,sendmail,isNotLoggedIn,isLoggedIn}=require('../middleware.js')
const speakeasy=require("speakeasy")

router.get('/register',(req,res)=>{
    res.render('users/register.ejs')
})
router.post('/register',async(req,res,next)=>{
    try{
        const userData=JSON.parse(req.body.userData)
        const {email,password,username,mode,name} =userData
        const user=new User({email,mode,username,name})
        //.register came from passport.local.mongoose
        const registeredUser= await User.register(user,password)
        //cant use .authenticate() middleware here as we need an already registered user for it
        req.login(registeredUser,err=>{
            if(err) return next(err)
            //console.log(registeredUser)
            //user now has _id,username,password,email,salt,hash
            req.flash('success','Welcome to Yelp hall')
            res.redirect('/halls')
        })
    }catch(e){
        req.flash('error',e.message)
        res.redirect('/register')   
    }

})
router.get('/api/totp-secret', (req, res) => {
    const secret=speakeasy.generateSecret({length: 20});
    const token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
        step:30
    });
    res.json({ secret,token });
});
router.post('/api/totp-secret',express.json(),(req, res) => {
    const tokenValidates = speakeasy.totp.verify({
        secret: req.body.secret.base32,
        encoding: 'base32',
        token: req.body.otp
    });
    res.json({tokenValidates})
});
router.get('/verify-mail',isNotLoggedIn,(req,res)=>{
    try{
        const userData=req.query
        res.render('emailWait.ejs',{userData})
    }catch(e){
        req.flash('error',e.message)
        res.redirect('/register')
    }
})

router.post('/send-mail',express.json(),isNotLoggedIn,sendmail)

router.get('/logistics',isLoggedIn,async(req,res)=>{
    // remove fineOne and put find in here somehow
    const book= await Book.findOne({author:req.user._id})
    const hall= await Hall.findOne({books:book._id})
    console.log(book.bookedDate.date)
    res.render('users/logistics.ejs',{user:req.user,req,date:book.bookedDate.date,time:book.bookedDate.timeSlot,price:book.checkOutPrice,hall})
})

router.get('/payment',isLoggedIn,(req,res)=>{
    res.render('users/payment.ejs',{user:req.user,req})
})

router.get('/login',(req,res)=>{
    res.render('users/login.ejs')
})
//local-->local strategry of passport
router.post('/login',storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
    req.flash('success','Welcome back')
    const redirectUrl=res.locals.returnTo || '/halls'
    res.redirect(redirectUrl)
})

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/halls');
    });
}); 

module.exports=router