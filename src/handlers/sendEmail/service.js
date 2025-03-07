const nodemailer = require("nodemailer");

exports.sendEmail = async (donorDetails, receiptAttachment) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "support@empowerngo.com",
        pass: "EmpTech#25",
      },
    });

    const {
      donorFName,
      donorLName,
      donorEmail,
      ngoName,
      contactPerson,
      ngoContactNo,
    } = donorDetails;

    const pdfBuffer = Buffer.from(receiptAttachment.content, "base64");

    const mailOptions = {
      from: `"${ngoName}" <support@empowerngo.com>`,
      to: donorEmail,
      subject: `Acknowledgment of Your Generous Contribution & 80G Receipt - ${ngoName}`,
      text: `Dear ${donorFName} ${donorLName} ji,\n\nGreetings!\n\nI take this opportunity to express our sincere gratitude for your kind contribution. Your support not only helps us to sustain but also motivates us to continue working. I am sending a soft copy of the 80G receipt as an attachment with this email. Thank you for being such an AWESOME support.\n\nRegards,\n${contactPerson}\n${ngoName}\n${ngoContactNo}`,
      html: `
        <p>Dear ${donorFName} ${donorLName} ji,</p>
        <p>Greetings!</p>
        <p>I take this opportunity to express our sincere gratitude for your kind contribution. Your support not only helps us to sustain but also motivates us to continue working. I am sending a soft copy of the 80G receipt as an attachment with this email. Thank you for being such an AWESOME support.</p>
        <p>Regards,<br>${contactPerson}<br>${ngoName}<br>${ngoContactNo}</p>
      `,
      attachments: [
        {
          filename: receiptAttachment.filename,
          content: pdfBuffer,
          contentType: receiptAttachment.contentType,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return info;
  } catch (error) {
    console.error("Error sending email:", error.message || error);
    return false; 
  }
};