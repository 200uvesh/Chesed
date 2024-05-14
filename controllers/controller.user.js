import { configDotenv } from "dotenv";
configDotenv();
import { APIresponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User_Model } from "../models/model.user.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEMail } from "../utils/sendMail.js";
import {
  generateAccessToken,
  getRequestById,
  cancelRequestById,
  getNumberOfFollowers,
  getNumberOfFollowings,
  searchCollectionName,
  getOrderByDate,
  getUpcomingRequest,
  getHistory,
} from "../dao/dao.user.js";
import { sendSMS } from "../utils/sendSMS.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { RideShare } from "../models/module.ridesharePassenger.js";
import { PackageTransport } from "../models/model.packageTransport.js";
import { MealTrain } from "../models/model.mealTrain.js";
import { MinyanAssembly } from "../models/model.minyanAssembly.js";
import { Chizuk } from "../models/model.Chizuk.js";
import { FreeGiveaway } from "../models/model.freeGiveaway.js";
import { Advice } from "../models/model.advice.js";
import { WeddingAttendees } from "../models/model.weddingAttendees.js";
import { GemachFinder } from "../models/model.gemachFinder.js";
import { MovingItems } from "../models/model.movingItems.js";
import { LostAndFound } from "../models/model.lostAndFound.js";
import { HouseHold } from "../models/model.Household.js";
import { StudyPartner } from "../models/model.studyPartner.js";
import { AcceptRideShare } from "../models/model.acceptRideShare.js";
import { AllCategory } from "../models/model.allCategory.js";
import { Follow } from "../models/model.follow.js";
import { Compliment } from "../models/model.Compliment.js";
import axios from "axios";
import querystring from "querystring";
import { Donate } from "../models/model.donate.js";
import { PrivacyPolicy } from "../models/model.privacyPolicy.js";
import { TermAndCondition } from "../models/model.termAndCondition.js";
import { ContactUs } from "../models/model.contactUs.js";
import { About } from "../models/model.aboutUs.js";
import { FAQ } from "../models/model.FAQ.js";
import { CreateRequest } from "../models/model.Category.js";

// SignUp (DONE)
const SignUp = asyncHandler(async (req, res) => {
  const {
    Full_Name,
    Email_Address,
    Choose_Gender,
    Password,
    Confirm_Password,
    Phone_Number,
  } = req.body;

  if (
    [Full_Name, Email_Address, Choose_Gender, Password, Confirm_Password].some(
      (field) => field?.trim() === ""
    )
  ) {
    return APIresponse(res, "Required field is missing", 400, false);
  }

  if (Password !== Confirm_Password) {
    return APIresponse(res, "Confirm password is not matched", 400, false);
  }

  const existedUser = await User_Model.findOne({ Email_Address });
  if (existedUser) {
    return APIresponse(
      res,
      "User with this Email address is already Registered",
      400,
      false
    );
  }

  const Email_OTP = generateOTP();
  const Phone_OTP = generateOTP();
  const Email_OTP_Expiration = new Date();
  Email_OTP_Expiration.setSeconds(Email_OTP_Expiration.getSeconds() + 1800);

  const register_User = await User_Model.create({
    Email_Address,
    Email_OTP_Expiration,
    Password,
    Email_OTP,
    Full_Name,
    Choose_Gender,
  });

  const saved_user = await User_Model.findById(register_User._id).select(
    "-Password"
  );
  if (!saved_user) {
    return APIresponse(
      res,
      "Somethig went wrong during register User details",
      500,
      false
    );
  }

  await sendEMail(Email_Address, Email_OTP);

  if (Phone_Number) {
    if (Phone_Number.length !== 13) {
      return APIresponse(
        res,
        "Please Enter Exact 13 digit Phone Number",
        400,
        false
      );
    }

    const existedUser = await User_Model.findOne({ Phone_Number });

    if (existedUser) {
      return APIresponse(
        res,
        "User with this Phone number is already Registered",
        400,
        false
      );
    }

    const Phone_OTP_Expiration = new Date();
    Phone_OTP_Expiration.setSeconds(Phone_OTP_Expiration.getSeconds() + 1800);
    register_User.Phone_Number = Phone_Number;
    register_User.Phone_OTP = Phone_OTP;
    register_User.Phone_OTP_Expiration = Phone_OTP_Expiration;

    await register_User.save();
    await sendSMS(Phone_Number, Phone_OTP);
  }

  const acess_token = await generateAccessToken(register_User._id);
  const options = {
    httpOnly: true,
    secure: false,
    expires: new Date(Date.now() + parseInt(process.env.COOKIES_EXPIRY_DATE)),
  };

  return res
    .status(201)
    .cookie("acess_token", acess_token, options)
    .json(
      APIresponse(res, "User registered Sucessfully", 201, true, {
        Acess_Token: acess_token,
        saved_user,
      })
    );
});

// Verify email (DONE)
const verifyEmailOTP = asyncHandler(async (req, res) => {
  const { Email_OTP } = req.body;

  if (!Email_OTP) {
    return APIresponse(res, "Email OTP is required", 401, false);
  }

  if (Email_OTP.length !== 4) {
    return APIresponse(res, "please Enter Exact 4 Digit OTP", 401, false);
  }

  const User_Details = await User_Model.findById(req.user._id).select(
    "-Password"
  );
  if (!User_Details) {
    return APIresponse(res, "User Not found", 401, false);
  }

  if (User_Details.Email_OTP_Expiration < Date.now()) {
    User_Details.Email_OTP = "";
    await User_Details.save();
    return APIresponse(res, "Your OTP has been Expired", 401, false);
  }

  if (
    User_Details.Email_OTP_Attempts >= 3 &&
    User_Details.Email_OTP_LastAttemptAt > new Date(new Date() - 1800)
  ) {
    res.clearCookie("acess_token");
    return APIresponse(
      res,
      "Two many Attempt  , please login or signup again",
      401,
      false
    );
  }

  if (User_Details.Email_OTP !== Email_OTP) {
    User_Details.Email_OTP_Attempts++;
    User_Details.Email_OTP_LastAttemptAt = new Date();
    await User_Details.save();

    return APIresponse(res, "OTP is not Correct", 401, false);
  }

  User_Details.Email_OTP = "";
  User_Details.Email_OTP_Attempts = 0;
  User_Details.Email_OTP_Expiration = null;
  User_Details.Email_OTP_LastAttemptAt = null;
  User_Details.status = 1; // Email Active done
  await User_Details.save();

  return APIresponse(
    res,
    "User OTP verify Sucessfully Sucessfully",
    201,
    true,
    User_Details
  );
});

