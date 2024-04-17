import User from "../../../models/User";
import connect from "@/utils/db";
import crypto from "crypto";
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

const URL = process.env.NEXTAUTH_URL;
const SENDGRID_MAIL = process.env.SENDGRID_MAIL || "";

export const POST = async (request: any) => {
  const { email } = await request.json();

  await connect();

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    return new NextResponse("Email does not exist", { status: 400 });
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  // Need separate tokems for what's in the URL and what's in mongoDb
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const passwordResetExpires = Date.now() + 3600000;

  existingUser.resetToken = passwordResetToken;
  existingUser.resetTokenExpiry = passwordResetExpires;

  const resetUrl = `${URL}/reset-password/${resetToken}`;

  console.log(resetUrl);

  const body = `Reset password by clicking on following URL: ${resetUrl}`;

  const msg = {
    to: email,
    from: SENDGRID_MAIL,
    subject: "Reset Password",
    text: body,
  };

  sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
  sgMail
    .send(msg)
    .then(() => {
      return new NextResponse("Reset password email is sent.", { status: 200 });
    })
    .catch(async (error) => {
      existingUser.resetToken = undefined;
      existingUser.resetTokenExpiry = undefined;
      await existingUser.save();

      return new NextResponse("Failed sending email. Try again", {
        status: 400,
      });
    });

  try {
    await existingUser.save();
    return new NextResponse("Email is sent for resetting password", {
      status: 200,
    });
  } catch (error: any) {
    return new NextResponse(error, {
      status: 500,
    });
  }
};
