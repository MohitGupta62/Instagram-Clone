const mongoose =  require('mongoose');
// const passport =require('passport');
const plm = require('passport-local-mongoose')


mongoose.connect('mongodb://127.0.0.1:27017/instadata');

const userSchema = mongoose.Schema({
username : String,
name : String,
password: String,
profileImage : {
    type:String,
    default: 'default.jpg'
},
email : String,
Bio : String,
massages:{
    type:Array,
    default:[]
},
followers:[{type: mongoose.Schema.Types.ObjectId, ref: "followers"}],
following:[{type: mongoose.Schema.Types.ObjectId, ref: "following"}],
posts:  [{type: mongoose.Schema.Types.ObjectId, ref: "post"}],
postsave:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:"post"
}]

});

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);
