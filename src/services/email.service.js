require('dotenv').config();
const nodemailer = require('nodemailer');

// Build transporter based on available credentials
function createTransporter() {
  const hasAppPassword = process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD;
  const hasOAuth2 =
    process.env.EMAIL_USER &&
    process.env.CLIENT_ID &&
    process.env.CLIENT_SECRET &&
    process.env.REFRESH_TOKEN;

  if (hasAppPassword) {
    // Gmail with App Password (simplest - enable 2FA, create App Password in Google Account)
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }
  if (hasOAuth2) {
    // Gmail OAuth2
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });
  }
  // Fallback: Ethereal test account for development
  return null;
}

let transporter = createTransporter();
let etherealUser = null;

async function getTransporter() {
  if (transporter) {
    return transporter;
  }
  const testAccount = await nodemailer.createTestAccount();
  etherealUser = testAccount.user;
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log(
    'Email: Using Ethereal (dev mode). Add EMAIL_USER + EMAIL_APP_PASSWORD to .env for real emails.'
  );
  return transporter;
}

// Verify connection on startup
(async () => {
  const trans = await getTransporter();
  trans.verify((error, success) => {
    if (error) {
      console.error('Error connecting to email server:', error.message);
    } else {
      console.log('Email server is ready to send messages');
    }
  });
})();

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const trans = await getTransporter();
    const fromEmail = process.env.EMAIL_USER || etherealUser || 'noreply@backend-ledger.local';
    const info = await trans.sendMail({
      from: `"Backend-ledger" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('Preview URL: %s', previewUrl);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

async function sendRegistrationEmail(userEmail, name){
    const subject = 'Welcome to Backend-ledger!';
    const text = `Hi ${name}, welcome to Backend-ledger! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team. Have a great day!`;
    const html = `<h1>Hi ${name}, welcome to Backend-ledger!</h1> <p>We're excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team. Have a great day!</p>`;

    await sendEmail(userEmail, subject, text, html);
}


async function sendTransactionEmail(userEmail, name, amount, toAccount){
    const subject = 'Transaction Successful!';
    const text = `Hi ${name}, your transaction of $${amount} to account ${toAccount} was successful! Have a great day!`;
    const html = `<h1>Hi ${name}, your transaction of $${amount} to account ${toAccount} was successful!</h1> <p>If you have any questions or need assistance, feel free to reach out to our support team. Have a great day!</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount){
    const subject = 'Transaction Failed!';
    const text = `Hi ${name}, your transaction of $${amount} to account ${toAccount} has failed. If you have any questions or need assistance, feel free to reach out to our support team. Have a great day!`;
    const html = `<h1>Hi ${name}, your transaction of $${amount} to account ${toAccount} has failed.</h1> <p>We regret to inform you that your transaction could not be completed. If you have any questions or need assistance, feel free to reach out to our support team. Have a great day!</p>`;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
};