// Verify Phone (DONE)
const verifyPhoneOTP = asyncHandler(async (req, res) => {
  const { Phone_OTP } = req.body;

  if (!Phone_OTP) {
    return APIresponse(res, "Phone OTP is required", 401, false);
  }

  if (Phone_OTP.length !== 4) {
    return APIresponse(res, "please Enter Exact 4 Digit OTP", 401, false);
  }

  const User_Details = await User_Model.findById(req.user._id).select(
    "-Password"
  );
  if (!User_Details) {
    return APIresponse(res, "User Not found", 401, false);
  }

  if (User_Details.Phone_OTP_Expiration < Date.now()) {
    User_Details.Phone_OTP = "";
    await User_Details.save();
    return APIresponse(res, "Your OTP has been Expired", 401, false);
  }

  if (
    User_Details.Phone_OTP_Attempts >= 3 &&
    User_Details.Phone_OTP_LastAttemptAt > new Date(new Date() - 1800)
  ) {
    res.clearCookie("acess_token");
    return APIresponse(
      res,
      "Two many Attempt  , please try after sometime",
      401,
      false
    );
  }

  if (User_Details.Phone_OTP !== Phone_OTP) {
    User_Details.Phone_OTP_Attempts++;
    User_Details.Phone_OTP_LastAttemptAt = new Date();
    await User_Details.save();

    return APIresponse(res, "OTP is not Correct", 401, false);
  }

  User_Details.Phone_OTP = "";
  User_Details.status = 2;
  User_Details.Phone_OTP_Attempts = 0;
  User_Details.Phone_OTP_Expiration = undefined;
  User_Details.Phone_OTP_LastAttemptAt = undefined;

  await User_Details.save();

  return APIresponse(
    res,
    "User OTP verify Sucessfully Sucessfully",
    201,
    true,
    User_Details
  );
});

// Login (DONE)
const LoginUser = asyncHandler(async (req, res) => {
  const { Email_Address, Password } = req.body;

  if ([Email_Address, Password].some((field) => field?.trim() === "")) {
    return APIresponse(
      res,
      "Plese Enter both Email Address and Password",
      400,
      false
    );
  }

  const user_details = await User_Model.findOne({ Email_Address });

  if (!user_details) {
    return APIresponse(res, "User not found related to this Email", 400, false);
  }

  const result = await user_details.isPasswordCorrect(Password);
  if (!result) {
    return APIresponse(res, "Password is not Correct", 400, false);
  }

  if (user_details.status === 3) {
    return APIresponse(res, "Your Account is Blocked by Admin", 400, false);
  }

  user_details.status = 1;
  await user_details.save();

  const acess_token = await generateAccessToken(user_details._id);
  const options = {
    httpOnly: true,
    secure: false,
    expires: new Date(Date.now() + parseInt(process.env.COOKIES_EXPIRY_DATE)),
  };

  return res
    .status(200)
    .cookie("acess_token", acess_token, options)
    .json(
      APIresponse(res, "User Login Sucessfully", 201, true, {
        Acess_Token: acess_token,
        user: user_details,
      })
    );
});

// ForgotPassword (DONE)
const ForgotPassword = asyncHandler(async (req, res) => {
  const { Email_Address } = req.body;

  if (!Email_Address) {
    return APIresponse(
      res,
      "Email is not Provide Please Provide Email First ",
      400,
      false
    );
  }

  const user_details = await User_Model.findOne({ Email_Address }).select(
    "Password"
  );

  if (!user_details) {
    return APIresponse(
      res,
      "User is not found associated to this Email",
      400,
      false
    );
  }

  const Email_OTP = generateOTP();
  const Email_OTP_Expiration = new Date();
  Email_OTP_Expiration.setSeconds(Email_OTP_Expiration.getSeconds() + 1800);

  user_details.Email_OTP = Email_OTP;
  user_details.Email_OTP_Expiration = Email_OTP_Expiration;
  user_details.status = 0;
  await user_details.save();
  await sendEMail(Email_Address, Email_OTP);

  const acess_token = await generateAccessToken(user_details._id);
  const options = {
    httpOnly: true,
    secure: false,
    expires: new Date(Date.now() + parseInt(process.env.COOKIES_EXPIRY_DATE)),
  };

  return res
    .status(201)
    .cookie("acess_token", acess_token, options)
    .json(
      APIresponse(
        res,
        "OTP send sucessfully on your registered Email Address",
        201,
        true,
        { Acess_Token: acess_token }
      )
    );
});

// Reset password (DONE)
const ResetPassword = asyncHandler(async (req, res) => {
  const { New_Password, Confirm_Password } = req.body;

  if (!(New_Password && Confirm_Password)) {
    return APIresponse(res, "All fields are required", 401, false);
  }

  if (New_Password !== Confirm_Password) {
    return APIresponse(
      res,
      "New Password and Confirm Password is not matched",
      401,
      false
    );
  }

  const user_details = await User_Model.findByIdAndUpdate(req.user._id, {
    $set: { Password: New_Password },
  });
  if (!user_details) {
    return APIresponse(res, "Password not reset sucessfully", 401, false);
  }

  return APIresponse(
    res,
    "Password Reset Sucessfully !!",
    201,
    true,
    user_details
  );
});

// Update password (DONE)
const UpdatePassword = asyncHandler(async (req, res) => {
  const { Old_Password, New_Password } = req.body;
  if (!(Old_Password && New_Password)) {
    return APIresponse(res, "Boths Fields are required", 401, false);
  }

  const user_details = await User_Model.findById(req.user._id);
  const result = await user_details.isPasswordCorrect(Old_Password);

  if (!result) {
    return APIresponse(res, "Old Password is not matched", 400, false);
  }

  // findByIdAndUpdate bypass the mongoDb middleware (OKay)

  // const update_user = await User_Model.findByIdAndUpdate(
  //   req.user.id,
  //   { $set: { Password: New_Password } },
  //   { new: true }
  // );
  const update_user = await User_Model.findById(req.user.id);
  update_user.Password = New_Password;
  await update_user.save();

  if (!update_user) {
    return APIresponse(
      res,
      "Something went Wrong while updating Password",
      500,
      false
    );
  }

  return APIresponse(
    res,
    "Password Change Sucessfully !",
    201,
    true,
    update_user
  );
});

