import { transporter } from "../Config/email.config.js";
import { smtpUser } from "../env.js";

// export const sendEmail = async (to, subject, htmlContent) => {
//   try {
//     const mailOptions = {
//       from: `"Support System" <${smtpUser}>`,
//       to,
//       subject,
//       html: htmlContent,
//     };
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent successfully to ${to}`);
//   } catch (error) {
//     console.error(`Error sending email to ${to}:`, error);
//   }
// };

// export const sendCouponEmail = async (userEmail, couponData) => {
//   try {
//     const mailOptions = {
//       from: `"Support System" <${smtpUser}>`,
//       to: userEmail,
//       subject: `Exclusive Coupon For You! 🎁 - ${couponData.coupon_code}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #4CAF50;">Congratulations!</h2>
//           <p>You have received a new exclusive coupon.</p>

//           <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
//             <p style="font-size: 18px; margin-bottom: 10px;"><strong>Coupon Code:</strong> <span style="background-color: #e8f5e9; padding: 5px 10px; border-radius: 4px; color: #2e7d32;">${
//               couponData.coupon_code
//             }</span></p>
//             <p><strong>Discount:</strong> ${
//               couponData.discount_percentage ? couponData.discount_percentage + "%" : "₹" + couponData.discount_amount
//             }</p>
//             <p><strong>Valid Until:</strong> ${new Date(couponData.coupon_end_date).toLocaleDateString()}</p>

//             ${(function () {
//               let applicableItems = [];
//               let title = "";

//               if (
//                 couponData.apply_on === "Product" &&
//                 couponData.selected_products &&
//                 couponData.selected_products.length > 0
//               ) {
//                 title = "Applicable Products:";
//                 applicableItems = couponData.selected_products.map((item) => item.label);
//               } else if (
//                 couponData.apply_on === "Category" &&
//                 couponData.selected_categories &&
//                 couponData.selected_categories.length > 0
//               ) {
//                 title = "Applicable Categories:";
//                 applicableItems = couponData.selected_categories.map((item) => item.label);
//               } else if (
//                 couponData.apply_on === "Brand" &&
//                 couponData.selected_brands &&
//                 couponData.selected_brands.length > 0
//               ) {
//                 title = "Applicable Brands:";
//                 applicableItems = couponData.selected_brands.map((item) => item.label);
//               }

//               if (applicableItems.length > 0) {
//                 return `
//                   <div style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">
//                     <p><strong>${title}</strong></p>
//                     <ul style="padding-left: 20px; color: #555;">
//                       ${applicableItems.map((item) => `<li>${item}</li>`).join("")}
//                     </ul>
//                   </div>
//                 `;
//               }
//               return "";
//             })()}
//           </div>

//           <p>Use this code at checkout to avail your discount.</p>
//           <hr/>
//           <p style="font-size: 12px; color: #888;">Terms and conditions apply.</p>
//         </div>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`Coupon email sent successfully to ${userEmail}`);
//   } catch (error) {
//     console.error(`Error sending coupon email to ${userEmail}:`, error);
//   }
// };

