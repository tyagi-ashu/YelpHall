if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}

const express=require('express')
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const app=express()
app.set('query parser', 'extended');
const methodOverride=require('method-override')
const path=require('path')
const mongoose=require('mongoose')
const ejsMate=require('ejs-mate')
const session=require('express-session')
const flash=require('connect-flash')
const ExpressError=require('./utils/ExpressError.js')
const helmet=require('helmet')

const passport=require('passport')
const localStratergy=require('passport-local')

const hallRoutes=require('./routes/halls.js')
const reviewRoutes=require('./routes/reviews.js')
const userRoutes=require('./routes/users.js')

const User=require('./models/user.js')
//to change the default memory store to mongo store
const MongoStore = require('connect-mongo');

// for mongoDb atlas put this in mongoose.connect
const dbUrl= process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-hall'

main();
async function main() {
    try{
        await mongoose.connect(dbUrl);
        console.log('mongo connection open')
    }
    catch(err){
        console.log(err);
    }
}
//this is for boilerplates
app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
//preventing mongo injection
app.use(sanitizeV5({ replaceWith: '_' }));

const secret = process.env.SECRET || 'thisisasecret'
const store= MongoStore.create({
    mongoUrl: dbUrl,
    //if the data hasnt changed then update data after 24 hours only
    touchAfter: 24*60*60,
    crypto:{
        secret,
    }
})
store.on("error",function(e){
    console.log("SESSION STORE ERROR",e)
})

//name,httpOnly,secure are for making cookies secure 
const sessionConfig={

    store:store,
    name:'session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //secure:true,
        //expires in a week
        expires:Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
//use flash and passport after establishing a session
app.use(flash())
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];
const fontSrcUrls=[]
app.use(helmet.contentSecurityPolicy({
    directives:{
        defaultSrc:[],
        connectSrc: ["'self'",...connectSrcUrls],
        scriptSrc:["'unsafe-inline'","'self'",...scriptSrcUrls],
        styleSrc:["'self'","'unsafe-inline'",...styleSrcUrls],
        workerSrc:["'self'","blob:"],
        objectSrc:[],
        imgSrc:[
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/dajo1wdr4/",
            "https://images.unsplash.com/",
        ],
        fontSrc:["'self'",...fontSrcUrls]
    }
}))

//authenticate(),serialize(),deserialize(),findByUsername(),register() are all on passport-local-mongoose
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStratergy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//this is before any of route handlers
app.use((req,res,next)=>{
    //now this will be a local variable whenever we res
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    //req.user has info about logged in user by postman
    //it has username,_id,email on it
    //we need it in the app.use as we use this in the navbar and the state of navbar can change at any request
    res.locals.currUser=req.user
    next()
})

app.use('/halls',hallRoutes)
app.use('/halls/:id/reviews',reviewRoutes)
app.use('/',userRoutes)

app.get('/',(req,res)=>{
    res.render('home')
})

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not found',404))
})
app.use((err,req,res,next)=>{
    const {statusCode=500}=err
    if(!err.message) err.message="something went wrong";
    res.status(statusCode).render('error.ejs',{err})
})
app.listen(3000,()=>{
    console.log('listening')
}) 