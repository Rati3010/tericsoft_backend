import mongoose from "mongoose";
const userSchema = ({
    email: String,
    name:String,
    password:String,
    history:Array
})

export const UserModel = mongoose.model("user",userSchema)