// Edit Profile (DONE)
const EditProfile = asyncHandler(async (req, res) => {
  const Edit_Fields = req.body;

  const user_details = await User_Model.findById(req.user._id);
  if (!user_details || user_details.status === 0 || user_details.status === 3) {
    return APIresponse(
      res,
      "User not found related or Email is not verified or Admin blocked this user",
      400,
      false
    );
  }

  if (req.body.Email_Address) {
    const existedUser = await User_Model.findOne({
      Email_Address: req.body.Email_Address,
    });
    if (existedUser) {
      return APIresponse(
        res,
        "User with this Email address is already Registered",
        400,
        false
      );
    }

    const Email_OTP = generateOTP();
    const Email_OTP_Expiration = new Date();
    Email_OTP_Expiration.setSeconds(Email_OTP_Expiration.getSeconds() + 1800);
    user_details.Email_OTP = Email_OTP;
    user_details.Email_OTP_Expiration = Email_OTP_Expiration;
    user_details.status = 0;
    await user_details.save();

    await sendEMail(req.body.Email_Address, Email_OTP);
  }

  if (req.body.Phone_Number) {
    const existedUser = await User_Model.findOne({ Phone_Number });
    if (existedUser) {
      return APIresponse(
        res,
        "User with this Phone Number is already Registered",
        400,
        false
      );
    }

    const Phone_OTP = generateOTP();
    const Phone_OTP_Expiration = new Date();
    Phone_OTP_Expiration.setSeconds(Phone_OTP_Expiration.getSeconds() + 1800);
    user_details.Phone_OTP = Phone_OTP;
    user_details.Phone_OTP_Expiration = Phone_OTP_Expiration;
    user_details.status = 0;
    await user_details.save();

    await sendSMS(req.body.Phone_Number, Phone_OTP);
  }

  const update_user = await User_Model.findByIdAndUpdate(
    req.user._id,
    Edit_Fields,
    { new: true }
  ).select("-Password");

  if (req.files) {
    const response = await uploadOnCloudinary(req.files.profileImage[0].path);
    update_user.Profile_Image = response.url;
    await update_user.save();
  }

  if (!update_user) {
    return APIresponse(
      res,
      "Edit fields not updated , failed to save Edit details",
      500,
      false
    );
  }

  return APIresponse(
    res,
    "Edit Details Saved Sucessfully !",
    201,
    true,
    update_user
  );
});

// View Users Profile (DONE)
const ViewUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return APIresponse(res, "Id is not defined", 400, false);
  }

  const user_profile = await User_Model.findById(id).select("-Password");
  if (!user_profile) {
    return APIresponse(res, "User not found", 400, false);
  }

  return APIresponse(
    res,
    "User Details Fetched Sucesfully",
    201,
    true,
    user_profile
  );
});

// View My Profile (DONE)
const ViewMyProfile = asyncHandler(async (req, res) => {
  const user_details = await User_Model.findById(req.user._id);
  if (!user_details) {
    return APIresponse(res, "user Profile not found", 400, false);
  }

  return APIresponse(
    res,
    "My Profile fetched sucesfully",
    201,
    true,
    user_details
  );
});

// Ride Share (DONE)
const createRideShare = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Please select fields first", 400, false);
  }

  const post_ride_share = await RideShare.create(allFields);

  if (!post_ride_share) {
    return APIresponse(
      res,
      "Your Request not posted please try again later",
      500,
      false
    );
  }

  post_ride_share.userId = req.user._id;
  await post_ride_share.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: post_ride_share._id,
    category_number: post_ride_share.category_Id,
    category_name: post_ride_share.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not posted completely", 500, false);
  }

  return APIresponse(
    res,
    "Your Request has been Posted sucessfully !",
    201,
    true,
    { post_ride_share, allCategory }
  );
});

// Package Transport (DONE)
const createPackageTransport = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Please select fields first", 400, false);
  }

  const post_package_transport = await PackageTransport.create(allFields);

  if (!post_package_transport) {
    return APIresponse(
      res,
      "Your Request not posted please try again later",
      500,
      false
    );
  }

  post_package_transport.userId = req.user._id;
  await post_package_transport.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: post_package_transport._id,
    category_number: post_package_transport.category_Id,
    category_name: post_package_transport.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not posted completely", 500, false);
  }

  return APIresponse(
    res,
    "Your Request has been Posted sucessfully !",
    201,
    true,
    post_package_transport
  );
});

// Minyan Assembly (DONE)
const createMinyanAssembly = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Please select fields first", 400, false);
  }

  const post_minyan_assembly = await MinyanAssembly.create(allFields);

  if (!post_minyan_assembly) {
    return APIresponse(
      res,
      "Your Request not posted please try again later",
      500,
      false
    );
  }

  post_minyan_assembly.userId = req.user._id;
  await post_minyan_assembly.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: post_minyan_assembly._id,
    category_number: post_minyan_assembly.category_Id,
    category_name: post_minyan_assembly.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not posted completely", 500, false);
  }

  return APIresponse(
    res,
    "Your Request has been Posted sucessfully !",
    201,
    true,
    post_minyan_assembly
  );
});

// Chizuk (DONE)
const createChizuk = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Please select fields first", 400, false);
  }

  const post_chizuk = await Chizuk.create(allFields);

  if (!post_chizuk) {
    return APIresponse(
      res,
      "Your Request not posted please try again later",
      500,
      false
    );
  }

  post_chizuk.userId = req.user._id;
  await post_chizuk.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: post_chizuk._id,
    category_number: post_chizuk.category_Id,
    category_name: post_chizuk.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not posted completely", 500, false);
  }

  return APIresponse(
    res,
    "Your Request has been Posted sucessfully !",
    201,
    true,
    post_chizuk
  );
});

