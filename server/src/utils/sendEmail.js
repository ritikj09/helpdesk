import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config()

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service:'gmail',
        host: "smtp.gmail.com", 
        port: 465, 
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, 
        },
        connectionTimeout:10000
    });

    const mailOptions = {
        from: "Rahul Nigam <magin1411rn@gmail.com>",
        to: options.to, 
        subject: options.subject,
        html: options.message,
    };
    try {
        await transporter.sendMail(mailOptions); 
        console.log("Email sent successfully.");
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email sending failed.");
    }
};

export default sendEmail;
