import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true

    },
    password:{
        type:String
    },
    contact:{
        type:String
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    history:[{
        prompt:String,
        response:String,
        category:{
            type:String,
            default:"general"
        },
        createdAt:{
            type:Date,
            default:Date.now
        }
    }],
    favorites:[{
        prompt:String,
        response:String,
        category:{
            type:String,
            default:"general"
        },
        savedAt:{
            type:Date,
            default:Date.now
        }
    }],
    profile:{
        imageName:String,
        address:String,
        age: Number,
        gender: String,
    },
},{versionKey:false});

export const User = mongoose.model("user",UserSchema);

