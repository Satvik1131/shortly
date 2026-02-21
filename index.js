const express=require('express');
const path=require('path');
const cookieParser=require("cookie-parser");
const{connectToMongoDB}=require("./connect");
const{checkforauthentication,restrictto}=require("./middlewares/auth");

const URL=require('./models/url');

const urlroute=require('./routes/url');
const staticroute=require('./routes/staticrouter');
const userroute=require('./routes/user');

const app=express();
const port=8001;

connectToMongoDB("mongodb+srv://satvik07:nPLVFdgyRds1KUQr@cluster0.asikfwl.mongodb.net/")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

//SERVER SIDE RENDERING SETUP
app.set('view engine','ejs'); //setting ejs as view engine
app.set("views",path.resolve("./views"));

app.use(express.json());  //It tells Express to read JSON data from incoming requests and put it inside req.body.
app.use(express.urlencoded({ extended: false }));  //used for Form / HTML data
app.use(cookieParser());
app.use(express.static(path.resolve("./public")));
app.use(checkforauthentication);

app.get("/test",async(req,res)=>{
  const allurls=await URL.find({});
  return res.render("home",{  //means render home file in views folder
    urls:allurls,
  });    
})

app.use("/url",restrictto(["NORMAL","ADMIN"]),urlroute);
//public pages
app.use("/user",userroute);
app.use("/",staticroute);


app.get('/url/:shortID',async(req,res)=>{
      const shortID=req.params.shortID;
      const entry=await URL.findOneAndUpdate({
        shortID
      },{$push:{
            visitHistory:{
            timestamp:Date.now(),
        },
      },
    }
    );
    res.redirect(entry.redirectURL);
})

app.listen(port,()=>console.log(`Server started at port:${port}`));
