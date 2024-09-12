if(process.env.NODE_ENV!="production") {
    require('dotenv').config();
}
// console.log(process.env.SECRET);

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore=require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/", (req, res) => {
  res.redirect("/listings");
});

const dbUrl=process.env.ATLASDB_URL;

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:"process.env.SECRET"
    },
    touchAfter:24*3600, //in seconds
})

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
})

const sessionOptions={
    store,
    secret:"process.env.SECRET",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000, //7day 1day me 24 hr 1hr me 60min 1min me 60sec 1sec me 1000ms
        maxAge:7*24*60*60*1000,
        httpOnly:true //by default true hi hota hai
    }
}


main()
    .then(()=>{
        console.log("connected to DB");
    })
    .catch((err)=>{
        console.log(err);
    })


async function main() {
    await mongoose.connect(dbUrl);
}

// app.get("/",(req,res)=>{
//     res.send("Hi, I am root");
// })

app.use(session(sessionOptions));
app.use(flash()); //routes ko jaha require kiya hai uske upar hame flash ko use karna padega

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    // console.log(success);
    next();
})

// app.get("/demouser",async (req,res)=> {
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     })
    
//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})

app.use((err,req,res,next)=> {
    let {statusCode=500,message="Something went wrong!"}=err; //agar err ke andar kuch define nhi hoga to jo hamne define kiya hai ishi line me fhir wo aayega
    res.status(statusCode).render("error.ejs",{message}); //if we write in err in place of message then in error.ejs file we have to write err.message
    //res.status(statusCode).send(message);
})

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
})
