import { Admin_Model } from "../models/model.Admin.js";
import { Donate } from "../models/model.donate.js";
import { User_Model } from "../models/model.user.js";
// Generate Admin Access token
const generateAdminAccessToken = async (adminId) => {
  try {
    const admin = await Admin_Model.findById(adminId);

    const acess_token = await admin.generateAccessToken();
    return acess_token;
  } catch (error) {
    console.log("Error During generate Access Token", error);
  }
};

const getTotalRevenue = async () => {
  return await Donate.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$Enter_Amount" },
      },
    },
  ]);
};

const getNewuser = async () => {
  return await User_Model.aggregate([
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: 3,
    },
  ]);
};

export { generateAdminAccessToken, getTotalRevenue, getNewuser };
