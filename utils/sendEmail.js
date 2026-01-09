
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

export const sendCouponEmail = async (userEmail, couponData) => {
  try {
    const mailOptions = {
      from: `"Support System" <${smtpUser}>`,
      to: userEmail,
      subject: `Exclusive Coupon For You! 🎁 - ${couponData.coupon_code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Congratulations!</h2>
          <p>You have received a new exclusive coupon.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 18px; margin-bottom: 10px;"><strong>Coupon Code:</strong> <span style="background-color: #e8f5e9; padding: 5px 10px; border-radius: 4px; color: #2e7d32;">${couponData.coupon_code}</span></p>
            <p><strong>Discount:</strong> ${couponData.discount_percentage ? couponData.discount_percentage + '%' : '₹' + couponData.discount_amount}</p>
            <p><strong>Valid Until:</strong> ${new Date(couponData.coupon_end_date).toLocaleDateString()}</p>
            
            ${(function () {
          let applicableItems = [];
          let title = "";

          if (couponData.apply_on === "Product" && couponData.selected_products && couponData.selected_products.length > 0) {
            title = "Applicable Products:";
            applicableItems = couponData.selected_products.map(item => item.label);
          } else if (couponData.apply_on === "Category" && couponData.selected_categories && couponData.selected_categories.length > 0) {
            title = "Applicable Categories:";
            applicableItems = couponData.selected_categories.map(item => item.label);
          } else if (couponData.apply_on === "Brand" && couponData.selected_brands && couponData.selected_brands.length > 0) {
            title = "Applicable Brands:";
            applicableItems = couponData.selected_brands.map(item => item.label);
          }

          if (applicableItems.length > 0) {
            return `
                  <div style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">
                    <p><strong>${title}</strong></p>
                    <ul style="padding-left: 20px; color: #555;">
                      ${applicableItems.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                  </div>
                `;
          }
          return "";
        })()}
          </div>

          <p>Use this code at checkout to avail your discount.</p>
          <hr/>
          <p style="font-size: 12px; color: #888;">Terms and conditions apply.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Coupon email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending coupon email to ${userEmail}:`, error);
  }
};

export const sendBusinessApprovalEmailToAdmin = async (adminEmail, businessData) => {
  try {
    const mailOptions = {
      from: `"Business Approval System" <${smtpUser}>`,
      to: adminEmail,
      subject: `New Business Approval Request - ${businessData.business_name}`,
      html: `
        <h3>New Business Registration Alert 🏢</h3>
        <p><b>Business Name:</b> ${businessData.business_name}</p>
        <p><b>GSTIN:</b> ${businessData.gstinNumber}</p>
        <p><b>Address:</b> ${businessData.business_address}</p>
        <p><b>Requested By User ID:</b> ${businessData.user_id}</p>
        <hr/>
        <p>Please login to the Admin Dashboard to review and approve this business.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Admin business approval email sent successfully!");
  } catch (error) {
    console.error("Error sending admin business approval email:", error);
  }
};
