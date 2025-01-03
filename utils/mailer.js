const transporter = require('../configs/nodemailer');

module.exports = async (to, subject, text, html) => {
    await transporter.sendMail({
        from: `${process.env.APP_NAME} support <${process.env.EMAIL_USER}`,
        to,
        subject,
        text,
        html,
    });
};