export const generateCouponEmailTemplate = (couponData) => {
  const {
    coupon_code,
    discount_percentage,
    discount_amount,
    coupon_end_date,
    apply_on,
    selected_products = [],
    selected_categories = [],
    selected_brands = [],
  } = couponData;

  let title = "";
  let applicableItems = [];

  if (apply_on === "Product" && selected_products.length) {
    title = "Applicable Products:";
    applicableItems = selected_products.map((item) => item.label);
  } else if (apply_on === "Category" && selected_categories.length) {
    title = "Applicable Categories:";
    applicableItems = selected_categories.map((item) => item.label);
  } else if (apply_on === "Brand" && selected_brands.length) {
    title = "Applicable Brands:";
    applicableItems = selected_brands.map((item) => item.label);
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Exclusive Coupon</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
    
    <h2 style="color: #4CAF50;">🎁 Congratulations!</h2>
    <p>You have received a new exclusive coupon.</p>

    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <p style="font-size: 16px;">
        <strong>Coupon Code:</strong>
        <span style="background-color: #e8f5e9; padding: 6px 12px; border-radius: 4px; color: #2e7d32;">
          ${coupon_code}
        </span>
      </p>

      <p>
        <strong>Discount:</strong>
        ${discount_percentage ? `${discount_percentage}%` : `₹${discount_amount}`}
      </p>

      <p>
        <strong>Valid Until:</strong>
        ${new Date(coupon_end_date).toLocaleDateString()}
      </p>

      ${
        applicableItems.length
          ? `
        <div style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">
          <p><strong>${title}</strong></p>
          <ul style="padding-left: 20px; color: #555;">
            ${applicableItems.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      `
          : ""
      }
    </div>

    <p>Use this coupon at checkout to enjoy your discount.</p>

    <hr />
    <p style="font-size: 12px; color: #888;">
      This is an automated email. Terms and conditions apply.
    </p>
  </div>
</body>
</html>
`;
};

// export const sendBusinessApprovalEmailToAdmin = async (adminEmail, businessData) => {
//   try {
//     const mailOptions = {
//       from: `"Business Approval System" <${smtpUser}>`,
//       to: adminEmail,
//       subject: `New Business Approval Request - ${businessData.business_name}`,
//       html: `
//         <h3>New Business Registration Alert 🏢</h3>
//         <p><b>Business Name:</b> ${businessData.business_name}</p>
//         <p><b>GSTIN:</b> ${businessData.gst_in_number}</p>
//         <p><b>Address:</b> ${businessData.business_address}</p>
//         <p><b>Requested By User ID:</b> ${businessData.user_id}</p>
//         <hr/>
//         <p>Please login to the Admin Dashboard to review and approve this business.</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log("Admin business approval email sent successfully!");
//   } catch (error) {
//     console.error("Error sending admin business approval email:", error);
//   }
// };


export const generateBusinessApprovalEmailTemplate = (businessData) => {
  const {
    business_name,
    gst_in_number,
    business_address,
    user_id,
  } = businessData;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Business Approval Request</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
    
    <h2 style="color: #1976d2;">🏢 New Business Registration Alert</h2>

    <p>A new business has been registered and is awaiting approval.</p>

    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p><strong>Business Name:</strong> ${business_name}</p>
      <p><strong>GSTIN:</strong> ${gst_in_number}</p>
      <p><strong>Address:</strong> ${business_address}</p>
      <p><strong>Requested By User ID:</strong> ${user_id}</p>
    </div>

    <p>Please log in to the <strong>Admin Dashboard</strong> to review and approve this business.</p>

    <hr />
    <p style="font-size: 12px; color: #888;">
      This is an automated notification. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
`;
};

// export const sendBusinessVerificationSuccessEmail = async (userEmail, businessName) => {
//   try {
//     const mailOptions = {
//       from: `"Business Verification" <${smtpUser}>`,
//       to: userEmail,
//       subject: `Business Verification Successful! ✅ - ${businessName}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #4CAF50;">Verification Successful!</h2>
//           <p>Congratulations! Your business <b>${businessName}</b> has been successfully verified.</p>
//           <p>You now have full access to business features on our platform.</p>
//           <hr/>
//           <p style="font-size: 12px; color: #888;">Thank you for partnering with us.</p>
//         </div>
//       `,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`Verification success email sent to ${userEmail}`);
//   } catch (error) {
//     console.error(`Error sending verification success email to ${userEmail}:`, error);
//   }
// };


export const generateBusinessVerificationSuccessTemplate = (businessName) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Business Verified</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
    
    <h2 style="color: #4CAF50;">✅ Verification Successful!</h2>

    <p>
      Congratulations! Your business
      <strong>${businessName}</strong>
      has been successfully verified.
    </p>

    <p>
      You now have full access to all business features on our platform.
    </p>

    <hr />

    <p style="font-size: 12px; color: #888;">
      Thank you for partnering with us.
    </p>
  </div>
</body>
</html>
`;
};



export const generateBusinessAssignedTemplate = (businessName, employeeName) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Business Assigned</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
    
    <h2 style="color: #1976d2;">📌 Business Assigned to You</h2>

    <p>Hi <strong>${employeeName}</strong>,</p>

    <p>
      A new business (GST) has been assigned to you for handling and verification.
    </p>

    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p><strong>Business Name:</strong> ${businessName}</p>
    </div>

    <p>
      Please log in to the <strong>Employee Dashboard</strong> to review and take the necessary action.
    </p>

    <hr />

    <p style="font-size: 12px; color: #888;">
      This is an automated notification. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
`;
};

