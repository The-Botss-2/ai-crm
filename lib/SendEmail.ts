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
    port: 587, // Ensure port is a number
    secure: false, // Boolean value
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

  await transporter.sendMail(mailOptions);
};