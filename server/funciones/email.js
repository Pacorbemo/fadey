const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});

function enviarEmail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: 'Fadey',
    to,
    subject,
    text,
    html
  });
}

module.exports = enviarEmail;