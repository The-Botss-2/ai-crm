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
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 465, // Ensure port is a number
    secure: true, // Boolean value
    auth: {
      user: process.env.SMPT_USER,
      pass: process.env.SMPT_PASSWORD
    }
  } as nodemailer.TransportOptions);

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return {info, data: process.env.SMTP_HOST, port: 465, secure: true, auth: { user: process.env.SMPT_USER, pass: process.env.SMPT_PASSWORD }}
  } catch (error) {
    return {error, data: process.env.SMTP_HOST, port: 465, secure: true, auth: { user: process.env.SMPT_USER, pass: process.env.SMPT_PASSWORD }}
  }
  
};