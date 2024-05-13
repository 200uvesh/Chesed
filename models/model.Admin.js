import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const adminSchema = mongoose.Schema(
    {
        Email: {
          type: String,
          required:true
        },
        Password:{
            type : String
        }
    
        
      },
      { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!(await this.isModified("Password"))) {
    return next();
  }
  this.Password = bcrypt.hashSync(this.Password, 10);
  next();
});

adminSchema.methods.isPasswordCorrect = async function (Password) {
  return await bcrypt.compare(Password, this.Password);
};


adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      Email: this.Email,
    },
    process.env.ADMIN_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
 

const Admin_Model = mongoose.model("Admin_Model", adminSchema);
export { Admin_Model };
