const mongoose=require('mongoose')
const Schema=mongoose.Schema

const passportLocalMongoose=require('passport-local-mongoose')

const userSchema= new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    mode:{
        type:String,
        enum:['owner','booker'],
        required:true
    },
    name:{
        type:String
    }
})

//this is going to add on to schema - a username and password
//makes sure that username are unique...amnd gives some methods
userSchema.plugin(passportLocalMongoose)

module.exports=mongoose.model('User',userSchema)