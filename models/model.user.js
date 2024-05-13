import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = mongoose.Schema(
  {
    Full_Name: {
      type: String,
      required: true,
    },
    Email_Address: {
      type: String,
      lowercase: true,
    },
    Choose_Gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },

    Phone_Number: {
      type: String,
    },

    Password: {
      type: String,
    },

    GoogleId: {
      type: String,
    },
    Email_OTP: {
      type: String,
      default: "",
    },

    Email_OTP_Expiration: {
      type: Date,
    },

    Email_OTP_Attempts: {
      type: Number,
      default: 0,
    },

    Email_OTP_LastAttemptAt: {
      type: Date,
    },

    Phone_OTP: {
      type: String,
      default: "",
    },

    Phone_OTP_Expiration: {
      type: Date,
    },

    Phone_OTP_Attempts: {
      type: Number,
      default: 0,
    },

    Phone_OTP_LastAttemptAt: {
      type: Date,
    },

    Profile_Image: {
      type: String,
    },
    User_Bio: {
      type: String,
    },

    status: {
      type: Number,
      default: 0, //  0 = Block , 1 = Email Verify , 2 = Phone Verify , 3 = admin suspend the user
    },
    License_Number:{
      type : Number
    },
    Document_Photo:{
      type : String
    },
    address:{
      type:String
    },
    EmailNotification:{
      type : Boolean,
      default : true
    },
    PushNotification:{
      type : Boolean,
      default : true
    },
    SMSNotification:{
      type : Boolean,
      default : true
    }
  },
  {
    timestamps: true,
  }
);

// Pre Hook For hased password
userSchema.pre("save", async function (next) {
  if (!(await this.isModified("Password"))) {
    return next();
  }
  this.Password = bcrypt.hashSync(this.Password, 10);
  next();
});

// Method for check Password is correct or not
userSchema.methods.isPasswordCorrect = async function (Password) {
  return await bcrypt.compare(Password, this.Password);
};

// Method for generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      Email_Address: this.Email_Address,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

const User_Model = mongoose.model("User_Model", userSchema);
export { User_Model };
