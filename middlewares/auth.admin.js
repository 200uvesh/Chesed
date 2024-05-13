import { asyncHandler } from "../utils/AsyncHandler.js";
import { APIresponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Admin_Model } from "../models/model.Admin.js";

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.admin_acess_token ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);
    if (!token) {
      return APIresponse(res, "Unauthorised request", 401, false);
    }

    const decodedToken = jwt.verify(
      token,
      process.env.ADMIN_ACCESS_TOKEN_SECRET
    );

    const admin = await Admin_Model.findById(decodedToken?._id).select(
      "-password"
    );

    if (!admin) {
      return APIresponse(res, "Invalid Acess token", 401, false);
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.log(error);
    APIresponse(res, "Invalid Acess token", 401, false);
  }
});