// Free Giveaway (DONE)
const createFreeGiveaway = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Please select fields first", 400, false);
  }

  const post_free_giveaway = await FreeGiveaway.create(allFields);

  if (!post_free_giveaway) {
    return APIresponse(
      res,
      "Your Request not posted please try again later",
      500,
      false
    );
  }

  post_free_giveaway.userId = req.user._id;
  await post_free_giveaway.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: post_free_giveaway._id,
    category_number: post_free_giveaway.category_Id,
    category_name: post_free_giveaway.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not posted completely", 500, false);
  }

  return APIresponse(
    res,
    "Your Request has been Posted sucessfully !",
    201,
    true,
    post_free_giveaway
  );
});

// Advice (DONE)
const createAdvice = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Please select fields first", 400, false);
  }

  const post_advice = await Advice.create(allFields);

  if (!post_advice) {
    return APIresponse(
      res,
      "Your Request not posted please try again later",
      500,
      false
    );
  }

  post_advice.userId = req.user._id;
  await post_advice.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: post_advice._id,
    category_number: post_advice.category_Id,
    category_name: post_advice.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not posted completely", 500, false);
  }

  return APIresponse(
    res,
    "Your Request has been Posted sucessfully !",
    201,
    true,
    post_advice
  );
});

// Wedding Attendees (DONE)
const createWeedingAttendees = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Please select fields first", 400, false);
  }

  const post_wedding_attendees = await WeddingAttendees.create(allFields);

  if (!post_wedding_attendees) {
    return APIresponse(
      res,
      "Your Request not posted please try again later",
      500,
      false
    );
  }

  post_wedding_attendees.userId = req.user._id;
  await post_wedding_attendees.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: post_wedding_attendees._id,
    category_number: post_wedding_attendees.category_Id,
    category_name: post_wedding_attendees.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not posted completely", 500, false);
  }

  return APIresponse(
    res,
    "Your Request has been Posted sucessfully !",
    201,
    true,
    post_wedding_attendees
  );
});

// House hold (DONE)
const createHousehold = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Please select fields first", 400, false);
  }

  const post_house_hold = await HouseHold.create(allFields);

  if (!post_house_hold) {
    return APIresponse(
      res,
      "Your Request not posted please try again later",
      500,
      false
    );
  }

  post_house_hold.userId = req.user._id;
  await post_house_hold.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: post_house_hold._id,
    category_number: post_house_hold.category_Id,
    category_name: post_house_hold.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not posted completely", 500, false);
  }

  return APIresponse(
    res,
    "Your Request has been Posted sucessfully !",
    201,
    true,
    post_house_hold
  );
});

// Lost and Fun (DONE)
const createLostAndFound = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Please select fields first", 400, false);
  }

  const post_lost_and_fun = await LostAndFound.create(allFields);

  if (!post_lost_and_fun) {
    return APIresponse(
      res,
      "Your Request not posted please try again later",
      500,
      false
    );
  }

  post_lost_and_fun.userId = req.user._id;
  await post_lost_and_fun.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: post_lost_and_fun._id,
    category_number: post_lost_and_fun.category_Id,
    category_name: post_lost_and_fun.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not posted completely", 500, false);
  }

  return APIresponse(
    res,
    "Your Request has been Posted sucessfully !",
    201,
    true,
    post_lost_and_fun
  );
});

// Study Partner (DONE)
const createStudyPartners = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Please select fields first", 400, false);
  }

  const post_study_partner = await StudyPartner.create(allFields);

  if (!post_study_partner) {
    return APIresponse(
      res,
      "Your Request not posted please try again later",
      500,
      false
    );
  }

  post_study_partner.userId = req.user._id;
  await post_study_partner.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: post_study_partner._id,
    category_number: post_study_partner.category_Id,
    category_name: post_study_partner.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not posted completely", 500, false);
  }

  return APIresponse(
    res,
    "Your Request has been Posted sucessfully !",
    201,
    true,
    post_study_partner
  );
});

// Create Meal train (DONE)
const createMealTrain = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Please select fields first", 400, false);
  }

  const post_meal_train = await MealTrain.create(allFields);

  if (!post_meal_train) {
    return APIresponse(
      res,
      "Your Request not posted please try again later",
      500,
      false
    );
  }

  post_meal_train.userId = req.user._id;
  await post_meal_train.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: post_meal_train._id,
    category_number: post_meal_train.category_Id,
    category_name: post_meal_train.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not posted completely", 500, false);
  }

  return APIresponse(
    res,
    "Your Request has been Posted sucessfully !",
    201,
    true,
    post_meal_train
  );
});

// Gemach Finder (DONE)
const createGemachFinder = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Please select fields first", 400, false);
  }

  const post_gemach_finder = await GemachFinder.create(allFields);

  if (!post_gemach_finder) {
    return APIresponse(
      res,
      "Your Request not posted please try again later",
      500,
      false
    );
  }

  post_gemach_finder.userId = req.user._id;
  await post_gemach_finder.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: post_gemach_finder._id,
    category_number: post_gemach_finder.category_Id,
    category_name: post_gemach_finder.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not posted completely", 500, false);
  }

  return APIresponse(
    res,
    "Your Request has been Posted sucessfully !",
    201,
    true,
    post_gemach_finder
  );
});

// Moving Items (DONE)
const createMovingItems = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Please select fields first", 400, false);
  }

  const post_moving_items = await MovingItems.create(allFields);

  if (!post_moving_items) {
    return APIresponse(
      res,
      "Your Request not posted please try again later",
      500,
      false
    );
  }

  post_moving_items.userId = req.user._id;
  await post_moving_items.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: post_moving_items._id,
    category_number: post_moving_items.category_Id,
    category_name: post_moving_items.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not posted completely", 500, false);
  }

  return APIresponse(
    res,
    "Your Request has been Posted sucessfully !",
    201,
    true,
    post_moving_items
  );
});

// Accept a Particular request (DONE)
const acceptRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return APIresponse(res, "Please provide request ID", 400, false);
  }

  const request_details = await getRequestById(id);
  if (!request_details) {
    return APIresponse(res, "Request details not fetched", 500, false);
  }

  request_details.status = 1;
  request_details.accepted_userId = req.user._id;
  await request_details.save();

  const all_category = await AllCategory.findOne({ requestId: id });
  all_category.requestedUser = req.user._id;
  await all_category.save();

  return APIresponse(
    res,
    "request fetched sucessfully !",
    201,
    true,
    request_details
  );
});

