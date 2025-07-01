import { trusted } from "mongoose";
import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  html: string;
  text: string
}

export const SendEmail = async (options: EmailOptions) => {
  // Explicitly type the transport options


  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: process?.env.NODE_ENV === 'production' ?  465 : 587, // Ensure port is a number
    secure: process?.env.NODE_ENV === 'production' ? true : false, // Boolean value
    auth: {
      user: 'info@kennarddixon.com',
      pass: 'Taptaptech$2'
    },
      // Add connection timeout (optional)
      connectionTimeout: 10_000,
  });

  const mailOptions = {
    from: 'info@kennarddixon.com',
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
//  /
};