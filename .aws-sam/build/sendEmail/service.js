import nodemailer from "/opt/nodejs/node_modules/nodemailer";

const sendEmail = async (donorDetails, receiptAttachment) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
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

    const pdfFilename = receiptAttachment.filename;
    const pdfContentType = receiptAttachment.contentType;
    const pdfBase64Content = receiptAttachment.content;
    const pdfBuffer = Buffer.from(pdfBase64Content, "base64");

    const mailOptions = {
      from: `support@empowerngo.com`,
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
          filename: pdfFilename,
          content: pdfBuffer,
          contentType: pdfContentType,
          encoding: 'base64',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);

    // console.log("Email sent successfully:", info.messageId);    

    return info; // Email sent successfully
  } catch (error) {
    console.error("Error sending email:", error);
    return false; // Email sending failed due to an error
  }
};

export default sendEmail;