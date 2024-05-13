import { Router } from "express";
const userRoute = Router();
import { verifyJWT } from "../middlewares/auth.user.js";

import {
  SignUp,
  verifyEmailOTP,
  verifyPhoneOTP,
  LoginUser,
  ForgotPassword,
  ResetPassword,
  UpdatePassword,
  EditProfile,
  ViewUserProfile,
  acceptRequest,
  viewRequest,
  showAllRequest,
  createRideShare,
  createPackageTransport,
  createMealTrain,
  createMinyanAssembly,
  createChizuk,
  createFreeGiveaway,
  createAdvice,
  createWeedingAttendees,
  createGemachFinder,
  createMovingItems,
  createHousehold,
  createLostAndFound,
  createStudyPartners,
  searchRequestByCategoryName,
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
  showAboutUs,
  showContactUs,
  showPrivacyPolicy,
  showTermAndCondition,
  showFAQ
} from "../controllers/controller.user.js";

import { createMulterMiddleware } from "../middlewares/multer.js";
const uploads = createMulterMiddleware([
  { name: "profileImage", name: "Document" },
]);

// User Routes
userRoute.post("/v1/SignUp", SignUp);
userRoute.post("/v1/verifyEmailOTP", verifyJWT, verifyEmailOTP);
userRoute.post("/v1/verifyPhoneOTP", verifyJWT, verifyPhoneOTP);
userRoute.post("/v1/LoginUser", LoginUser);
userRoute.post("/v1/ForgotPassword", ForgotPassword);
userRoute.post("/v1/ResetPassword", verifyJWT, ResetPassword);
userRoute.put("/v1/UpdatePassword", verifyJWT, UpdatePassword);
userRoute.put("/v1/EditProfile", verifyJWT, uploads, EditProfile);
userRoute.get("/v1/ViewUserProfile/:id", verifyJWT, ViewUserProfile);
userRoute.get("/v1/ViewMyProfile", verifyJWT, ViewMyProfile);
userRoute.post("/v1/googleLogin", googleLogin);
userRoute.get("/v1/verifyGoogle", verifyGoogle);
userRoute.post("/v1/addDocument", verifyJWT, uploads, addDocument);
userRoute.post("/v1/addAddress" , verifyJWT , addAddress)
userRoute.get("/v1/ChesedHistory" , verifyJWT , ChesedHistory)

// Create request
userRoute.post("/v1/createRideShare", verifyJWT, createRideShare);
userRoute.post("/v1/createPackageTransport", verifyJWT, createPackageTransport);
userRoute.post("/v1/createMealTrain", verifyJWT, createMealTrain);
userRoute.post("/v1/createMinyanAssembly", verifyJWT, createMinyanAssembly);
userRoute.post("/v1/createChizuk", verifyJWT, createChizuk);
userRoute.post("/v1/createFreeGiveaway", verifyJWT, createFreeGiveaway);
userRoute.post("/v1/createAdvice", verifyJWT, createAdvice);
userRoute.post("/v1/createWeedingAttendees", verifyJWT, createWeedingAttendees);
userRoute.post("/v1/createGemachFinder", verifyJWT, createGemachFinder);
userRoute.post("/v1/createMovingItems", verifyJWT, createMovingItems);
userRoute.post("/v1/createHousehold", verifyJWT, createHousehold);
userRoute.post("/v1/createLostAndFound", verifyJWT, createLostAndFound);
userRoute.post("/v1/createStudyPartners", verifyJWT, createStudyPartners);
userRoute.post("/v1/follow/:id", verifyJWT, follow);
userRoute.delete("/v1/unFollow/:id", verifyJWT, unFollow);
userRoute.get("/v1/numberOfFollowers", verifyJWT, numberOfFollowers);
userRoute.get("/v1/numberOfFollowings", verifyJWT, numberOfFollowings);
userRoute.get("/v1/logout", verifyJWT, logout);
userRoute.delete("/v1/deleteAccount", verifyJWT, deleteAccount);

// Requests
userRoute.post("/v1/acceptRequest/:id", verifyJWT, acceptRequest);
userRoute.get("/v1/viewRequest/:id", verifyJWT, viewRequest);
userRoute.get(
  "/v1/searchRequestByCategoryName",
  verifyJWT,
  searchRequestByCategoryName
);

userRoute.get("/v1/showAllRequest", verifyJWT, showAllRequest);
userRoute.get("/v1/requestCreatedByMe", verifyJWT, requestCreatedByMe);
userRoute.get("/v1/closeRequest/:id", verifyJWT, closeRequest);
userRoute.delete("/v1/cancelRequest/:id", verifyJWT, cancelRequest);
userRoute.post("/v1/Creatcompliment/:id", verifyJWT, Creatcompliment);
userRoute.delete("/v1/deleteCompliment/:id", verifyJWT, deleteCompliment);
userRoute.post("/v1/markAsDone/:id", verifyJWT, markAsDone);
userRoute.put("/v1/editRequest/:id", verifyJWT, editRequest);
userRoute.post("/v1/donateUs", verifyJWT, donateUs);
userRoute.get("/v1/sortByDate", verifyJWT, sortByDate);
userRoute.get("/v1/upcomingRequest", verifyJWT, upcomingRequest);
userRoute.post("/v1/RideShareRequest/:id", verifyJWT, RideShareRequest);

// User Dashbord
userRoute.get("/v1/requestCreatedByMe", verifyJWT, requestCreatedByMe);
userRoute.get("/v1/acceptedRequestByMe", verifyJWT, acceptedRequestByMe);

// Notification
userRoute.get("/v1/setEmailNotification" , verifyJWT , setEmailNotification)
userRoute.get("/v1/setPushNotification" , verifyJWT , setPushNotification)
userRoute.get("/v1/setSMSNotification" , verifyJWT , setSMSNotification)

userRoute.get("/v1/showPrivacyPolicy" , verifyJWT , showPrivacyPolicy)
userRoute.get("/v1/showTermAndCondition" , verifyJWT , showTermAndCondition)
userRoute.get("/v1/showContactUs" , verifyJWT , showContactUs)
userRoute.get("/v1/showAboutUs" , verifyJWT , showAboutUs)
userRoute.get("/v1/showFAQ" , verifyJWT , showFAQ)

// Testing
userRoute.post("/v1/createRequest", verifyJWT, createRequest);
userRoute.get("/v1/getRandomImage" , getRandomImage)
userRoute.get("/v1/fetchWordDefinitions" , fetchWordDefinitions)


export { userRoute };
