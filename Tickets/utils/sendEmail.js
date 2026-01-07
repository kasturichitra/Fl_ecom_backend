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
  const { ticket_id, message: ticketMessage, user_email, faq_question_id, relevant_images = [] } = ticketData;

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
            <span class="label">Message:</span>
            <div class="value">${ticketMessage}</div>
          </div>
          ${
            relevant_images.length > 0
              ? `
          <div class="info-row">
            <span class="label">Relevant Images:</span>
            <div style="margin-top: 10px;">
              ${relevant_images
                .map(
                  (img) => `
                <a href="${img.original}" target="_blank">
                  <img src="${img.medium}" class="image-preview" alt="Ticket Screenshot" style="max-width: 250px; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px; margin-bottom: 10px;" />
                </a>
              `
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }
        </div>
        <div class="footer">
          <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateTicketAssignedToEmployeeEmail = (ticketData) => {
  const { ticket_id, message: ticketMessage, user_email, assigned_to, assigned_at, relevant_images = [] } = ticketData;

  const assigned_employee_name = assigned_to.username;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Ticket Assigned</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    }
    .header {
      background-color: #2563eb;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 24px;
    }
    .info-row {
      margin-bottom: 12px;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .value {
      color: #111;
    }
    .ticket-message {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      padding: 14px;
      border-radius: 6px;
      margin-top: 6px;
    }
    .cta {
      text-align: center;
      margin-top: 30px;
    }
    .cta a {
      background: #2563eb;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: bold;
      display: inline-block;
    }
    .image-preview {
      max-width: 220px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 8px 8px 0 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777;
      padding: 16px;
      background: #f9fafb;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h2>🎯 Ticket Assigned to You</h2>
    </div>

    <div class="content">
      <p>Hi <strong>${assigned_employee_name}</strong>,</p>

      <p>
        A support ticket has been assigned to you. Please take ownership and
        assist the user at the earliest.
      </p>

      <div class="info-row">
        <span class="label">Ticket ID:</span>
        <span class="value">${ticket_id}</span>
      </div>

      <div class="info-row">
        <span class="label">User Email:</span>
        <span class="value">${user_email}</span>
      </div>

      <div class="info-row">
        <span class="label">Assigned At:</span>
        <span class="value">${assigned_at}</span>
      </div>

      <div class="info-row">
        <span class="label">Issue Details:</span>
        <div class="ticket-message">${ticketMessage}</div>
      </div>

      ${
        relevant_images.length
          ? `
        <div class="info-row">
          <span class="label">Attached Images:</span><br />
          ${relevant_images
            .map(
              (img) => `
              <a href="${img.original}" target="_blank">
                <img src="${img.medium}" class="image-preview" alt="Ticket Image" />
              </a>
            `
            )
            .join("")}
        </div>
      `
          : ""
      }

    </div>

    <div class="footer">
      This is an automated notification. Please do not reply.
    </div>
  </div>
</body>
</html>
`;
};

export const generateTicketAssignedToUserEmail = (ticketData) => {
  const { ticket_id, assigned_to, ticket_url = `${process.env.FRONTEND_URL}/tickets/${ticket_id}` } = ticketData;

  console.log("Ticket Data in generate email fdor user function", ticketData);

  const assigned_employee_name = assigned_to.username;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Ticket Assigned</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    }
    .header {
      background-color: #16a34a;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 24px;
    }
    .cta {
      text-align: center;
      margin-top: 30px;
    }
    .cta a {
      background: #16a34a;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: bold;
      display: inline-block;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777;
      padding: 16px;
      background: #f9fafb;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h2>✅ Your Ticket Is Assigned</h2>
    </div>

    <div class="content">
      <p>Hello,</p>

      <p>
        Your support ticket <strong>#${ticket_id}</strong> has been assigned to
        <strong>${assigned_employee_name}</strong>.
      </p>

      <p>
        Our team member is actively working on your request and will update you
        shortly.
      </p>

      <div class="cta">
        <a href="${ticket_url}" target="_blank">View Ticket</a>
      </div>
    </div>

    <div class="footer">
      Thank you for contacting support.
    </div>
  </div>
</body>
</html>
`;
};

export const generateTicketResolvedForUserEmail = (ticketData) => {
  const {
    ticket_id,
    resolved_at,
    resolved_by,
    company_name = "Support Team",
  } = ticketData;

  const resolved_by_name = resolved_by.username;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Ticket Resolved</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    }
    .header {
      background-color: #10b981;
      color: #ffffff;
      padding: 22px;
      text-align: center;
    }
    .content {
      padding: 24px;
    }
    .info-row {
      margin-bottom: 14px;
      font-size: 14px;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .resolution-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 16px;
      border-radius: 6px;
      margin-top: 10px;
      color: #065f46;
    }
    .cta {
      text-align: center;
      margin-top: 30px;
    }
    .cta a {
      background: #10b981;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 26px;
      border-radius: 6px;
      font-weight: bold;
      display: inline-block;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777;
      padding: 16px;
      background: #f9fafb;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h2>🎉 Your Ticket Has Been Resolved</h2>
    </div>

    <div class="content">
      <p>Hello,</p>

      <p>
        We’re happy to inform you that your support ticket
        <strong>#${ticket_id}</strong> has been successfully resolved.
      </p>

      <div class="info-row">
        <span class="label">Resolved By:</span>
        <span>${resolved_by_name}</span>
      </div>

      <div class="info-row">
        <span class="label">Resolved At:</span>
        <span>${resolved_at}</span>
      </div>

      <p style="margin-top: 20px;">
        If you feel the issue is not fully resolved or need further assistance,
        you can reopen the ticket or create a new one.
      </p>
    </div>

    <div class="footer">
      Thank you for choosing ${company_name}.<br />
      This is an automated message — please do not reply.
    </div>
  </div>
</body>
</html>
`;
};
