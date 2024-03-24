var express = require('express');
var router = express.Router();
const upload=require('./multer')

const userModel=require("./users")
const postModel=require("./post")

const passport=require("passport")
const localStrategy = require('passport-local');
const post = require('./post');


/* GET home page. */
passport.use(new localStrategy(userModel.authenticate()))

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/feed', isLoggedIn,async function(req, res){ //populate are work for the user data are show this are used
  const posts = await postModel.find().populate("user")
  const user= await userModel.findOne({username: req.session.passport.user})

  res.render('feed', {footer: true ,posts,user});
});
router.get('/like/:postid', isLoggedIn,async function(req, res){ 
  const user= await userModel.findOne({username: req.session.passport.user})
  const post = await postModel.findOne({_id:req.params.postid})
  if(post.likes.indexOf(user._id) === -1){
    post.likes.push(user._id);
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }
  await post.save();
  res.json(post);
});
router.get('/postsave/:postid', isLoggedIn,async function(req, res){ 
  const user = await userModel.findOne({username: req.session.passport.user});

  if(user.postsave.indexOf(req.params.postid) === -1){
   
  user.postsave.push(req.params.postid); 
  }
  else{
   
     user.postsave.splice(user.postsave.indexOf(req.params.postid), 1)
  }
  
  await user.save();


  res.json(user);
})

router.get('/profile', isLoggedIn,async function(req, res){
  const user= await userModel.findOne({username: req.session.passport.user}).populate("posts")
  res.render('profile', {footer: true ,user});
});
router.get('/saved', isLoggedIn,async function(req, res){

  try {
    const user= await userModel.findOne({username: req.session.passport.user}).populate('postsave') // Assuming 'posts' is the reference field in 'postsave'
    // console.log(user); // Log the populated users
    res.render('saved', {footer: true ,user});
  } catch (error) {
    console.error(error);
    
    res.status(500).send('Internal server error');
  }  
});


router.get('/search', isLoggedIn,function(req, res) {
  res.render('search', {footer: true});
});

router.get('/comment/:postId', isLoggedIn, async (req, res) => {
  
      const user = await userModel.findOne({ username: req.session.passport.user });
      const postId = req.params.postId;
      const post = await postModel.findById(postId).populate("user");

    

      res.render('comment', { footer: false, user, post });

});

router.get('/edit', isLoggedIn,async function(req, res) {
  const user= await userModel.findOne({username: req.session.passport.user})
  res.render('edit', {footer: true ,user});
});

router.get('/upload', isLoggedIn,function(req, res) {
  res.render('upload', {footer: true});
});
router.get('/username/:username', isLoggedIn,async function(req, res) {
  const regex = new RegExp(`^${req.params.username}`, 'i');
  const users=await userModel.find({username :regex})
  res.json(users)
});

router.post('/register', function(req, res, next) {
  const userData = new userModel({
    username : req.body.username,
    name : req.body.name,
    picture: req.body.picture,
    email : req.body.email, 
  
    })
    userModel.register(userData, req.body.password)
    .then(function(){
    passport.authenticate("local")(req,res, function(){
        res.redirect("/profile");
    })                    
  });
});
router.post('/login',passport.authenticate('local',{
successRedirect:'/profile',
failureRedirect:'/login',
}),function(req,res,next){})

router.get('/logout',function(req,res,next){
req.logout(function(err){
if(err){return next(err);}
res.redirect('/')
 });
});

function isLoggedIn(req, res , next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login")
}
router.post('/update', upload.single('image') , async function(req, res) {
  const user = await userModel.findOneAndUpdate(
    {username: req.session.passport.user} , 
    {username:req.body.username, name: req.body.name, Bio:req.body.Bio},
    { new:true} 
    );
    if(req.file){
      user.profileImage =req.file.filename; 
    }
  await user.save();
  res.redirect("/profile");
});
router.post("/upload",isLoggedIn,upload.single("media"),async function(req ,res){
  try{
    const user= await userModel.findOne({username: req.session.passport.user})
    if(!user){
      return res.status(404).send('user is not found')
    }
    const post= await postModel.create({
      media: req.file.filename,
      user: user._id,
      caption: req.body.caption,
    })

    user.posts.push(post.id);
    await user.save();

    
  res.redirect("/feed");
  }catch(error){
    console.log(error)
    res.status(404).send('kuch problem hai')
  }

  

})

module.exports = router;
