// export const invoiceTemplate = (order) => {
//   return `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <title>Invoice</title>
//   <style>
//     body {
//       font-family: Arial, sans-serif;
//       padding: 40px;
//       color: #333;
//     }
//     .header {
//       display: flex;
//       justify-content: space-between;
//       margin-bottom: 30px;
//     }
//     .company h2 {
//       margin: 0;
//     }
//     .invoice-title {
//       font-size: 28px;
//       font-weight: bold;
//       color: #6c63ff;
//     }
//     hr {
//       border: none;
//       border-top: 2px solid #6c63ff;
//       margin: 20px 0;
//     }
//     table {
//       width: 100%;
//       border-collapse: collapse;
//       margin-top: 20px;
//     }
//     th {
//       background: #f3f4f6;
//       padding: 10px;
//       text-align: left;
//     }
//     td {
//       padding: 10px;
//       border-bottom: 1px solid #e5e7eb;
//     }
//     .right {
//       text-align: right;
//     }
//     .total {
//       font-size: 18px;
//       font-weight: bold;
//       color: #6c63ff;
//     }
//   </style>
// </head>
// <body>

//   <div class="header">
//     <div class="company">
//       <h2>Your Company</h2>
//       <p>Email: support@yourcompany.com</p>
//       <p>Phone: +91 XXXXXXXX</p>
//     </div>

//     <div>
//       <div class="invoice-title">INVOICE</div>
//       <p><b>Order ID:</b> ${order.order_id}</p>
//       <p><b>Date:</b> ${new Date(order.order_create_date).toDateString()}</p>
//     </div>
//   </div>

//   <hr />

//   <h3>Bill To</h3>
//   <p>
//     ${order.address.first_name} ${order.address.last_name}<br/>
//     ${order.address.street}, ${order.address.city}<br/>
//     ${order.address.state} - ${order.address.postal_code}<br/>
//     Phone: ${order.address.mobile_number}
//   </p>

//   <table>
//     <thead>
//       <tr>
//         <th>Description</th>
//         <th class="right">Qty</th>
//         <th class="right">Rate</th>
//         <th class="right">Amount</th>
//       </tr>
//     </thead>
//     <tbody>
//       ${order.order_products
//         .map(
//           (p) => `
//         <tr>
//           <td>${p.product_name}</td>
//           <td class="right">${p.quantity}</td>
//           <td class="right">${p.unit_final_price.toFixed(2)}</td>
//           <td class="right">${p.total_final_price.toFixed(2)}</td>
//         </tr>`
//         )
//         .join("")}
//     </tbody>
//   </table>

//   <table style="margin-top: 30px;">
//     <tr>
//       <td></td>
//       <td class="right">Subtotal:</td>
//       <td class="right">${order.base_price.toFixed(2)}</td>
//     </tr>
//     <tr>
//       <td></td>
//       <td class="right">Tax:</td>
//       <td class="right">${order.tax_value.toFixed(2)}</td>
//     </tr>
//     <tr>
//       <td></td>
//       <td class="right total">Total:</td>
//       <td class="right total">
//         ${order.total_amount.toFixed(2)} ${order.currency}
//       </td>
//     </tr>
//   </table>

// </body>
// </html>
// `;
// };
// Invoice Templates with Switch Cases

export const invoiceTemplate = (order, templateType = 'default') => {
  switch (templateType) {
    case 'modern-minimalist':
      return modernMinimalistTemplate(order);
    
    case 'colorful-gradient':
      return colorfulGradientTemplate(order);
    
    case 'professional-corporate':
      return professionalCorporateTemplate(order);
    
    case 'modern-tech':
      return modernTechTemplate(order);
    
    case 'classic-elegance':
      return classicEleganceTemplate(order);
    
    case 'default':
    default:
      return defaultTemplate(order);
  }
};

