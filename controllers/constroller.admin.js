import { configDotenv } from "dotenv";
configDotenv();

import { asyncHandler } from "../utils/AsyncHandler.js";
import { Admin_Model } from "../models/model.Admin.js";
import { APIresponse } from "../utils/ApiResponse.js";
import {
  generateAdminAccessToken,
  getTotalRevenue,
  getNewuser,
} from "../dao/dao.admin.js";
import { User_Model } from "../models/model.user.js";
import { AllCategory } from "../models/model.allCategory.js";
import { Donate } from "../models/model.donate.js";
import { PrivacyPolicy } from "../models/model.privacyPolicy.js";
import { ContactUs } from "../models/model.contactUs.js";
import { TermAndCondition } from "../models/model.termAndCondition.js";
import { About } from "../models/model.aboutUs.js";
import { FAQ } from "../models/model.FAQ.js";

// Create Admin (DONE)
const createAdmin = asyncHandler(async (req, res) => {
  const { Email, Password, secret_key } = req.body;

  if (!Email || !Password || !secret_key) {
    return APIresponse(res, "Please fill all the fields", 400, false);
  }

  const isAlreadyAdmin = await Admin_Model.findOne({ Email });
  if (isAlreadyAdmin) {
    return APIresponse(res, "Admin already exists", 400, false);
  }

  if (secret_key !== process.env.ADMIN_SECRET_KEY) {
    return APIresponse(res, "unauthorised admin", 400, false);
  }

  const admin = await Admin_Model.create({
    Email,
    Password,
  });

  if (!admin) {
    return APIresponse(res, "Admin not created", 400, false);
  }

  const admin_acess_token = await generateAdminAccessToken(admin._id);
  const options = {
    httpOnly: true,
    secure: false,
    expires: new Date(Date.now() + parseInt(process.env.COOKIES_EXPIRY_DATE)),
  };

  return res
    .status(201)
    .cookie("admin_acess_token", admin_acess_token, options)
    .json(
      APIresponse(res, "Admin registered Sucessfully", 201, true, {
        Admin_Acess_Token: admin_acess_token,
        admin,
      })
    );
});

// Login Adnmin (DONE)
const LoginAdmin = asyncHandler(async (req, res) => {
  const { Email, Password, secret_key } = req.body;

  if ([Email, Password].some((field) => field?.trim() === "")) {
    return APIresponse(
      res,
      "Plese Enter both Email Address and Password",
      400,
      false
    );
  }

  if (secret_key !== process.env.ADMIN_SECRET_KEY) {
    return APIresponse(res, "Invalid Secret Key", 400, false);
  }

  const admin_details = await Admin_Model.findOne({ Email });

  if (!admin_details) {
    return APIresponse(
      res,
      "Admin not found related to this Email",
      400,
      false
    );
  }

  const result = await admin_details.isPasswordCorrect(Password);
  if (!result) {
    return APIresponse(res, "Password is not Correct", 400, false);
  }

  const admin_acess_token = await generateAdminAccessToken(admin_details._id);
  const options = {
    httpOnly: true,
    secure: false,
    expires: new Date(Date.now() + parseInt(process.env.COOKIES_EXPIRY_DATE)),
  };

  return res
    .status(200)
    .cookie("admin_acess_token", admin_acess_token, options)
    .json(
      APIresponse(res, "Admin Login Sucessfully", 201, true, {
        Admin_Acess_Token: admin_acess_token,
        admin: admin_details,
      })
    );
});

// Update Admin (DONE)
const updateAdmin = asyncHandler(async (req, res) => {
  const { Email, Password } = req.body;
  // again findByIdAndUpdate() bypass the hooks of mongoose
  const admin = await Admin_Model.findByIdAndUpdate(
    req.admin._id,
    { Email },
    { new: true }
  );
  if (!admin) {
    return APIresponse(res, "Admin not found", 400, false);
  }
  if (Password) {
    admin.Password = Password;
    await admin.save();
  }
  return APIresponse(res, "Admin updated", 200, true, admin);
});

// Delete Admin (DONE)
const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin_Model.findByIdAndDelete(req.admin._id);
  res.clearCookie("userToken");
  if (!admin) {
    return APIresponse(res, "Admin not deleted", 400, false);
  }

  return APIresponse(res, "Admin deleted Sucessfully !", 200, true, admin);
});

// Blocked User (DONE)
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_detail = await User_Model.findById(id).select("-Password");
  if (!user_detail) {
    return APIresponse(res, "User not found", 400, false);
  }

  user_detail.status = 3;
  await user_detail.save();

  return APIresponse(res, "User blocked", 200, true, user_detail);
});

// Unblocked User (DONE)
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_detail = await User_Model.findById(id).select("-Password");
  if (!user_detail) {
    return APIresponse(res, "User not found", 400, false);
  }

  user_detail.status = 1;
  await user_detail.save();
  return APIresponse(res, "User Unblocked", 200, true, user_detail);
});

