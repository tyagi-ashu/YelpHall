express=require('express')
const Hall=require('../models/hall.js')
const Review=require('../models/review.js')
const{isLoggedIn,validateReview,isReviewAuthor}=require('../middleware.js')
//router get seperate params , so we cant access halls-id in this by req.body.params..so do this
const router=express.Router({mergeParams:true})

router.post('/',isLoggedIn,validateReview,async(req,res)=>{
    const foundhall=await Hall.findById(req.params.id)
    const review=new Review(req.body.review)
    review.author=req.user._id
    foundhall.reviews.push(review)
    await review.save()
    await foundhall.save()
    req.flash('success','Created new review!')
    res.redirect(`/halls/${foundhall._id}`)
})
//we need both ids to remove the reviww itself and also remove the reference to halls
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,async(req,res)=>{
    const {id,reviewId}=req.params
    //pull operator removes all instances of a specified value or values from an array
    await Hall.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(req.params.reviewId)
    req.flash('success','Deleted a review!')
    res.redirect(`/halls/${id}`)
})

module.exports=router