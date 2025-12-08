
import { transporter } from "../Config/email.config.js";
import { smtpUser } from "../env.js";

export const sendEmailToAdmin = async (adminEmail, ticketInfo) => {
  try {
    const mailOptions = {
      from: `"Support System" <${smtpUser}>`, 
      to: adminEmail,
      subject: `New Ticket Raised - ${ticketInfo.ticket_number}`,
      html: `
        <h3>New Ticket Alert 🚨</h3>
        <p><b>Ticket Number:</b> ${ticketInfo.ticket_number}</p>
        <p><b>Title:</b> ${ticketInfo.title}</p>
        <p><b>Description:</b> ${ticketInfo.description}</p>
        <p><b>Raised By User ID:</b> ${ticketInfo.user_id}</p>
        <hr/>
        <p>Please login to the Admin Dashboard to take action.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Admin email sent successfully!");
  } catch (error) {
    console.error("Error sending admin email:", error);
  }
};
    