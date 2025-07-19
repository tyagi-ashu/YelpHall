const mongoose=require('mongoose')
const Schema=mongoose.Schema

const bookSchema= new Schema({
    bookedDate:{
        date:[Date],
        timeSlot:[[String]],
    },
    checkOutPrice:{
        type:Number,
        required:true,
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
})

module.exports=mongoose.model('Book',bookSchema)