const { createTransport } = require("nodemailer");

let transport = null;

const getTransport = () => {
  const user = String(process.env.MAIL_USER || "").trim();
  const pass = String(process.env.MAIL_PASS || "").trim();

  if (!user || !pass) {
    throw new Error("SMTP email is not configured");
  }

  if (!transport) {
    transport = createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user,
        pass,
      },
    });
  }

  return transport;
};

const sendMail = async (to, subject, html) => {
  try {
    const info = await getTransport().sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendMail,
};
