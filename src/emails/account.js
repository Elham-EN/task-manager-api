const sgMail = require("@sendgrid/mail");

//We have to let sendgrid module know we want to work
//with this API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = async (email, name) => {
  const emailObj = {
    to: email, //the user who just created the account
    from: "ilhamrezaie35@hotmail.com",
    subject: "Thanks for joining our Task App API",
    text: `Welcome to the app ${name}`,
  };
  try {
    await sgMail.send(emailObj);
    console.log("Email sent");
  } catch (error) {
    throw new Error(error.message);
  }
};

const sendCancelationEmail = async (email, name) => {
  const emailObj = {
    to: email, //the user who just created the account
    from: "ilhamrezaie35@hotmail.com",
    subject: "Account Cancelation",
    text: `Thank you for using our Task API Application,
    hope to see you next time ${name}`,
  };
  try {
    await sgMail.send(emailObj);
    console.log("Email sent");
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { sendWelcomeEmail, sendCancelationEmail };