// View a particular Request (DONE)
const viewRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return APIresponse(res, "Please provide request ID", 400, false);
  }

  const request_details = await getRequestById(id);
  if (!request_details) {
    return APIresponse(res, "Request details not fetched", 500, false);
  }

  return APIresponse(
    res,
    "request fetched sucessfully !",
    201,
    true,
    request_details
  );
});

// Search requestByCategoryName (DONE)
const searchRequestByCategoryName = asyncHandler(async (req, res) => {
  const { category_name } = req.body;

  if (!category_name) {
    return APIresponse(res, "Please enter Category Name first", 400, false);
  }

  const search_result = await AllCategory.find({
    category_name: category_name,
  }).populate("requestId");
  if (!search_result) {
    return APIresponse(
      res,
      "search result is not valid , or no request find with this category",
      400,
      false
    );
  }

  return APIresponse(
    res,
    "Category fetched sucessfully!",
    201,
    true,
    search_result
  );
});

// Show all requests (DONE)
const showAllRequest = asyncHandler(async (req, res) => {
  const all_requests = await AllCategory.find().populate("requestId");
  if (!all_requests) {
    return APIresponse(res, "Error during fetching all requests", 500, false);
  }

  return APIresponse(
    res,
    "All request fetched sucessfully !",
    201,
    true,
    all_requests
  );
});

// RequestCreatedByMe (DONE)
const requestCreatedByMe = asyncHandler(async (req, res) => {
  const created_request = await AllCategory.find({ userId: req.user._id });
  if (!created_request) {
    return APIresponse(res, "User not created any request yet", 400, false);
  }
  return APIresponse(
    res,
    "Created request fetched sucessfully !",
    201,
    true,
    created_request
  );
});

// MyAcceptedRequest (DONE)
const acceptedRequestByMe = asyncHandler(async (req, res) => {
  const accepted_request = await AllCategory.find({
    requestedUser: req.user._id,
  });
  if (!accepted_request) {
    return APIresponse(res, "User not accepted any request yet", 400, false);
  }
  return APIresponse(
    res,
    "Accepted request fetched sucessfully !",
    201,
    true,
    accepted_request
  );
});

// Close request (DONE)
const closeRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return APIresponse(res, "Please provide request ID", 400, false);
  }

  const request_details = await getRequestById(id);

  if (request_details.userId !== req.user._id) {
    return APIresponse(
      res,
      "this request is not created by this user",
      400,
      false
    );
  }

  request_details.status = 3;
  await request_details.save();

  if (!request_details) {
    return APIresponse(
      res,
      "request not closed because this request is not created by this user ",
      500,
      false
    );
  }

  return APIresponse(
    res,
    "request closed sucessfully !",
    201,
    true,
    request_details
  );
});

// Cancel request (DONE)
const cancelRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return APIresponse(res, "Please provide request ID", 400, false);
  }
  const cancel_details = await AllCategory.findOneAndDelete({
    userId: req.user._id,
    requestId: id,
  });
  const request_cancel_details = await cancelRequestById(id);

  if (!(request_cancel_details && cancel_details)) {
    return APIresponse(
      res,
      "request not cancel becuse this user is not created this request ",
      400,
      false
    );
  }

  return APIresponse(
    res,
    "request cancel sucessfully !",
    201,
    true,
    request_cancel_details
  );
});

