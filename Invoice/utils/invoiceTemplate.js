// Optimized Invoice Templates - FINAL FIX: Default template shows table only ONCE

// Common HTML structure generator
const generateInvoice = (order, styles, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${order.order_id}</title>
  <style>${styles}</style>
</head>
<body>${content}</body>
</html>
`;

// Common base styles with page break support
const baseStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { padding: 40px 20px; }
  .container { max-width: 900px; margin: 0 auto; background: white; }
  table { width: 100%; border-collapse: collapse; margin: 30px 0; }
  th { padding: 16px; text-align: left; font-weight: 600; font-size: 14px; }
  td { padding: 16px; }
  .text-right { text-align: right; }
  .header-flex { display: flex; justify-content: space-between; align-items: flex-start; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
  
  /* Prevent page breaks inside table rows */
  tbody tr { page-break-inside: avoid; break-inside: avoid; }
  
  /* Keep table header on every page when printing */
  @media print {
    thead { display: table-row-group; }
    tbody tr { page-break-inside: avoid; }
  }
`;

// Product table generator - FIXED to not repeat headers
const generateProductTable = (order, theme) => `
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
      </tr>`).join('')}
    </tbody>
  </table>
`;

// Totals table generator
const generateTotals = (order) => `
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
      <tr class="total-row">
        <td><strong>TOTAL:</strong></td>
        <td class="text-right"><strong>${order.currency} ${order.total_amount.toFixed(2)}</strong></td>
      </tr>
    </table>
  </div>
