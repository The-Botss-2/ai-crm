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
      user: 'duawegarments@gmail.com',
      pass: 'slhj xiue ypiq ozbc'
    }
  } as nodemailer.TransportOptions);

  const mailOptions = {
    from: 'duawegarments@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};