// Template 1: Modern Minimalist
const modernMinimalistTemplate = (order) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.order_id}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 40px 20px;
        }
        
        .invoice-container {
            max-width: 850px;
            margin: 0 auto;
            background: white;
            padding: 60px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 3px solid #2c3e50;
        }
        
        .logo-section h1 {
            font-size: 36px;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .logo-section p {
            color: #7f8c8d;
            font-size: 14px;
        }
        
        .invoice-title {
            text-align: right;
        }
        
        .invoice-title h2 {
            font-size: 48px;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .invoice-number {
            color: #7f8c8d;
            font-size: 16px;
        }
        
        .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        
        .info-box h3 {
            color: #2c3e50;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        
        .info-box p {
            color: #555;
            line-height: 1.8;
            font-size: 15px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        
        thead {
            background: #2c3e50;
            color: white;
        }
        
        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        td {
            padding: 15px;
            border-bottom: 1px solid #ecf0f1;
            color: #555;
        }
        
        tbody tr:hover {
            background: #f8f9fa;
        }
        
        .text-right {
            text-align: right;
        }
        
        .totals {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
        }
        
        .totals-table {
            width: 350px;
        }
        
        .totals-table tr td {
            padding: 10px 15px;
            border: none;
        }
        
        .totals-table tr:last-child {
            background: #2c3e50;
            color: white;
            font-size: 18px;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="logo-section">
                <h1>YOUR COMPANY</h1>
                <p>Professional Services</p>
            </div>
            <div class="invoice-title">
                <h2>INVOICE</h2>
                <p class="invoice-number">#${order.order_id}</p>
            </div>
        </div>
        
        <div class="info-section">
            <div class="info-box">
                <h3>From</h3>
                <p>
                    <strong>Your Company Name</strong><br>
                    Email: support@yourcompany.com<br>
                    Phone: +91 XXXXXXXX
                </p>
            </div>
            <div class="info-box">
                <h3>Bill To</h3>
                <p>
                    <strong>${order.address.first_name} ${order.address.last_name}</strong><br>
                    ${order.address.street}<br>
                    ${order.address.city}, ${order.address.state} ${order.address.postal_code}<br>
                    Phone: ${order.address.mobile_number}
                </p>
            </div>
        </div>
        
        <div class="info-section">
            <div class="info-box">
                <h3>Invoice Date</h3>
                <p>${new Date(order.order_create_date).toDateString()}</p>
            </div>
            <div class="info-box">
                <h3>Order ID</h3>
                <p>${order.order_id}</p>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${order.order_products.map(p => `
                <tr>
                    <td>${p.product_name}</td>
                    <td class="text-right">${p.quantity}</td>
                    <td class="text-right">${order.currency} ${p.unit_final_price.toFixed(2)}</td>
                    <td class="text-right">${order.currency} ${p.total_final_price.toFixed(2)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="totals">
            <table class="totals-table">
                <tr>
                    <td>Subtotal:</td>
                    <td class="text-right">${order.currency} ${order.base_price.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Tax:</td>
                    <td class="text-right">${order.currency} ${order.tax_value.toFixed(2)}</td>
                </tr>
                <tr>
                    <td><strong>TOTAL:</strong></td>
                    <td class="text-right"><strong>${order.currency} ${order.total_amount.toFixed(2)}</strong></td>
                </tr>
            </table>
        </div>
        
        <div class="footer">
            <p>Thank you for your business!</p>
        </div>
    </div>
</body>
</html>
`;
};

// Template 2: Colorful Gradient
const colorfulGradientTemplate = (order) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.order_id}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            min-height: 100vh;
        }
        
        .invoice-container {
            max-width: 850px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo-section h1 {
            font-size: 42px;
            margin-bottom: 5px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .logo-section p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .invoice-badge {
            background: rgba(255,255,255,0.2);
            padding: 20px 30px;
            border-radius: 10px;
            text-align: center;
            backdrop-filter: blur(10px);
        }
        
        .invoice-badge h2 {
            font-size: 24px;
            margin-bottom: 5px;
        }
        
        .invoice-badge p {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .content {
            padding: 50px;
        }
        
        .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        
        .info-box {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        
        .info-box h3 {
            color: #667eea;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 15px;
            font-weight: 700;
        }
        
        .info-box p {
            color: #333;
            line-height: 1.8;
            font-size: 15px;
        }
        
        .date-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .date-box h4 {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
            opacity: 0.9;
        }
        
        .date-box p {
            font-size: 18px;
            font-weight: bold;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            border-radius: 10px;
            overflow: hidden;
        }
        
        thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        th {
            padding: 18px 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        td {
            padding: 18px 15px;
            border-bottom: 1px solid #e9ecef;
            color: #333;
        }
        
        tbody tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        tbody tr:hover {
            background: #e9ecef;
            transition: all 0.3s;
        }
        
        .text-right {
            text-align: right;
        }
        
        .totals {
            margin-top: 40px;
            display: flex;
            justify-content: flex-end;
        }
        
        .totals-table {
            width: 400px;
            background: #f8f9fa;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .totals-table tr td {
            padding: 15px 20px;
            border: none;
            font-size: 16px;
        }
        
        .totals-table tr:last-child {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 22px;
            font-weight: bold;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px 50px;
            text-align: center;
            color: #666;
            font-size: 14px;
            line-height: 1.8;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="header-content">
                <div class="logo-section">
                    <h1>YOUR COMPANY</h1>
                    <p>Design & Development Studio</p>
                </div>
                <div class="invoice-badge">
                    <h2>INVOICE</h2>
                    <p>#${order.order_id}</p>
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="info-section">
                <div class="info-box">
                    <h3>From</h3>
                    <p>
                        <strong>Your Company Name</strong><br>
                        Email: support@yourcompany.com<br>
                        Phone: +91 XXXXXXXX
                    </p>
                </div>
                <div class="info-box">
                    <h3>Bill To</h3>
                    <p>
                        <strong>${order.address.first_name} ${order.address.last_name}</strong><br>
                        ${order.address.street}<br>
                        ${order.address.city}, ${order.address.state} ${order.address.postal_code}<br>
                        Phone: ${order.address.mobile_number}
                    </p>
                </div>
            </div>
            
            <div class="date-box">
                <h4>Invoice Date</h4>
                <p>${new Date(order.order_create_date).toDateString()}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Rate</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.order_products.map(p => `
                    <tr>
                        <td>${p.product_name}</td>
                        <td class="text-right">${p.quantity}</td>
                        <td class="text-right">${order.currency} ${p.unit_final_price.toFixed(2)}</td>
                        <td class="text-right">${order.currency} ${p.total_final_price.toFixed(2)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <table class="totals-table">
                    <tr>
                        <td>Subtotal:</td>
                        <td class="text-right">${order.currency} ${order.base_price.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Tax:</td>
                        <td class="text-right">${order.currency} ${order.tax_value.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>TOTAL DUE:</strong></td>
                        <td class="text-right"><strong>${order.currency} ${order.total_amount.toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for choosing our services!</p>
        </div>
    </div>
</body>
</html>
`;
};

// Template 3: Professional Corporate
const professionalCorporateTemplate = (order) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.order_id}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            background: #e8eef3;
            padding: 40px 20px;
        }
        
        .invoice-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
        }
        
        .top-bar {
            background: #1e3a5f;
            height: 15px;
        }
        
        .header {
            padding: 40px 60px;
            background: white;
            border-bottom: 3px solid #2c5f8d;
        }
        
        .header-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 40px;
            align-items: start;
        }
        
        .company-details h1 {
            font-size: 38px;
            color: #1e3a5f;
            margin-bottom: 8px;
            font-weight: 700;
        }
        
        .company-details .tagline {
            color: #2c5f8d;
            font-size: 15px;
            font-style: italic;
            margin-bottom: 20px;
        }
        
        .company-details p {
            color: #555;
            line-height: 1.7;
            font-size: 14px;
        }
        
        .invoice-details {
            background: #f5f8fb;
            padding: 25px;
            border-radius: 8px;
            border: 2px solid #2c5f8d;
        }
        
        .invoice-details h2 {
            color: #1e3a5f;
            font-size: 32px;
            margin-bottom: 15px;
        }
        
        .invoice-meta {
            color: #555;
            font-size: 14px;
            line-height: 1.8;
        }
        
        .invoice-meta strong {
            color: #1e3a5f;
            display: inline-block;
            width: 110px;
        }
        
        .content {
            padding: 40px 60px;
        }
        
        .client-section {
            padding: 30px;
            background: #f9fafb;
            border-radius: 8px;
            margin-bottom: 40px;
        }
        
        .client-section h3 {
            color: #1e3a5f;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
            font-weight: 700;
            border-bottom: 2px solid #2c5f8d;
            padding-bottom: 8px;
        }
        
        .client-section p {
            color: #444;
            line-height: 1.9;
            font-size: 15px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        
        thead {
            background: #1e3a5f;
            color: white;
        }
        
        th {
            padding: 16px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-family: 'Arial', sans-serif;
        }
        
        td {
            padding: 16px;
            border-bottom: 1px solid #e1e8ed;
            color: #444;
            font-size: 15px;
        }
        
        tbody tr:nth-child(odd) {
            background: #fafbfc;
        }
        
        tbody tr:hover {
            background: #f0f4f8;
        }
        
        .text-right {
            text-align: right;
        }
        
        .totals {
            margin-top: 40px;
            display: flex;
            justify-content: flex-end;
        }
        
        .totals-table {
            width: 400px;
            border: 2px solid #2c5f8d;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .totals-table tr td {
            padding: 14px 20px;
            border: none;
            background: white;
            font-size: 15px;
        }
        
        .totals-table tr {
            border-bottom: 1px solid #e1e8ed;
        }
        
        .totals-table tr:last-child {
            background: #1e3a5f;
            color: white;
            font-size: 20px;
            font-weight: bold;
            border: none;
        }
        
        .footer {
            background: #1e3a5f;
            color: white;
            padding: 30px 60px;
            text-align: center;
            font-size: 13px;
            line-height: 2;
        }
        
        .footer p {
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="top-bar"></div>
        
        <div class="header">
            <div class="header-grid">
                <div class="company-details">
                    <h1>YOUR COMPANY</h1>
                    <p class="tagline">Excellence in Business Solutions</p>
                    <p>
                        Email: support@yourcompany.com<br>
                        Phone: +91 XXXXXXXX
                    </p>
                </div>
                <div class="invoice-details">
                    <h2>INVOICE</h2>
                    <div class="invoice-meta">
                        <p><strong>Invoice #:</strong> ${order.order_id}</p>
                        <p><strong>Date:</strong> ${new Date(order.order_create_date).toDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="client-section">
                <h3>Invoiced To</h3>
                <p>
                    <strong>${order.address.first_name} ${order.address.last_name}</strong><br>
                    ${order.address.street}<br>
                    ${order.address.city}, ${order.address.state} ${order.address.postal_code}<br>
                    Phone: ${order.address.mobile_number}
                </p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Quantity</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.order_products.map(p => `
                    <tr>
                        <td>${p.product_name}</td>
                        <td class="text-right">${p.quantity}</td>
                        <td class="text-right">${order.currency} ${p.unit_final_price.toFixed(2)}</td>
                        <td class="text-right">${order.currency} ${p.total_final_price.toFixed(2)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <table class="totals-table">
                    <tr>
                        <td>Subtotal:</td>
                        <td class="text-right">${order.currency} ${order.base_price.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Tax:</td>
                        <td class="text-right">${order.currency} ${order.tax_value.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>TOTAL DUE:</strong></td>
                        <td class="text-right"><strong>${order.currency} ${order.total_amount.toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for your business. We appreciate your prompt payment.</p>
        </div>
    </div>
</body>
</html>
`;
};

// Template 4: Modern Tech
const modernTechTemplate = (order) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.order_id}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0f172a;
            padding: 40px 20px;
        }
        
        .invoice-container {
            max-width: 900px;
            margin: 0 auto;
            background: #1e293b;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .header {
            background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
            padding: 50px;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }
        
        .header-content {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            color: white;
        }
        
        .logo h1 {
            font-size: 44px;
            font-weight: 800;
            margin-bottom: 8px;
            letter-spacing: -1px;
        }
        
        .logo p {
            font-size: 16px;
            opacity: 0.95;
            font-weight: 500;
        }
        
        .invoice-number-box {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            padding: 25px 35px;
            border-radius: 12px;
            text-align: right;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .invoice-number-box h2 {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 8px;
            font-weight: 600;
            letter-spacing: 2px;
        }
        
        .invoice-number-box p {
            font-size: 28px;
            font-weight: 700;
        }
        
        .content {
            padding: 50px;
        }
        
        .detail-card {
            background: #334155;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #06b6d4;
            margin-bottom: 30px;
        }
        
        .detail-card h3 {
            color: #06b6d4;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
            font-weight: 700;
        }
        
        .detail-card p {
            color: #e2e8f0;
            line-height: 1.9;
            font-size: 15px;
        }
        
        .detail-card strong {
            color: #f1f5f9;
        }
        
        .date-item {
            background: #334155;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            border-top: 3px solid #3b82f6;
            margin-bottom: 30px;
        }
        
        .date-item label {
            color: #94a3b8;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            display: block;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .date-item p {
            color: #f1f5f9;
            font-size: 17px;
            font-weight: 600;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            border-radius: 12px;
            overflow: hidden;
        }
        
        thead {
            background: #06b6d4;
            color: white;
        }
        
        th {
            padding: 18px;
            text-align: left;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        td {
            padding: 18px;
            border-bottom: 1px solid #334155;
            color: #e2e8f0;
            background: #1e293b;
        }
        
        tbody tr:hover {
            background: #334155 !important;
            transition: all 0.2s;
        }
        
        .text-right {
            text-align: right;
        }
        
        .totals {
            margin-top: 40px;
            display: flex;
            justify-content: flex-end;
        }
        
        .totals-card {
            width: 420px;
            background: #334155;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #475569;
        }
        
        .totals-card table {
            margin: 0;
            border-radius: 0;
        }
        
        .totals-card tr td {
            padding: 16px 25px;
            border: none;
            background: transparent;
            font-size: 16px;
            color: #e2e8f0;
        }
        
        .totals-card tr:not(:last-child) {
            border-bottom: 1px solid #475569;
        }
        
        .totals-card tr:last-child {
            background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
            color: white;
        }
        
        .totals-card tr:last-child td {
            padding: 20px 25px;
            font-size: 22px;
            font-weight: 700;
            color: white;
        }
        
        .footer {
            background: #0f172a;
            padding: 35px 50px;
            text-align: center;
        }
        
        .footer-content {
            color: #94a3b8;
            font-size: 14px;
            line-height: 1.9;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="header-content">
                <div class="logo">
                    <h1>YOUR COMPANY</h1>
                    <p>Innovation & Technology</p>
                </div>
                <div class="invoice-number-box">
                    <h2>INVOICE</h2>
                    <p>#${order.order_id}</p>
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="detail-card">
                <h3>Bill To</h3>
                <p>
                    <strong>${order.address.first_name} ${order.address.last_name}</strong><br>
                    ${order.address.street}<br>
                    ${order.address.city}, ${order.address.state} ${order.address.postal_code}<br>
                    Phone: ${order.address.mobile_number}
                </p>
            </div>
            
            <div class="date-item">
                <label>Invoice Date</label>
                <p>${new Date(order.order_create_date).toDateString()}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Rate</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.order_products.map(p => `
                    <tr>
                        <td>${p.product_name}</td>
                        <td class="text-right">${p.quantity}</td>
                        <td class="text-right">${order.currency} ${p.unit_final_price.toFixed(2)}</td>
                        <td class="text-right">${order.currency} ${p.total_final_price.toFixed(2)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <div class="totals-card">
                    <table>
                        <tr>
                            <td>Subtotal:</td>
                            <td class="text-right">${order.currency} ${order.base_price.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Tax:</td>
                            <td class="text-right">${order.currency} ${order.tax_value.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>TOTAL DUE:</strong></td>
                            <td class="text-right"><strong>${order.currency} ${order.total_amount.toFixed(2)}</strong></td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-content">
                <p>Questions? Email us at support@yourcompany.com</p>
            </div>
        </div>
    </div>
</body>
</html>
`;
};

// Template 5: Classic Elegance
const classicEleganceTemplate = (order) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.order_id}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Garamond', 'Georgia', serif;
            background: #f4f1ea;
            padding: 40px 20px;
        }
        
        .invoice-container {
            max-width: 850px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            border: 1px solid #d4c5a9;
        }
        
        .decorative-border-top {
            height: 8px;
            background: linear-gradient(90deg, #2d5016 0%, #4a7c2c 50%, #2d5016 100%);
        }
        
        .header {
            padding: 50px 60px 40px;
            background: linear-gradient(180deg, #fafaf8 0%, white 100%);
            border-bottom: 3px double #4a7c2c;
        }
        
        .header-flex {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .company-brand h1 {
            font-size: 48px;
            color: #2d5016;
            margin-bottom: 5px;
            font-weight: 400;
            letter-spacing: 2px;
        }
        
        .company-brand .ornament {
            color: #4a7c2c;
            font-size: 24px;
            margin: 10px 0;
        }
        
        .company-brand p {
            color: #666;
            font-size: 16px;
            font-style: italic;
        }
        
        .invoice-badge {
            text-align: center;
            padding: 25px;
            border: 3px solid #4a7c2c;
            border-radius: 8px;
            background: white;
        }
        
        .invoice-badge h2 {
            font-size: 32px;
            color: #2d5016;
            margin-bottom: 12px;
            font-weight: 400;
            letter-spacing: 3px;
        }
        
        .invoice-badge p {
            font-size: 20px;
            color: #4a7c2c;
            font-weight: 600;
            font-family: 'Courier New', monospace;
        }
        
        .content {
            padding: 50px 60px;
        }
        
        .party-box {
            position: relative;
            padding-left: 20px;
            margin-bottom: 35px;
        }
        
        .party-box::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: #4a7c2c;
        }
        
        .party-box h3 {
            color: #2d5016;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 18px;
            font-weight: 600;
        }
        
        .party-box p {
            color: #444;
            line-height: 2;
            font-size: 16px;
        }
        
        .party-box strong {
            color: #2d5016;
            font-size: 17px;
        }
        
        .invoice-info {
            background: #fafaf8;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 40px;
            text-align: center;
            border: 1px solid #e8e3d6;
        }
        
        .invoice-info label {
            display: block;
            color: #4a7c2c;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 10px;
            font-weight: 600;
            font-family: 'Arial', sans-serif;
        }
        
        .invoice-info p {
            color: #2d5016;
            font-size: 17px;
            font-weight: 600;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 35px 0;
        }
        
        thead {
            background: #2d5016;
            color: white;
        }
        
        th {
            padding: 18px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-family: 'Arial', sans-serif;
        }
        
        td {
            padding: 18px;
            border-bottom: 1px solid #e8e3d6;
            color: #444;
            font-size: 16px;
        }
        
        tbody tr:nth-child(even) {
            background: #fafaf8;
        }
        
        tbody tr:hover {
            background: #f5f3ed;
        }
        
        .text-right {
            text-align: right;
        }
        
        .totals {
            margin-top: 45px;
            display: flex;
            justify-content: flex-end;
        }
        
        .total-section {
            width: 400px;
            background: white;
            border: 3px solid #4a7c2c;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .total-section table {
            margin: 0;
        }
        
        .total-section tr td {
            padding: 16px 25px;
            border: none;
            font-size: 16px;
            background: white;
        }
        
        .total-section tr:not(:last-child) {
            border-bottom: 1px solid #e8e3d6;
        }
        
        .total-section tr:last-child {
            background: #2d5016;
            color: white;
        }
        
        .total-section tr:last-child td {
            padding: 22px 25px;
            font-size: 24px;
            font-weight: 700;
            color: white;
        }
        
        .footer {
            background: linear-gradient(180deg, white 0%, #fafaf8 100%);
            padding: 40px 60px;
            border-top: 3px double #4a7c2c;
            text-align: center;
        }
        
        .footer-ornament {
            color: #4a7c2c;
            font-size: 28px;
            margin-bottom: 20px;
        }
        
        .footer p {
            color: #666;
            line-height: 2;
            font-size: 15px;
        }
        
        .decorative-border-bottom {
            height: 8px;
            background: linear-gradient(90deg, #2d5016 0%, #4a7c2c 50%, #2d5016 100%);
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="decorative-border-top"></div>
        
        <div class="header">
            <div class="header-flex">
                <div class="company-brand">
                    <h1>YOUR COMPANY</h1>
                    <div class="ornament">❖ ❖ ❖</div>
                    <p>Premium Quality Services</p>
                </div>
                <div class="invoice-badge">
                    <h2>INVOICE</h2>
                    <p>№ ${order.order_id}</p>
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="invoice-info">
                <label>Invoice Date</label>
                <p>${new Date(order.order_create_date).toDateString()}</p>
            </div>
            
            <div class="party-box">
                <h3>Invoiced To</h3>
                <p>
                    <strong>${order.address.first_name} ${order.address.last_name}</strong><br>
                    ${order.address.street}<br>
                    ${order.address.city}, ${order.address.state} ${order.address.postal_code}<br>
                    Telephone: ${order.address.mobile_number}
                </p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Quantity</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.order_products.map(p => `
                    <tr>
                        <td>${p.product_name}</td>
                        <td class="text-right">${p.quantity}</td>
                        <td class="text-right">${order.currency} ${p.unit_final_price.toFixed(2)}</td>
                        <td class="text-right">${order.currency} ${p.total_final_price.toFixed(2)}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <div class="total-section">
                    <table>
                        <tr>
                            <td>Subtotal:</td>
                            <td class="text-right">${order.currency} ${order.base_price.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Tax:</td>
                            <td class="text-right">${order.currency} ${order.tax_value.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>AMOUNT DUE:</strong></td>
                            <td class="text-right"><strong>${order.currency} ${order.total_amount.toFixed(2)}</strong></td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-ornament">❖</div>
            <p>Thank you for the privilege of serving you.</p>
            <p style="margin-top: 10px; font-style: italic;">"Excellence Through Service"</p>
        </div>
        
        <div class="decorative-border-bottom"></div>
    </div>
</body>
</html>
`;
};

// Default template (Original)
const defaultTemplate = (order) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #333;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .company h2 {
      margin: 0;
    }
    .invoice-title {
      font-size: 28px;
      font-weight: bold;
      color: #6c63ff;
    }
    hr {
      border: none;
      border-top: 2px solid #6c63ff;
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #f3f4f6;
      padding: 10px;
      text-align: left;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .right {
      text-align: right;
    }
    .total {
      font-size: 18px;
      font-weight: bold;
      color: #6c63ff;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="company">
      <h2>Your Company</h2>
      <p>Email: support@yourcompany.com</p>
      <p>Phone: +91 XXXXXXXX</p>
    </div>

    <div>
      <div class="invoice-title">INVOICE</div>
      <p><b>Order ID:</b> ${order.order_id}</p>
      <p><b>Date:</b> ${new Date(order.order_create_date).toDateString()}</p>
    </div>
  </div>

  <hr />

  <h3>Bill To</h3>
  <p>
    ${order.address.first_name} ${order.address.last_name}<br/>
    ${order.address.street}, ${order.address.city}<br/>
    ${order.address.state} - ${order.address.postal_code}<br/>
    Phone: ${order.address.mobile_number}
  </p>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="right">Qty</th>
        <th class="right">Rate</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${order.order_products
        .map(
          (p) => `
        <tr>
          <td>${p.product_name}</td>
          <td class="right">${p.quantity}</td>
          <td class="right">${p.unit_final_price.toFixed(2)}</td>
          <td class="right">${p.total_final_price.toFixed(2)}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>

  <table style="margin-top: 30px;">
    <tr>
      <td></td>
      <td class="right">Subtotal:</td>
      <td class="right">${order.base_price.toFixed(2)}</td>
    </tr>
    <tr>
      <td></td>
      <td class="right">Tax:</td>
      <td class="right">${order.tax_value.toFixed(2)}</td>
    </tr>
    <tr>
      <td></td>
      <td class="right total">Total:</td>
      <td class="right total">
        ${order.total_amount.toFixed(2)} ${order.currency}
      </td>
    </tr>
  </table>

</body>
</html>
`;
};

// Usage Example:
/*
// To use different templates:
const htmlInvoice1 = invoiceTemplate(orderData, 'modern-minimalist');
const htmlInvoice2 = invoiceTemplate(orderData, 'colorful-gradient');
const htmlInvoice3 = invoiceTemplate(orderData, 'professional-corporate');
const htmlInvoice4 = invoiceTemplate(orderData, 'modern-tech');
const htmlInvoice5 = invoiceTemplate(orderData, 'classic-elegance');
const htmlInvoiceDefault = invoiceTemplate(orderData, 'default');
// or simply: const htmlInvoiceDefault = invoiceTemplate(orderData);
*/