`;

// Template configurations
const templates = {
  'Invoice1': {
    styles: `
      ${baseStyles}
      body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f5f5f5; }
      .container { padding: 60px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
      .header { padding-bottom: 30px; margin-bottom: 40px; border-bottom: 3px solid #2c3e50; }
      .logo h1 { font-size: 36px; color: #2c3e50; }
      .invoice-badge h2 { font-size: 48px; color: #2c3e50; text-align: right; margin-bottom: 10px; }
      .invoice-badge p { color: #7f8c8d; text-align: right; font-size: 16px; }
      .info-box h3 { color: #2c3e50; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; font-weight: 600; }
      .info-box p { color: #555; line-height: 1.8; font-size: 15px; }
      thead { background: #2c3e50; color: white; }
      th { text-transform: uppercase; letter-spacing: 0.5px; }
      td { border-bottom: 1px solid #ecf0f1; color: #555; }
      tbody tr:hover { background: #f8f9fa; }
      .totals { display: flex; justify-content: flex-end; margin-top: 30px; }
      .totals-table { width: 350px; }
      .totals-table td { border: none; padding: 10px 15px; }
      .totals-table .total-row { background: #2c3e50; color: white !important; font-size: 18px; }
      .totals-table .total-row td { color: white !important; }
      .footer { margin-top: 50px; padding-top: 30px; border-top: 2px solid #ecf0f1; text-align: center; color: #7f8c8d; font-size: 14px; }
    `,
    header: (order) => `
      <div class="header header-flex">
        <div class="logo">
          <h1>YOUR COMPANY</h1>
          <p style="color: #7f8c8d; font-size: 14px;">Professional Services</p>
        </div>
        <div class="invoice-badge">
          <h2>INVOICE</h2>
          <p>#${order.order_id}</p>
        </div>
      </div>
    `,
    body: (order) => `
      <div class="info-grid">
        <div class="info-box">
          <h3>From</h3>
          <p><strong>Your Company</strong><br>Email: support@yourcompany.com<br>Phone: +91 XXXXXXXX</p>
        </div>
        <div class="info-box">
          <h3>Bill To</h3>
          <p><strong>${order.address.first_name} ${order.address.last_name}</strong><br>
          ${order.address.street}<br>${order.address.city}, ${order.address.state} ${order.address.postal_code}<br>
          Phone: ${order.address.mobile_number}</p>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-box"><h3>Date</h3><p>${new Date(order.order_create_date).toDateString()}</p></div>
        <div class="info-box"><h3>Order ID</h3><p>${order.order_id}</p></div>
      </div>
    `
  },

  'Invoice2': {
    styles: `
      ${baseStyles}
      body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
      .container { border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 50px; }
      .logo h1 { font-size: 42px; margin-bottom: 5px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
      .logo p { font-size: 16px; opacity: 0.9; }
      .invoice-badge { background: rgba(255,255,255,0.2); padding: 20px 30px; border-radius: 10px; backdrop-filter: blur(10px); text-align: center; }
      .invoice-badge h2 { font-size: 24px; margin-bottom: 5px; }
      .invoice-badge p { font-size: 18px; opacity: 0.9; }
      .content { padding: 50px; }
      .info-box { background: #f8f9fa; padding: 25px; border-radius: 10px; border-left: 4px solid #667eea; }
      .info-box h3 { color: #667eea; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 15px; font-weight: 700; }
      .info-box p { color: #333; line-height: 1.8; font-size: 15px; }
      thead { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
      th { text-transform: uppercase; letter-spacing: 0.5px; }
      td { border-bottom: 1px solid #e9ecef; color: #333; }
      tbody tr:nth-child(even) { background: #f8f9fa; }
      tbody tr:hover { background: #e9ecef; transition: all 0.3s; }
      .totals { display: flex; justify-content: flex-end; margin-top: 40px; }
      .totals-table { width: 400px; background: #f8f9fa; border-radius: 10px; overflow: hidden; }
      .totals-table td { border: none; padding: 15px 20px; font-size: 16px; }
      .totals-table .total-row { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 22px; }
      .footer { background: #f8f9fa; padding: 30px 50px; text-align: center; color: #666; font-size: 14px; line-height: 1.8; }
    `,
    header: (order) => `
      <div class="header">
        <div class="header-flex">
          <div class="logo">
            <h1>YOUR COMPANY</h1>
          </div>
          <div class="invoice-badge">
            <h2>INVOICE</h2>
            <p>#${order.order_id}</p>
          </div>
        </div>
      </div>
    `,
    body: (order) => `
      <div class="content">
        <div class="info-grid">
          <div class="info-box">
            <h3>From</h3>
            <p><strong>Your Company</strong><br>Email: support@yourcompany.com<br>Phone: +91 XXXXXXXX</p>
          </div>
          <div class="info-box">
            <h3>Bill To</h3>
            <p><strong>${order.address.first_name} ${order.address.last_name}</strong><br>
            ${order.address.street}<br>${order.address.city}, ${order.address.state} ${order.address.postal_code}<br>
            Phone: ${order.address.mobile_number}</p>
          </div>
        </div>
        <div class="info-box" style="margin-bottom: 30px; text-align: center;">
          <p><strong>Date:</strong> ${new Date(order.order_create_date).toDateString()}</p>
        </div>
      </div>
    `
  },

  'Invoice3': {
    styles: `
      ${baseStyles}
      body { font-family: Georgia, serif; background: #e8eef3; }
      .container { box-shadow: 0 0 30px rgba(0,0,0,0.1); }
      .top-bar { background: #1e3a5f; height: 15px; }
      .header { padding: 40px 60px; border-bottom: 3px solid #2c5f8d; }
      .logo h1 { font-size: 38px; color: #1e3a5f; margin-bottom: 8px; font-weight: 700; }
      .logo .tagline { color: #2c5f8d; font-size: 15px; font-style: italic; margin-bottom: 20px; }
      .logo p { color: #555; line-height: 1.7; font-size: 14px; }
      .invoice-badge { background: #f5f8fb; padding: 25px; border-radius: 8px; border: 2px solid #2c5f8d; }
      .invoice-badge h2 { color: #1e3a5f; font-size: 32px; margin-bottom: 15px; }
      .invoice-badge p { color: #555; font-size: 14px; line-height: 1.8; }
      .invoice-badge strong { color: #1e3a5f; display: inline-block; width: 110px; }
      .content { padding: 40px 60px; }
      .info-box { background: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
      .info-box h3 { color: #1e3a5f; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; font-weight: 700; border-bottom: 2px solid #2c5f8d; padding-bottom: 8px; }
      .info-box p { color: #444; line-height: 1.9; font-size: 15px; }
      thead { background: #1e3a5f; color: white; }
      th { text-transform: uppercase; letter-spacing: 1px; font-family: Arial, sans-serif; }
      td { border-bottom: 1px solid #e1e8ed; color: #444; }
      tbody tr:nth-child(odd) { background: #fafbfc; }
      tbody tr:hover { background: #f0f4f8; }
      .totals { display: flex; justify-content: flex-end; margin-top: 40px; }
      .totals-table { width: 400px; border: 2px solid #2c5f8d; border-radius: 8px; overflow: hidden; }
      .totals-table td { border: none; background: transparent; padding: 14px 20px; font-size: 15px; }
      .totals-table tr { border-bottom: 1px solid #e1e8ed; }
      .totals-table .total-row { background: #1e3a5f; color: white; font-size: 20px; border: none; }
      .totals-table .total-row td { color: white !important; }
      .footer { background: #1e3a5f; color: white; padding: 30px 60px; text-align: center; font-size: 13px; line-height: 2; }
      .footer p { opacity: 0.9; }
    `,
    header: (order) => `
      <div class="top-bar"></div>
      <div class="header header-flex">
        <div class="logo">
          <h1>YOUR COMPANY</h1>
          <p class="tagline">Excellence in Business</p>
          <p>Email: support@yourcompany.com<br>Phone: +91 XXXXXXXX</p>
        </div>
        <div class="invoice-badge">
          <h2>INVOICE</h2>
          <p><strong>Invoice #:</strong> ${order.order_id}</p>
          <p><strong>Date:</strong> ${new Date(order.order_create_date).toDateString()}</p>
        </div>
      </div>
    `,
    body: (order) => `
      <div class="content">
        <div class="info-box">
          <h3>Invoiced To</h3>
          <p><strong>${order.address.first_name} ${order.address.last_name}</strong><br>
          ${order.address.street}<br>${order.address.city}, ${order.address.state} ${order.address.postal_code}<br>
          Phone: ${order.address.mobile_number}</p>
        </div>
      </div>
    `
  },

  'Invoice4': {
    styles: `
      ${baseStyles}
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; }
      .container { background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
      .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 50px; color: white; position: relative; overflow: hidden; }
      .header::before { content: ''; position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); }
      .header-flex { position: relative; z-index: 1; }
      .logo h1 { font-size: 44px; font-weight: 800; margin-bottom: 8px; letter-spacing: -1px; }
      .logo p { font-size: 16px; opacity: 0.95; font-weight: 500; }
      .invoice-badge { background: rgba(255,255,255,0.15); padding: 25px 35px; border-radius: 12px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); text-align: right; }
      .invoice-badge h2 { font-size: 18px; opacity: 0.9; margin-bottom: 8px; font-weight: 600; letter-spacing: 2px; }
      .invoice-badge p { font-size: 28px; font-weight: 700; }
      .content { padding: 50px; }
      .info-box { background: #334155; padding: 25px; border-radius: 12px; border-left: 4px solid #06b6d4; margin-bottom: 30px; }
      .info-box h3 { color: #06b6d4; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; font-weight: 700; }
      .info-box p { color: #e2e8f0; line-height: 1.9; font-size: 15px; }
      .info-box strong { color: #f1f5f9; }
      thead { background: #06b6d4; color: white; }
      th { text-transform: uppercase; letter-spacing: 1px; font-weight: 700; font-size: 12px; }
      td { border-bottom: 1px solid #334155; color: #e2e8f0; background: #1e293b; }
      tbody tr:hover { background: #334155 !important; transition: all 0.2s; }
      .totals { display: flex; justify-content: flex-end; margin-top: 40px; }
      .totals-table { width: 420px; background: #334155; border-radius: 12px; overflow: hidden; border: 1px solid #475569; }
      .totals-table td { border: none; background: transparent; padding: 16px 25px; font-size: 16px; color: #e2e8f0; }
      .totals-table tr:not(:last-child) { border-bottom: 1px solid #475569; }
      .totals-table .total-row { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; }
      .totals-table .total-row td { padding: 20px 25px; font-size: 22px; font-weight: 700; color: white; }
      .footer { background: #0f172a; padding: 35px 50px; text-align: center; color: #94a3b8; font-size: 14px; line-height: 1.9; }
    `,
    header: (order) => `
      <div class="header">
        <div class="header-flex">
          <div class="logo">
            <h1>YOUR COMPANY</h1>
            <p>Innovation & Technology</p>
          </div>
          <div class="invoice-badge">
            <h2>INVOICE</h2>
            <p>#${order.order_id}</p>
          </div>
        </div>
      </div>
    `,
    body: (order) => `
      <div class="content">
        <div class="info-box">
          <h3>Bill To</h3>
          <p><strong>${order.address.first_name} ${order.address.last_name}</strong><br>
          ${order.address.street}<br>${order.address.city}, ${order.address.state} ${order.address.postal_code}<br>
          Phone: ${order.address.mobile_number}</p>
        </div>
        <div class="info-box" style="text-align: center; border-left: none; border-top: 3px solid #3b82f6;">
          <p>Invoice Date: <strong style="color: #f1f5f9;">${new Date(order.order_create_date).toDateString()}</strong></p>
        </div>
      </div>
    `
  },

  'Invoice5': {
    styles: `
      ${baseStyles}
      body { font-family: Garamond, Georgia, serif; background: #f4f1ea; }
      .container { box-shadow: 0 10px 40px rgba(0,0,0,0.15); border: 1px solid #d4c5a9; }
      .top-bar { height: 8px; background: linear-gradient(90deg, #2d5016 0%, #4a7c2c 50%, #2d5016 100%); }
      .header { padding: 50px 60px 40px; background: linear-gradient(180deg, #fafaf8 0%, white 100%); border-bottom: 3px double #4a7c2c; }
      .logo h1 { font-size: 48px; color: #2d5016; margin-bottom: 5px; font-weight: 400; letter-spacing: 2px; }
      .logo .ornament { color: #4a7c2c; font-size: 24px; margin: 10px 0; }
      .logo p { color: #666; font-size: 16px; font-style: italic; }
      .invoice-badge { padding: 25px; border: 3px solid #4a7c2c; border-radius: 8px; background: white; text-align: center; }
      .invoice-badge h2 { font-size: 32px; color: #2d5016; margin-bottom: 12px; font-weight: 400; letter-spacing: 3px; }
      .invoice-badge p { font-size: 20px; color: #4a7c2c; font-weight: 600; font-family: 'Courier New', monospace; }
      .content { padding: 50px 60px; }
      .info-box { position: relative; padding-left: 20px; margin-bottom: 30px; }
      .info-box::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #4a7c2c; }
      .info-box h3 { color: #2d5016; font-size: 16px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 18px; font-weight: 600; }
      .info-box p { color: #444; line-height: 2; font-size: 16px; }
      .info-box strong { color: #2d5016; font-size: 17px; }
      thead { background: #2d5016; color: white; }
      th { text-transform: uppercase; letter-spacing: 1.5px; font-family: Arial, sans-serif; }
      td { border-bottom: 1px solid #e8e3d6; color: #444; }
      tbody tr:nth-child(even) { background: #fafaf8; }
      tbody tr:hover { background: #f5f3ed; }
      .totals { display: flex; justify-content: flex-end; margin-top: 45px; }
      .totals-table { width: 400px; border: 3px solid #4a7c2c; border-radius: 8px; overflow: hidden; }
      .totals-table td { border: none; background: transparent; padding: 16px 25px; font-size: 16px; }
      .totals-table tr:not(:last-child) { border-bottom: 1px solid #e8e3d6; }
      .totals-table .total-row { background: #2d5016; color: white; }
      .totals-table .total-row td { padding: 22px 25px; font-size: 24px; font-weight: 700; color: white !important; }
      .footer { background: linear-gradient(180deg, white 0%, #fafaf8 100%); padding: 40px 60px; border-top: 3px double #4a7c2c; text-align: center; color: #666; line-height: 2; font-size: 15px; }
      .footer-ornament { color: #4a7c2c; font-size: 28px; margin-bottom: 20px; }
      .bottom-bar { height: 8px; background: linear-gradient(90deg, #2d5016 0%, #4a7c2c 50%, #2d5016 100%); }
    `,
    header: (order) => `
      <div class="top-bar"></div>
      <div class="header header-flex">
        <div class="logo">
          <h1>YOUR COMPANY</h1>
          <div class="ornament">❖ ❖ ❖</div>
          <p>Premium Quality Services</p>
        </div>
        <div class="invoice-badge">
          <h2>INVOICE</h2>
          <p>№ ${order.order_id}</p>
        </div>
      </div>
    `,
    body: (order) => `
      <div class="content">
        <div style="text-align: center; background: #fafaf8; padding: 20px; border-radius: 8px; border: 1px solid #e8e3d6; margin-bottom: 30px;">
          <p style="color: #4a7c2c; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; font-weight: 600; font-family: Arial, sans-serif;">Invoice Date</p>
          <p style="color: #2d5016; font-size: 17px; font-weight: 600;">${new Date(order.order_create_date).toDateString()}</p>
        </div>
        <div class="info-box">
          <h3>Invoiced To</h3>
          <p><strong>${order.address.first_name} ${order.address.last_name}</strong><br>
          ${order.address.street}<br>${order.address.city}, ${order.address.state} ${order.address.postal_code}<br>
          Telephone: ${order.address.mobile_number}</p>
        </div>
      </div>
    `
  },

  'default': {
    styles: `
      body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
      .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
      .company h2 { margin: 0; }
      .invoice-title { font-size: 28px; font-weight: bold; color: #6c63ff; }
      hr { border: none; border-top: 2px solid #6c63ff; margin: 20px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th { background: #f3f4f6; padding: 10px; text-align: left; }
      td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
      .right { text-align: right; }
      .total { font-size: 18px; font-weight: bold; color: #6c63ff; }
    `,
    header: (order) => '',
    body: (order) => `
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
      <p>${order.address.first_name} ${order.address.last_name}<br/>
      ${order.address.street}, ${order.address.city}<br/>
      ${order.address.state} - ${order.address.postal_code}<br/>
      Phone: ${order.address.mobile_number}</p>
      <table>
        <thead>
          <tr><th>Description</th><th class="right">Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr>
        </thead>
        <tbody>
          ${order.order_products.map(p => `
          <tr>
            <td>${p.product_name}</td>
            <td class="right">${p.quantity}</td>
            <td class="right">${order.currency} ${p.unit_final_price.toFixed(2)}</td>
            <td class="right">${order.currency} ${p.total_final_price.toFixed(2)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <table style="margin-top: 30px; width: 400px; margin-left: auto;">
        <tr><td class="right">Subtotal:</td><td class="right">${order.currency} ${order.base_price.toFixed(2)}</td></tr>
        <tr><td class="right">Tax:</td><td class="right">${order.currency} ${order.tax_value.toFixed(2)}</td></tr>
        <tr><td class="right total">Total:</td><td class="right total">${order.currency} ${order.total_amount.toFixed(2)}</td></tr>
      </table>
      <p style="margin-top: 40px; text-align: center; color: #666;">Thank you for your business!</p>
    `
  }
};

// Main export function - FINAL FIX
export const invoiceTemplate = (order, templateType = 'default') => {
  const finalType = templateType || 'default';
  const template = templates[finalType] || templates['default'];

  const content =
    finalType === 'default'
      ? template.body(order)
      : `
        <div class="container">
          ${template.header(order)}
          ${template.body(order)}
          ${generateProductTable(order)}
          ${generateTotals(order)}
          <div class="footer"><p>Thank you for your business!</p></div>
          ${finalType === 'classic-elegance' ? '<div class="bottom-bar"></div>' : ''}
        </div>
      `;

  return generateInvoice(order, template.styles, content);
};


// Usage:
// invoiceTemplate(orderData, 'modern-minimalist')
// invoiceTemplate(orderData, 'colorful-gradient')
// invoiceTemplate(orderData, 'professional-corporate')
// invoiceTemplate(orderData, 'modern-tech')
// invoiceTemplate(orderData, 'classic-elegance')
// invoiceTemplate(orderData, 'default') or invoiceTemplate(orderData)