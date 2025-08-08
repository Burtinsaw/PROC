const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'demo@example.com',
    pass: process.env.SMTP_PASS || 'password'
  }
});

async function sendMail(to, subject, text) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to,
    subject,
    text
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
