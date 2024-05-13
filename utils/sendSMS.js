import { configDotenv } from "dotenv";
configDotenv();
import Twilio from "twilio";

const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const sendSMS = async (phoneNumber, otp) => {
  try {
    await twilioClient.messages.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: `Your OTP for sign-up is: ${otp}`,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Error sending OTP");
  }
};

export { sendSMS };
