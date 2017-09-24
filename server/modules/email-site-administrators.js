var nodemailer = require('nodemailer');

module.exports = function (messageToSend) {
    try {
        var transport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.NODEMAILER_SENDING_ACCOUNT_EMAIL,
                pass: process.env.NODEMAILER_SENDING_ACCOUNT_PASSWORD
            }
        });
        var mailOptions = {
            from: process.env.NODEMAILER_SENDING_ACCOUNT_EMAIL,
            to: process.env.NODEMAILER_RECEIVING_ACCOUNT_EMAIL,
            subject: process.env.NODEMAILER_EMAIL_SUBJECT,
            text: messageToSend
        }
        transport.sendMail(mailOptions);
    } catch (error) {
        console.log('Sending email to administrators failed due to: ', error);
    } finally {
        return;
    }
}