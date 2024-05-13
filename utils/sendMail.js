import { configDotenv } from "dotenv";
configDotenv();
import nodemailer from "nodemailer";

const sendEMail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.emailUser,
        pass: process.env.passwordUser,
      },
    });
    const mailContent = {
      from: process.env.emailUser,
      to: email,
      subject: "OTP for verify User Email ",
      text: "Hello Welcome to the  world of Node.js API's  !! ",
      html: "<p> Hii   , Your OTP is : " + otp + "  for verifying the Emial",
    };

    transporter.sendMail(mailContent, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        // console.log("Mail has been sucessfully Send :- ")
      }
    });
  } catch (error) {
    console.log("Mail Not send");
    throw new Error("Mail Not send");
  }
};

export { sendEMail };
