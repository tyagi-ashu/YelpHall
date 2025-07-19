const mongoose=require('mongoose')
const Review=require('./review.js')
// const Book=require('./book.js')
const Schema=mongoose.Schema


//making a new schema so that we can store new virtual property on it, to resize image by clouidnary(it is lightweight and fast)
const imageSchema=new Schema({
    url:String,
    filename:String
})
imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200')
})
//makes mongoose virtuals included in json
const opts={toJSON:{virtuals:true}}

const hallSchema=new Schema({
    title:String,
    images:[imageSchema],
    //geomtery schema copied from docs
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:[{
            type:Number,
            required:true
        }]
    },
    price:Number,
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ],
    books:[
        {
            type:Schema.Types.ObjectId,
            ref:'Book'
        }
    ]
},opts)
//this is to model our data according to the form that map is expecting
hallSchema.virtual('properties.popUpMarkup').get(function(){
    return `<a href="/halls/${this._id}">${this.title}</a>`
})

//the deleted hall is going to be passed to our function by 'post-findOneAndDelete' middleware
hallSchema.post('findOneAndDelete',async function(doc){
    if(doc){
        await  Review.deleteMany({
            _id:{$in:doc.reviews}
        })
    }

})
module.exports=mongoose.model('Hall',hallSchema)