import { asyncHandler } from "../utils/AsyncHandler.js";
import { APIresponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { User_Model } from "../models/model.user.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = 
      req.cookies?.acess_token ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);
    if (!token) {
      return APIresponse(res, "Unauthorised request", 401, false);
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User_Model.findById(decodedToken?._id).select(
      "-password"
    );

    if (!user) {
      return APIresponse(res, "Invalid Acess token", 401, false);
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    APIresponse(res, "Invalid Acess token", 401, false);
  }
});
