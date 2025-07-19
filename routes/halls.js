express=require('express')
const Hall=require('../models/hall.js')
const Book=require('../models/book.js')
const router=express.Router()
const{isLoggedIn,isAuthor,validatehall,hasOwnerPerm,validatebook}=require('../middleware.js')

const multer=require('multer')
const {storage}=require('../cloudinary/index.js')
const upload=multer({storage})
const {cloudinary}=require('../cloudinary/index.js')

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


router.get('/',async (req,res)=>{
    const halls= await Hall.find()
    res.render('halls/index.ejs',{halls})
})

router.get('/new',isLoggedIn,hasOwnerPerm,(req,res)=>{
    res.render('halls/new.ejs')
})

router.post('/new',isLoggedIn,hasOwnerPerm,validatehall,upload.array('image'),async(req,res)=>{
    const geoData = await maptilerClient.geocoding.forward(req.body.hall.location, { limit: 1 });
    const hall = new Hall(req.body.hall);
    hall.geometry = geoData.features[0].geometry;
    //adding filename and cloudinary-url to images
    hall.images=req.files.map(f=>({url:f.path, filename:f.filename}))
    hall.author=req.user._id
    await hall.save()
    req.flash('success','Successfuly made a new hall!')
    res.redirect(`/halls/${hall._id}`)
})

router.get('/:id',async(req,res)=>{
    const foundhall=await Hall.findById(req.params.id).populate({path:'reviews',populate:{path:'author'}}).populate('author')
    if(!foundhall){
        req.flash('error','Cannot find hall!')
        return res.redirect('/halls')
    }
    res.render('halls/show.ejs',{foundhall})
})

router.get('/:id/book',isLoggedIn,async(req,res)=>{
    const foundhall=await Hall.findById(req.params.id).populate('books').populate('author')

    if(!foundhall){
        req.flash('error','Cannot find hall!')
        return res.redirect('/halls')
    }
    if(foundhall.author.username===req.user.username){
        req.flash('error','Thats your own hall!')
        return res.redirect(`/halls/${req.params.id}`)
    }
    res.render('halls/book.ejs',{foundhall})   
})

router.post('/:id/book',isLoggedIn,validatebook,async(req,res)=>{
    const foundhall=await Hall.findById(req.params.id).populate('author')
    if(!foundhall){
        req.flash('error','Cannot find hall!')
        return res.redirect('/halls')
    }
    if(foundhall.author.username===req.user.username){
        req.flash('error','Thats your own hall!')
        return res.redirect(`/halls/${req.params.id}`)
    }
    const book=new Book({bookedDate:req.body.bookedDate})
    book.checkOutPrice=req.body.price
    book.author=req.user._id
    foundhall.books.push(book)
    await book.save()
    await foundhall.save()
    req.flash('success','Succesfully booked!')
    res.redirect(`/halls/${foundhall._id}/book`)
})

router.get('/:id/edit',isLoggedIn,isAuthor,async(req,res)=>{
    const foundhall=await Hall.findById(req.params.id)
    if(!foundhall){
        req.flash('error','Cannot find hall!')
        return res.redirect('/halls')
    }
    res.render('halls/edit.ejs',{foundhall})
})

router.put('/:id/edit',isLoggedIn,isAuthor,validatehall,upload.array('image'),async(req,res)=>{
    const updatehall=await Hall.findByIdAndUpdate(req.params.id,{...req.body.hall},{runValidators:true,new:true})
    
    const geoData = await maptilerClient.geocoding.forward(req.body.hall.location, { limit: 1 });
    updatehall.geometry = geoData.features[0].geometry;

    const imgs_array=req.files.map(f=>({url:f.path, filename:f.filename}))
    updatehall.images.push(...imgs_array)
    //deleting images matching the mongoDb images.filename with the checkboxes value
    await updatehall.save()
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await updatehall.updateOne({$pull:{images:{filename:{$in: req.body.deleteImages}}}})
    }
    req.flash('success','Successfuly updated hall!')
    res.redirect(`/halls/${updatehall._id}`)
})

router.delete('/:id',isLoggedIn,isAuthor,async(req,res)=>{
    const {id}=req.params;
    await Hall.findByIdAndDelete(id)
    req.flash('success','Deleted a hall!')
    res.redirect('/halls')
})

module.exports=router