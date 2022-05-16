const nodemailer = require("nodemailer")
const nodemailerConfig = require("./nodemailerConfig")

const sendEmail = async ({ to, subject, html }) => {
  let testAccount = await nodemailer.createTestAccount()

  const transporter = nodemailer.createTransport(nodemailerConfig)

  return transporter.sendMail({
    from: '"Nikolay Srebrev" <nikolaysrebrev@example.com>', // sender address
    to,
    subject,
    html,
  })

  // res.json(info)
}

module.exports = sendEmail
