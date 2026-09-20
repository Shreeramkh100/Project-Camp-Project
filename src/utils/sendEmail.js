import Mailgen from "mailgen"; //Generate Email
import nodemailer from "nodemailer"; //Send Email
import { fromEmailId } from "./constants";

const sendEmail = async (options) => {

    const emailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Project Camp',
            link: "https://projectcamp.com"
        }
    });

    const emailHTML = emailGenerator.generate(options.mailgenContent);

    const emailText = emailGenerator.generatePlaintext(options.mailgenContent);

    const emailInfo = {
        from: fromEmailId,
        to: options.toEmailId,
        subject: options.subject,
        text: emailText,
        html: emailHTML
    }

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        auth: {
            user: process.env.MAILTRAP_USERNAME,
            pass: process.env.MAILTRAP_PASSWORD
        }
    })

    try {
        await transporter.sendMail(emailInfo);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error while sending email:", err);
    }

}

//Generate Email
const emailVerificationContent = (userName, verificationURL) => {
    const content = {
        body: {
            name: userName,
            intro: "Welcome to our App! we are excited to have you on board",
            action: {
                instruction: 'To verify your email please click on the following button',
                button: {
                    color: "#22BC66",
                    text: "Verify your Email",
                    link: verificationURL
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we would love to help"
        }
    }
    return content;
}

const passwordResetContent = (userName, resetURL) => {
    const content = {
        body: {
            name: userName,
            intro: "We got a request to reset the password of your account",
            action: {
                instruction: 'To reset your password click on the following button',
                button: {
                    color: "#D29A28",
                    text: "Reset your Password",
                    link: resetURL
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we would love to help"
        }
    }
    return content;
}

export { sendEmail, passwordResetContent, emailVerificationContent };



