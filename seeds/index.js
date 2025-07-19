//call this file for seeding
const mongoose=require('mongoose')
const cities=require('./in.js')
const Hall=require('../models/hall.js') 
const Review=require('../models/review.js')
// const User=require('../models/user.js')
const {places,descriptors}=require('./seedHelpers.js')

main();
async function main() {
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/yelp-hall');
        console.log('mongo connection open')
    }
    catch(err){
        console.log(err);
    }
}
const sample= array => array[Math.floor(Math.random()*array.length)]

const seedDb=async()=>{
    // await User.deleteMany()
    await Hall.deleteMany()
    await Review.deleteMany()
    for(let i=0;i<300;i++){
        const random161=Math.floor(Math.random()*161)
        const price=Math.floor(Math.random()*30)+10
        chosenCity=cities[random161]
        const hall=new Hall({
            location: `${chosenCity.city}, ${chosenCity.admin_name}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            //seeding user id
            author:'6845ccc6a5038b36fa20a5ce',
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure ad, odit suscipit ut voluptatibus similique saepe laudantium maxime, nostrum quis dolore sapiente provident quidem ex consequuntur incidunt. Id, ex eveniet.',
            price:price,
            geometry:{
                type:"Point",
                coordinates:[parseFloat(chosenCity.lng),parseFloat(chosenCity.lat)]
            },
            images:[
                    {
                    url: 'https://res.cloudinary.com/dajo1wdr4/image/upload/v1749366419/hall3_ygka39.jpg',
                    filename: 'hall3_ygka39',
                    },
                    {
                    url: 'https://res.cloudinary.com/dajo1wdr4/image/upload/v1749366419/hall2_equdku.jpg',
                    filename: 'hall2_equdku',
                    },
                    {
                    url: 'https://res.cloudinary.com/dajo1wdr4/image/upload/v1749366419/hall1_kb5hzz.jpg',
                    filename: 'hall1_kb5hzz',
                    }
                ]
        })
        await hall.save()
    }
}

seedDb().then(()=>{
    mongoose.connection.close()
})