// Google Login (DONE)
const googleLogin = asyncHandler(async (req, res) => {
  const redirectURI = encodeURIComponent(
    "http://localhost:7535/user/v1/verifyGoogle"
  );
  const authURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${redirectURI}&response_type=code&scope=email%20profile`;

  return APIresponse(
    res,
    "Click this link to verify the Google account",
    201,
    true,
    authURL
  );
});

// Verify Login (DONE)
const verifyGoogle = asyncHandler(async (req, res) => {
  const code = req.query.code;
  const tokenResponse = await axios.post(
    "https://oauth2.googleapis.com/token",
    querystring.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: code,
      redirect_uri: "http://localhost:7535/user/v1/verifyGoogle",
      grant_type: "authorization_code",
    })
  );

  const accessToken = tokenResponse.data.access_token;

  // Fetch user details from Google using the access token
  const profileResponse = await axios.get(
    "https://www.googleapis.com/oauth2/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const alredy_user = await User_Model.findOne({
    GoogleId: profileResponse.data.id,
  });
  if (alredy_user) {
    const acess_token = await generateAccessToken(alredy_user._id);
    const options = {
      httpOnly: true,
      secure: false,
      expires: new Date(Date.now() + parseInt(process.env.COOKIES_EXPIRY_DATE)),
    };

    return res
      .status(201)
      .cookie("acess_token", acess_token, options)
      .json(
        APIresponse(res, "User Login Sucessfully", 201, true, {
          Acess_Token: acess_token,
          User_Details: alredy_user,
        })
      );
  }

  const saved_user = await User_Model.create({
    GoogleId: profileResponse.data.id,
    Email_Address: profileResponse.data.email,
    Full_Name: profileResponse.data.name,
    Profile_Image: profileResponse.data.picture,
    status: 1,
  });

  if (!saved_user) {
    return APIresponse(res, "User not Saved Sucessfully", 500, false);
  }

  const acess_token = await generateAccessToken(saved_user._id);
  const options = {
    httpOnly: true,
    secure: false,
    expires: new Date(Date.now() + parseInt(process.env.COOKIES_EXPIRY_DATE)),
  };

  return res
    .status(201)
    .cookie("acess_token", acess_token, options)
    .json(
      APIresponse(res, "User registered Sucessfully", 201, true, {
        Acess_Token: acess_token,
        saved_user,
      })
    );
});

// Follow API (DONE)
const follow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return APIresponse(res, "Id not found please pass user ID", 400, false);
  }

  const user_exist = await User_Model.findById(id);
  if (!user_exist) {
    return APIresponse(res, "User whom following you is not found", 400, false);
  }

  const already_follow = await Follow.findOne({
    user_who_following: req.user._id,
    user_whom_following: id,
  });
  if (already_follow) {
    return APIresponse(res, "User Alredy followed to this User", 400, false);
  }

  const user_follow = await Follow.create({
    user_who_following: req.user._id,
    user_whom_following: id,
  });

  if (!user_follow) {
    return APIresponse(res, " User not followed ", 500, false);
  }

  return APIresponse(res, "User Followed Sucessfully", 201, true, user_follow);
});

// unFollow API (DONE)
const unFollow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return APIresponse(res, "Id not found please pass user ID", 400, false);
  }

  const user_exist = await User_Model.findById(id);
  if (!user_exist) {
    return APIresponse(
      res,
      "User whom unfollowing you is not found",
      400,
      false
    );
  }

  const user_unfollow = await Follow.findOneAndDelete({
    user_who_following: req.user._id,
    user_whom_following: id,
  });
  if (!user_unfollow) {
    return APIresponse(res, "this User not followed another user", 400, false);
  }

  return APIresponse(
    res,
    "User unFollowed Sucessfully",
    201,
    true,
    user_unfollow
  );
});

// numberOfFollowers API (DONE)
const numberOfFollowers = asyncHandler(async (req, res) => {
  const followers_count = await getNumberOfFollowers(req);
  if (!followers_count) {
    return APIresponse(res, "Follower count not fetched", 400, false);
  }

  return APIresponse(
    res,
    "Folloer count fetched sucessfully",
    201,
    true,
    followers_count
  );
});

// numberOfFollowings API (DONE)
const numberOfFollowings = asyncHandler(async (req, res) => {
  const following_count = await getNumberOfFollowings(req);
  if (!following_count) {
    return APIresponse(res, "Following count not fetched", 400, false);
  }

  return APIresponse(
    res,
    "Following count fetched sucessfully",
    201,
    true,
    following_count
  );
});

// Logout API (DONE)
const logout = asyncHandler(async (req, res) => {
  const user_details = await User_Model.findByIdAndUpdate(
    req.user._id,
    { $set: { status: 0 } },
    { new: true }
  ).select("-Password");
  if (!user_details) {
    return APIresponse(res, "Error during set status of user", 500, false);
  }

  await res.clearCookie("acess_token");
  return APIresponse(res, "User Logout Sucessfully", 201, true, user_details);
});

// Post Complement API (DONE)
const Creatcompliment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { Thumbs_Up, Compliment_text } = req.body;
  const complimented_user = await User_Model.findById(id);
  if (!complimented_user) {
    return APIresponse(res, "Complimented user not found", 400, false);
  }
  const alreday_complimented = await Compliment.findOne({
    From_Compliment: id,
    To_Compliment: req.user._id,
  });
  if (alreday_complimented) {
    return APIresponse(
      res,
      "User alredy  gave the compliment of this user",
      400,
      false
    );
  }

  const compliment_created = await Compliment.create({
    Compliment_text,
    From_Compliment: req.user._id,
    To_Compliment: id,
  });

  if (!compliment_created) {
    return APIresponse(res, "Compliment not posted !", 400, false);
  }

  if (Thumbs_Up) {
    compliment_created.Thumbs_Up = true;
    await compliment_created.save();
  }

  return APIresponse(
    res,
    "Complimented posted Sucessfully !",
    201,
    true,
    compliment_created
  );
});

// Delete Compliment API (DONE)
const deleteCompliment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complimented_user = await User_Model.findById(id);
  if (!complimented_user) {
    return APIresponse(res, "Complimented user not found", 400, false);
  }

  const delete_complimented = await Compliment.findOneAndDelete({
    From_Compliment: req.user._id,
    To_Compliment: id,
  });
  if (!delete_complimented) {
    return APIresponse(
      res,
      "User not complimented this user perior",
      400,
      false
    );
  }

  return APIresponse(
    res,
    "Delete Compliment Sucessfully",
    201,
    true,
    delete_complimented
  );
});

// Delete account API (DONE)
const deleteAccount = asyncHandler(async (req, res) => {
  const deleted_user = await User_Model.findByIdAndDelete(req.user._id).select(
    "-Password"
  );
  if (!deleted_user) {
    return APIresponse(res, "User not deleted", 400, false);
  }

  return APIresponse(
    res,
    "User Deleted Sucessfully !",
    201,
    true,
    deleted_user
  );
});

// Dynamic (Create Category) (DONE)
const createRequest = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Plese Enter Required Fields", 400, false);
  }

  const categorySchema = searchCollectionName(req.body.Service_Name);
  if (!categorySchema) {
    return APIresponse(res, "Please enter Correct Schema", 400, false);
  }
  const category_created = await categorySchema.create(allFields);
  if (!category_created) {
    return APIresponse(res, "Category not created", 400, false);
  }
  category_created.userId = req.user._id;
  await category_created.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: category_created._id,
    category_number: category_created.category_Id,
    category_name: category_created.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not saved Sucessfully !", 400, false);
  }

  return APIresponse(
    res,
    "Category Created Sucessfully",
    201,
    true,
    category_created
  );
});

// Request Mark as Done (DONE)
const markAsDone = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const is_Your_request = await AllCategory.findOne({
    userId: req.user._id,
    requestId: id,
  });
  if (!is_Your_request) {
    return APIresponse(
      res,
      "Request not mark as done because you not created this request",
      400,
      false
    );
  }

  const request = await getRequestById(id);
  request.status = 3;
  await request.save();
  if (!request) {
    return APIresponse(res, "Request not marked", 400, false);
  }

  return APIresponse(
    res,
    "Your request marks done sucessfully !",
    201,
    true,
    request
  );
});

// Edit Request (DONE)
const editRequest = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "edit Fields are required", 400, false);
  }
  const { id } = req.params;
  const check_request = await AllCategory.findOne({
    userId: req.user._id,
    requestId: id,
  });
  if (!check_request) {
    return APIresponse(
      res,
      "This request is not created by you  so , you can't edit this request",
      400,
      false
    );
  }

  const category_model = searchCollectionName(check_request.category_name);
  const edit_request = await category_model.findByIdAndUpdate(id, allFields, {
    new: true,
  });
  if (!edit_request) {
    return APIresponse(res, "Edit Details not saved", 400, false);
  }

  return APIresponse(
    res,
    "your request edit sucessfully !",
    201,
    true,
    edit_request
  );
});

// Donate us API (DONE)
const donateUs = asyncHandler(async (req, res) => {
  const { Choose_Amount, Enter_Amount } = req.body;
  if (!(Choose_Amount || Enter_Amount)) {
    return APIresponse(res, "Please choose atleast one field", 400, false);
  }

  const Donated = await Donate.create({
    Choose_Amount,
    Enter_Amount,
    userId: req.user._id,
  });

  if (!Donated) {
    return APIresponse(res, "Amount not donated", 400, false);
  }

  return APIresponse(res, "Amount Donated Sucessfully !", 201, true, Donated);
});

// sorted by Date API ascending/descending order (DONE)
const sortByDate = asyncHandler(async (req, res) => {
  const { order } = req.body;
  if (!order) {
    return APIresponse(res, "Please enter order type", 400, false);
  }
  const sorted_data = await getOrderByDate(order);
  if (!sorted_data) {
    return APIresponse(res, "Order is not sorted", 400, false);
  }
  return APIresponse(res, "request sorted", 201, true, sorted_data);
});

// 5 upcomingRequest API (DONE)
const upcomingRequest = asyncHandler(async (req, res) => {
  const upcoming_requests = await getUpcomingRequest();
  if (!upcomingRequest) {
    return APIresponse(res, "Request not fetched ", 400, false);
  }

  return APIresponse(
    res,
    "Details Fetched Sucessfully !",
    201,
    true,
    upcoming_requests
  );
});

// addDocument API (DONE)
const addDocument = asyncHandler(async (req, res) => {
  const { License_Number } = req.body;
  const user_details = await User_Model.findById(req.user._id).select(
    "-Password"
  );
  user_details.License_Number = License_Number;
  const response = await uploadOnCloudinary(req.files.Document[0].path);
  user_details.Document_Photo = response.url;
  await user_details.save();
  if (!user_details) {
    return APIresponse(
      res,
      "License and documnet photo not uploaded yet",
      400,
      false
    );
  }

  return APIresponse(res, "Profile Added Sucessfully", 201, true, user_details);
});

// Accept RideShare request (DONE)
const RideShareRequest = asyncHandler(async (req, res) => {
  const allFields = req.body;
  const { id } = req.params;
  if (!allFields) {
    return APIresponse(res, "Please Enter required fields ", 400, false);
  }

  const rideShare_category = await getRequestById(id);
  if (!rideShare_category) {
    return APIresponse(res, "request not found", 400, false);
  }

  const accept_request = await AcceptRideShare.create(allFields);

  if (!accept_request) {
    return APIresponse(res, "accept not saved", 400, false);
  }

  accept_request.userId_creator = rideShare_category.userId;
  accept_request.userId_acceptor = req.user._id;
  accept_request.requestId = req.body.params;
  accept_request.category_Id = rideShare_category.category_Id;
  await accept_request.save();

  if (!accept_request) {
    return APIresponse(res, "Your Help request is not accepted", 400, false);
  }

  return APIresponse(
    res,
    "Your Ride Share request sucessfully accepted",
    201,
    true,
    accept_request
  );
});

// add my address on profile (DONE)
const addAddress = asyncHandler(async (req, res) => {
  const { address } = req.body;
  if (!address) {
    return APIresponse(res, "Please provide address", 400, false);
  }

  const user_details = await User_Model.findById(req.user._id).select(
    "-Password"
  );
  if (!user_details) {
    return APIresponse(res, "User not found", 400, false);
  }
  user_details.address = address;
  await user_details.save();

  return APIresponse(
    res,
    "Your address added sucessfully!",
    201,
    true,
    user_details
  );
});

// ChesedHistory (DONE)
const ChesedHistory = asyncHandler(async (req, res) => {
  const History = await getHistory();
  if (!History) {
    return APIresponse(res, "No History found", 400, false);
  }

  return APIresponse(res, "History found Sucessfully!", 200, true, History);
});

// EmailNotification (DONE)
const setEmailNotification = asyncHandler(async (req, res) => {
  const { Check } = req.body;
  if (Check) {
    const update_notification = await User_Model.findByIdAndUpdate(
      req.user._id,
      { EmailNotification: true },
      { new: true }
    ).select("-Password");

    if (!update_notification) {
      return APIresponse(res, "Notification not updated", 400, false);
    }

    return APIresponse(
      res,
      "Notification updated",
      200,
      true,
      update_notification
    );
  } else {
    const update_notification = await User_Model.findByIdAndUpdate(
      req.user._id,
      { EmailNotification: false },
      { new: true }
    ).select("-Password");

    if (!update_notification) {
      return APIresponse(res, "Notification not updated", 400, false);
    }

    return APIresponse(
      res,
      "Notification updated",
      200,
      true,
      update_notification
    );
  }
});

//PushNotification (DONE)
const setPushNotification = asyncHandler(async (req, res) => {
  const { Check } = req.body;
  if (Check) {
    const update_notification = await User_Model.findByIdAndUpdate(
      req.user._id,
      { PushNotification: true },
      { new: true }
    ).select("-Password");

    if (!update_notification) {
      return APIresponse(res, "Notification not updated", 400, false);
    }

    return APIresponse(
      res,
      "Notification updated",
      200,
      true,
      update_notification
    );
  } else {
    const update_notification = await User_Model.findByIdAndUpdate(
      req.user._id,
      { PushNotification: false },
      { new: true }
    ).select("-Password");

    if (!update_notification) {
      return APIresponse(res, "Notification not updated", 400, false);
    }

    return APIresponse(
      res,
      "Notification updated",
      200,
      true,
      update_notification
    );
  }
});

// SMSNotification (DONE)
const setSMSNotification = asyncHandler(async (req, res) => {
  const { Check } = req.body;
  if (Check) {
    const update_notification = await User_Model.findByIdAndUpdate(
      req.user._id,
      { SMSNotification: true },
      { new: true }
    ).select("-Password");

    if (!update_notification) {
      return APIresponse(res, "Notification not updated", 400, false);
    }

    return APIresponse(
      res,
      "Notification updated",
      200,
      true,
      update_notification
    );
  } else {
    const update_notification = await User_Model.findByIdAndUpdate(
      req.user._id,
      { SMSNotification: false },
      { new: true }
    ).select("-Password");

    if (!update_notification) {
      return APIresponse(res, "Notification not updated", 400, false);
    }

    return APIresponse(
      res,
      "Notification updated",
      200,
      true,
      update_notification
    );
  }
});

// Show PrivacyPolicy (DONE)
const showPrivacyPolicy = asyncHandler(async (req, res) => {
  const privacy_policy = await PrivacyPolicy.find({});
  if (!privacy_policy) {
    return APIresponse(res, "Privacy Policy not found", 400, false);
  }

  return APIresponse(res, "Privacy Policy found", 200, true, privacy_policy);
});

// showTermAndCondition (DONE)
const showTermAndCondition = asyncHandler(async (req, res) => {
  const term_condition = await TermAndCondition.find({});
  if (!term_condition) {
    return APIresponse(res, "Term and Condition not found", 400, false);
  }
  return APIresponse(
    res,
    "Term and Condition found",
    200,
    true,
    term_condition
  );
});

// showContactUs (DONE)
const showContactUs = asyncHandler(async (req, res) => {
  const contact_us = await ContactUs.find({});
  if (!contact_us) {
    return APIresponse(res, "Contact Us not found", 400, false);
  }
  return APIresponse(res, "Contact Us found", 200, true, contact_us);
});

// showAboutUs (DONE)
const showAboutUs = asyncHandler(async (req, res) => {
  const about_us = await About.find({});
  if (!about_us) {
    return APIresponse(res, "About Us not found", 400, false);
  }
  return APIresponse(res, "About Us found", 200, true, about_us[0]);
});

// showFAQ (DONE)
const showFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.find({});
  if (!faq) {
    return APIresponse(res, "FAQ not found", 400, false);
  }
  return APIresponse(res, "FAQ found", 200, true, faq);
});

// ---------------------##############------------**********--------------
//                      TEST API's
// ---------------------##############------------**********--------------
// Test API's
const GOOGLE_API_KEY = "AIzaSyDOTM44YKPwaP8Svznu5_0f-yoDwXc5TRk";
const CX = "91fee730f5fed42f8";
const SEARCH_URL = "https://www.googleapis.com/customsearch/v1";

const getRandomImage = async (req, res) => {
  try {
    const randomSeed = Math.floor(Math.random() * 100) + 1;
    console.log(randomSeed);
    const response = await axios.get(SEARCH_URL, {
      params: {
        key: GOOGLE_API_KEY,
        cx: CX,
        q: "random",
        num: 5, // Number of images to fetch
        searchType: "image",
        start: randomSeed,
      },
    });
    const imageUrl = response.data.items.map((item) => item.link);
    res.json({ imageUrl });
  } catch (error) {
    console.error("Error fetching random image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Oxford Dictionaries API configuration
const APP_ID = "9356dc15";
const APP_KEY = "cd210f6352fa3fcfba25ea71a1c61426";
const BASE_URL = "https://od-api-sandbox.oxforddictionaries.com/api/v2";

// Function to fetch word definitions
const fetchWordDefinitions = async (req, res) => {
  const { word } = req.body;
  console.log(word);

  try {
    const response = await axios.get(
      `${BASE_URL}/entries/en-gb/${word.toLowerCase()}`,
      {
        headers: {
          app_id: APP_ID,
          app_key: APP_KEY,
        },
      }
    );

    // return res.status(201).json.stringify({ response });
    if (response.data && response.data.results.length > 0) {
      // Extract definitions from the response
      const definitions = response.data.results.map((result) => {
        return {
          word: result.word,
          lexicalCategory: result.lexicalEntries[0].lexicalCategory.text,
          definitions: result.lexicalEntries[0].entries[0].senses.map(
            (sense) => sense.definitions[0]
          ),
        };
      });

      return res.status(200).json(definitions);
    } else {
      // No entry found matching the word
      return res
        .status(404)
        .json({ message: "No definitions found for the word." });
    }
  } catch (error) {
    // Handle other errors

    console.error("Error fetching word definitions:", error);
    return res.status(500).json({ Error: "Internal Server Error" });
  }
};

// Dynamic (createDynamicRequest) (DONE)
const createDynamicRequest = asyncHandler(async (req, res) => {
  const allFields = req.body;
  if (!allFields) {
    return APIresponse(res, "Plese Enter Required Fields", 400, false);
  }

  const category_created = await CreateRequest.create(allFields);
  if (!category_created) {
    return APIresponse(res, "Category not created", 400, false);
  }
  category_created.userId = req.user._id;
  await category_created.save();

  const allCategory = await AllCategory.create({
    userId: req.user._id,
    requestId: category_created._id,
    category_number: category_created.category_Id,
    category_name: category_created.Service_Name,
  });

  if (!allCategory) {
    return APIresponse(res, "Request not saved Sucessfully !", 400, false);
  }

  return APIresponse(
    res,
    "Category Created Sucessfully",
    201,
    true,
    category_created
  );
});

// find by category using (Regular Expression):-
const findRequestByCategoryName = asyncHandler(async (req, res) => {
  const { category_name } = req.body;
  const regex = new RegExp(category_name, "i"); // 'i' for case-insensitive search
  const category = await CreateRequest.find({
    Category_Name: { $regex: regex },
  });
  if (!category) {
    return APIresponse(res, "Category not found", 400, false);
  }

  return APIresponse(res, "Category found sucessfully!!", 200, true, category);
});

// Exports
export {
  SignUp,
  verifyEmailOTP,
  verifyPhoneOTP,
  LoginUser,
  ForgotPassword,
  ResetPassword,
  UpdatePassword,
  EditProfile,
  ViewUserProfile,
  createRideShare,
  createAdvice,
  createChizuk,
  createFreeGiveaway,
  createHousehold,
  createLostAndFound,
  createMinyanAssembly,
  createPackageTransport,
  createStudyPartners,
  createWeedingAttendees,
  createGemachFinder,
  createMealTrain,
  createMovingItems,
  acceptRequest,
  viewRequest,
  searchRequestByCategoryName,
  showAllRequest,
  googleLogin,
  verifyGoogle,
  ViewMyProfile,
  requestCreatedByMe,
  acceptedRequestByMe,
  closeRequest,
  cancelRequest,
  follow,
  unFollow,
  numberOfFollowers,
  numberOfFollowings,
  logout,
  Creatcompliment,
  deleteCompliment,
  deleteAccount,
  createRequest,
  markAsDone,
  editRequest,
  donateUs,
  sortByDate,
  upcomingRequest,
  addDocument,
  RideShareRequest,
  addAddress,
  ChesedHistory,
  getRandomImage,
  fetchWordDefinitions,
  setEmailNotification,
  setPushNotification,
  setSMSNotification,
  showFAQ,
  showAboutUs,
  showContactUs,
  showTermAndCondition,
  showPrivacyPolicy,
  createDynamicRequest,
  findRequestByCategoryName,
};
