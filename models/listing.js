const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");

// const imageSchema = new Schema({
//     filename: {
//         type: String,
//         default: "listingimage"
//     },
//     url: {
//         type: String,
//         default: "https://unsplash.com/photos/two-brown-deer-beside-trees-and-mountain-UCd78vfC8vU"
//     }
// });

// const listingSchema = new Schema({
//     title: {
//         type: String,
//         required: true,
//     },
//     description: String,
//     image: {
//         type: imageSchema,
//         default: {
//             filename: "listingimage",
//             url: "https://unsplash.com/photos/two-brown-deer-beside-trees-and-mountain-UCd78vfC8vU"
//         }
//     },
//     price: Number,
//     location: String,
//     country: String,
// });

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        url:String,
        filename:String,
        // type:String,
        // default:
        //     "https://unsplash.com/photos/two-brown-deer-beside-trees-and-mountain-UCd78vfC8vU",
        // set:(v)=>
        //     v===""
        // ?"https://unsplash.com/photos/two-brown-deer-beside-trees-and-mountain-UCd78vfC8vU"
        // :v,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    geometry:{
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
})

listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing) {
        await Review.deleteMany({_id:{$in:listing.reviews}});
    }
})

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;