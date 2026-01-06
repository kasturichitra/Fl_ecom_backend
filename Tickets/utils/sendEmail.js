import { transporter } from "../../Config/email.config.js";

/**
 * Send email notification to admin
 * @param {Object} emailData - Email data
 * @param {string} emailData.to - Recipient email
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.html - Email HTML content
 * @param {Array} emailData.attachments - Optional attachments
 */
export const sendEmailNotification = async (emailData) => {
    try {
        const { to, subject, html, attachments = [] } = emailData;

        const mailOptions = {
            from: process.env.SMTP_USER || "noreply@yourapp.com",
            to,
            subject,
            html,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

/**
 * Generate ticket creation email HTML template
 * @param {Object} ticketData - Ticket information
 */
export const generateTicketEmailTemplate = (ticketData) => {
    const { ticket_id, message, user_email, faq_question_id, relevant_images = [] } = ticketData;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .info-row { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { margin-top: 20px; padding: 10px; text-align: center; font-size: 12px; color: #777; }
        .image-preview { max-width: 100px; margin: 5px; border: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🎫 New Support Ticket Created</h2>
        </div>
        <div class="content">
          <div class="info-row">
            <span class="label">Ticket ID:</span>
            <span class="value">${ticket_id}</span>
          </div>
          <div class="info-row">
            <span class="label">User Email:</span>
            <span class="value">${user_email}</span>
          </div>
          <div class="info-row">
            <span class="label">FAQ Question ID:</span>
            <span class="value">${faq_question_id}</span>
          </div>
          <div class="info-row">
            <span class="label">Message:</span>
            <div class="value">${message}</div>
          </div>
          ${relevant_images.length > 0 ? `
          <div class="info-row">
            <span class="label">Relevant Images:</span>
            <div style="margin-top: 10px;">
              ${relevant_images.map(img => `
                <a href="${img.original}" target="_blank">
                  <img src="${img.medium}" class="image-preview" alt="Ticket Screenshot" style="max-width: 250px; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px; margin-bottom: 10px;" />
                </a>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
