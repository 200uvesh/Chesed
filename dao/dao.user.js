import { User_Model } from "../models/model.user.js";
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
import { AllCategory } from "../models/model.allCategory.js";
import { Follow } from "../models/model.follow.js";
import { Donate } from "../models/model.donate.js";
import mongoose from "mongoose";


// Generate Access token 
const generateAccessToken = async (userId) => {
  try {
    const user = await User_Model.findById(userId);

    const acess_token = await user.generateAccessToken();
    return acess_token;
  } catch (error) {
    console.log("Error During generate Access Token", error);
  }
};

// getNumberOfFollowers
const getNumberOfFollowers = async (req) => {
  const pipeline = [
    {
      $match: {
        user_whom_following: new mongoose.Types.ObjectId(req.user._id),
      },
    },

    {
      $group: {
        _id: null,
        follower_count: {
          $sum: 1,
        },
      },
    },
  ];

  return await Follow.aggregate(pipeline);
};

// getNumberOfFollowings
const getNumberOfFollowings = async (req) => {
  const pipeline = [
    {
      $match: {
        user_who_following: new mongoose.Types.ObjectId(req.user._id),
      },
    },

    {
      $group: {
        _id: null,
        following_count: {
          $sum: 1,
        },
      },
    },
  ];

  return await Follow.aggregate(pipeline);
};

//getOrderByDate
const getOrderByDate = async (order) => {
  try {
    const pipeline = [
      {
        $sort: {
          createdAt: order,
        },
      },
    ];

    const sorted = await AllCategory.aggregate(pipeline);
    return sorted;
  } catch (error) {
    console.log(error);
    return;
  }
};

// Upcomming Requests
const getUpcomingRequest = async () => {
  try {
    const pipeline = [
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 5,
      },
    ];

    return await AllCategory.aggregate(pipeline);
  } catch (error) {
    console.log(error);
    return;
  }
};

// getHistory

const getHistory = async()=>{
  try {

    return await Donate.find()

  } catch (error) {
    return console.log("Something went wrong" , error)
    
  }
}


// getRequestById
const getRequestById = async (requestId) => {
  try {
    const find_request = await AllCategory.findOne({ requestId: requestId });
    if (!find_request) {
      return console.log("request find failed");
    }

    const category_number = find_request.category_number;
    if (!category_number) {
      return console.log("category number not found");
    }

    switch (category_number) {
      case 1: {
        const request_detailis = await RideShare.findById(requestId);
        return request_detailis;
      }
      case 2: {
        const request_detailis = await PackageTransport.findById(requestId);
        return request_detailis;
      }

      case 3: {
        const request_detailis = await MealTrain.findById(requestId);
        return request_detailis;
      }
      case 4: {
        const request_detailis = await MinyanAssembly.findById(requestId);
        return request_detailis;
      }
      case 5: {
        const request_detailis = await Chizuk.findById(requestId);
        return request_detailis;
      }
      case 6: {
        const request_detailis = await FreeGiveaway.findById(requestId);
        return request_detailis;
      }
      case 7: {
        const request_detailis = await Advice.findById(requestId);
        return request_detailis;
      }
      case 8: {
        const request_detailis = await WeddingAttendees.findById(requestId);
        return request_detailis;
      }
      case 9: {
        const request_detailis = await GemachFinder.findById(requestId);
        return request_detailis;
      }
      case 10: {
        const request_detailis = await MovingItems.findById(requestId);
        return request_detailis;
      }
      case 11: {
        const request_detailis = await LostAndFound.findById(requestId);
        return request_detailis;
      }
      case 12: {
        const request_detailis = await HouseHold.findById(requestId);
        return request_detailis;
      }
      case 13: {
        const request_detailis = await StudyPartner.findById(requestId);
        return request_detailis;
      }
      default: {
        return console.log("Any Category not found");
      }
    }
  } catch (error) {
    return console.log("Error during find a particular request", error);
  }
};

// deleteRequestById
const cancelRequestById = async (requestId) => {
  try {
    const find_request = await AllCategory.findOne({ requestId: requestId });
    if (!find_request) {
      return console.log("request find failed");
    }

    const category_number = find_request.category_number;
    if (!category_number) {
      return console.log("category number not found");
    }

    switch (category_number) {
      case 1: {
        const request_detailis = await RideShare.findByIdAndDelete(requestId);
        return request_detailis;
      }
      case 2: {
        const request_detailis = await PackageTransport.findByIdAndDelete(
          requestId
        );
        return request_detailis;
      }

      case 3: {
        const request_detailis = await MealTrain.findByIdAndDelete(requestId);
        return request_detailis;
      }
      case 4: {
        const request_detailis = await MinyanAssembly.findByIdAndDelete(
          requestId
        );
        return request_detailis;
      }
      case 5: {
        const request_detailis = await Chizuk.findByIdAndDelete(requestId);
        return request_detailis;
      }
      case 6: {
        const request_detailis = await FreeGiveaway.findByIdAndDelete(
          requestId
        );
        return request_detailis;
      }
      case 7: {
        const request_detailis = await Advice.findByIdAndDelete(requestId);
        return request_detailis;
      }
      case 8: {
        const request_detailis = await WeddingAttendees.findByIdAndDelete(
          requestId
        );
        return request_detailis;
      }
      case 9: {
        const request_detailis = await GemachFinder.findByIdAndDelete(
          requestId
        );
        return request_detailis;
      }
      case 10: {
        const request_detailis = await MovingItems.findByIdAndDelete(requestId);
        return request_detailis;
      }
      case 11: {
        const request_detailis = await LostAndFound.findByIdAndDelete(
          requestId
        );
        return request_detailis;
      }
      case 12: {
        const request_detailis = await HouseHold.findByIdAndDelete(requestId);
        return request_detailis;
      }
      case 13: {
        const request_detailis = await StudyPartner.findByIdAndDelete(
          requestId
        );
        return request_detailis;
      }
      default: {
        return console.log("Any Category not found");
      }
    }
  } catch (error) {
    return console.log("Error during find a particular request", error);
  }
};

const searchCollectionName = (category_name) => {
  switch (category_name) {
    case "Ride Share": {
      return RideShare;
    }

    case "Study partner": {
      return StudyPartner;
    }

    case "Free items giveaway": {
      return FreeGiveaway;
    }
    case "Package Transport": {
      return PackageTransport;
    }

    case "Minyan Assembly": {
      return MinyanAssembly;
    }

    case "Chizuk / Support system": {
      return Chizuk;
    }
    case "Advice/Information": {
      return Advice;
    }

    case "Wedding attendees": {
      return WeddingAttendees;
    }

    case "Household": {
      return HouseHold;
    }

    case "Lost & found": {
      return LostAndFound;
    }

    case "Meal Train": {
      return MealTrain;
    }

    case "Gemach Finder": {
      return GemachFinder;
    }

    case "Moving items": {
      return MovingItems;
    }

    default: {
      return null;
    }
  }
};

export {
  generateAccessToken,
  getRequestById,
  cancelRequestById,
  getNumberOfFollowers,
  getNumberOfFollowings,
  searchCollectionName,
  getOrderByDate,
  getUpcomingRequest,
  getHistory
};