// Total Number of user (DONE)
const totalnumberOfUsers = asyncHandler(async (req, res) => {
  const users = await User_Model.countDocuments();
  return APIresponse(res, "Total Number of Users", 200, true, {
    totalNumberofUser: users,
  });
});

// Total number of Blocked User (DONE)
const numberOfBlockedUser = asyncHandler(async (req, res) => {
  const users = await User_Model.countDocuments({ status: 3 });
  return APIresponse(res, "Total Number of Blocked Users", 200, true, {
    totalNumberofUser: users,
  });
});

// Total number of requests (DONE)
const totalNumberOfRequest = asyncHandler(async (req, res) => {
  const all_requests = await AllCategory.countDocuments();
  return APIresponse(res, "Total Number of Request", 200, true, {
    totalNumberOfRequest: all_requests,
  });
});

// total number of accepted requests (DONE)
const numberOfAcceptedRequest = asyncHandler(async (req, res) => {
  const all_accepted_requests = await AllCategory.countDocuments({ status: 1 });
  return APIresponse(res, "Total Number of Accepted Request", 200, true, {
    numberOfAcceptedRequest: all_accepted_requests,
  });
});

// Number of User Donates (DONE)
const numberOfUserDonates = asyncHandler(async (req, res) => {
  const all_requests = await Donate.countDocuments();
  return APIresponse(res, "Total Revenue", 200, true, {
    totalRevenue: all_requests,
  });
});

// Calculate total revenue (DONE)
const totalRevenue = asyncHandler(async (req, res) => {
  const all_donates = await getTotalRevenue();
  return APIresponse(res, "Total Revenue", 200, true, {
    totalRevenue: all_donates[0].totalRevenue,
  });
});

// calculate new user (DONE)
const newUser = asyncHandler(async (req, res) => {
  const new_user = await getNewuser();
  return APIresponse(res, "new User", 200, true, { newUser: new_user });
});

// create privacyPolicy (DONE)
const privacyPolicy = asyncHandler(async (req, res) => {
  const description = req.body;
  if (!description) {
    return APIresponse(res, "Please Enter Description", 400, false);
  }

  const savePrivacyPolicy = await PrivacyPolicy.create(description);
  if (!privacyPolicy) {
    return APIresponse(res, "Privacy Policy not created", 400, false);
  }

  return APIresponse(
    res,
    "Privacy Policy created Sucessfully",
    201,
    true,
    savePrivacyPolicy
  );
});

// create termAndCondition (DONE)
const termAndCondition = asyncHandler(async (req, res) => {
  const description = req.body;
  if (!description) {
    return APIresponse(res, "Please Enter Description", 400, false);
  }

  const saveTermAndCondition = await TermAndCondition.create(description);
  if (!saveTermAndCondition) {
    return APIresponse(res, "Term and Condition not created", 400, false);
  }

  return APIresponse(
    res,
    "Term and Condition created Sucessfully",
    201,
    true,
    saveTermAndCondition
  );
});

// create contactUs (DONE)
const contactUs = asyncHandler(async (req, res) => {
  const { Email } = req.body;
  if (!Email) {
    return APIresponse(res, "Please Enter Email", 400, false);
  }
  const saveContactUs = await ContactUs.create({ Email });
  if (!saveContactUs) {
    return APIresponse(res, "ContactUs not created", 400, false);
  }

  return APIresponse(
    res,
    "ContactUs created Sucessfully",
    201,
    true,
    saveContactUs
  );
});

// create aboutUs (DONE)
const aboutUs = asyncHandler(async (req, res) => {
  const description = req.body;
  if (!description) {
    return APIresponse(res, "Please Enter Description", 400, false);
  }

  const saveAboutUs = await About.create(description);
  if (!saveAboutUs) {
    return APIresponse(res, "AboutUs not created", 400, false);
  }

  return APIresponse(
    res,
    "AboutUs created Sucessfully",
    201,
    true,
    saveAboutUs
  );
});

// create FAQ (DONE)
const FAQs = asyncHandler(async (req, res) => {
  const question_answer = req.body;
  if (!question_answer) {
    return APIresponse(res, "Please Enter Question and Answer", 400, false);
  }

  const FAQcreated = await FAQ.create(question_answer);

  if (!FAQcreated) {
    return APIresponse(res, "FAQ not created", 400, false);
  }

  return APIresponse(res, "FAQ created Sucessfully", 201, true, FAQcreated);
});

export {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  LoginAdmin,
  blockUser,
  unblockUser,
  totalnumberOfUsers,
  numberOfBlockedUser,
  totalNumberOfRequest,
  numberOfAcceptedRequest,
  numberOfUserDonates,
  totalRevenue,
  newUser,
  privacyPolicy,
  termAndCondition,
  contactUs,
  aboutUs,
  FAQs,
};
