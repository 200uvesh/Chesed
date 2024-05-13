import { Router } from "express";
import { verifyAdmin } from "../middlewares/auth.admin.js";
const adminRoute = Router();

import {
  createAdmin,
  deleteAdmin,
  updateAdmin,
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
  FAQs
  
} from "../controllers/constroller.admin.js";

adminRoute.post("/v1/createAdmin", createAdmin);
adminRoute.get("/v1/LoginAdmin", LoginAdmin);
adminRoute.put("/v1/updateAdmin", verifyAdmin, updateAdmin);
adminRoute.post("/v1/blockUser/:id", verifyAdmin, blockUser);
adminRoute.post("/v1/unblockUser/:id", verifyAdmin, unblockUser);
adminRoute.delete("/v1/deleteAdmin", verifyAdmin, deleteAdmin);
adminRoute.get("/v1/totalnumberOfUsers", verifyAdmin, totalnumberOfUsers);
adminRoute.get("/v1/numberOfBlockedUser", verifyAdmin, numberOfBlockedUser);
adminRoute.get("/v1/totalNumberOfRequest", verifyAdmin, totalNumberOfRequest);
adminRoute.get(
  "/v1/numberOfAcceptedRequest",
  verifyAdmin,
  numberOfAcceptedRequest
);
adminRoute.get("/v1/numberOfUserDonates", verifyAdmin, numberOfUserDonates);
adminRoute.get("/v1/totalRevenue", verifyAdmin, totalRevenue);
adminRoute.get("/v1/newUser", verifyAdmin, newUser);

adminRoute.post("/v1/privacyPolicy" , verifyAdmin , privacyPolicy)
adminRoute.post("/v1/termAndCondition" , verifyAdmin , termAndCondition)
adminRoute.post("/v1/contactUs" , verifyAdmin ,contactUs)
adminRoute.post("/v1/aboutUs" , verifyAdmin , aboutUs)
adminRoute.post("/v1/FAQs" , verifyAdmin , FAQs)

export { adminRoute };

