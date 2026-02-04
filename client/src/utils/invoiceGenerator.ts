// Invoice generation utilities for Vivaha Split

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  from: {
    name: string;
    email?: string;
  };
  to: {
    name: string;
    email?: string;
  };
  items: Array<{
    description: string;
    amount: number;
  }>;
  total: number;
}

export const generateInvoiceNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `VIV-${timestamp}-${random}`;
};

export const generateInvoiceHTML = (data: InvoiceData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      background: #f8f9fa;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #ec4899;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .invoice-details {
      text-align: right;
    }
    .invoice-number {
      font-size: 24px;
      font-weight: bold;
      color: #ec4899;
      margin-bottom: 5px;
    }
    .date {
      color: #666;
      font-size: 14px;
    }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .party {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    .party-label {
      font-weight: bold;
      color: #ec4899;
      margin-bottom: 10px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .party-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .party-email {
      color: #666;
      font-size: 14px;
    }
    .items-table {
      width: 100%;
      margin-bottom: 30px;
      border-collapse: collapse;
    }
    .items-table th {
      background: #ec4899;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }
    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .amount-col {
      text-align: right;
      font-weight: 600;
    }
    .total-section {
      text-align: right;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
    }
    .total-row {
      display: flex;
      justify-content: flex-end;
      gap: 40px;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .total-label {
      color: #666;
      font-weight: 500;
    }
    .total-amount {
      font-weight: bold;
      min-width: 120px;
    }
    .grand-total {
      font-size: 24px;
      color: #ec4899;
      padding-top: 15px;
      border-top: 2px solid #ec4899;
      margin-top: 10px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .payment-info {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 15px;
      margin: 30px 0;
    }
    .payment-info-title {
      font-weight: bold;
      color: #92400e;
      margin-bottom: 8px;
    }
    .payment-info-text {
      color: #78350f;
      font-size: 14px;
    }
    @media print {
      body {
        padding: 0;
        background: white;
      }
      .invoice-container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="logo">Vivaha</div>
      <div class="invoice-details">
        <div class="invoice-number">INVOICE #${data.invoiceNumber}</div>
        <div class="date">Date: ${new Date(data.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <div class="date">Due: ${new Date(data.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <div class="party-label">From</div>
        <div class="party-name">${data.from.name}</div>
        ${data.from.email ? `<div class="party-email">${data.from.email}</div>` : ''}
      </div>
      <div class="party">
        <div class="party-label">Bill To</div>
        <div class="party-name">${data.to.name}</div>
        ${data.to.email ? `<div class="party-email">${data.to.email}</div>` : ''}
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th class="amount-col">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td class="amount-col">$${item.amount.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="total-section">
      <div class="total-row grand-total">
        <div class="total-label">TOTAL DUE:</div>
        <div class="total-amount">$${data.total.toFixed(2)}</div>
      </div>
    </div>

    <div class="payment-info">
      <div class="payment-info-title">Payment Instructions</div>
      <div class="payment-info-text">
        Please remit payment for the above amount at your earliest convenience. 
        Contact the sender for preferred payment method details.
      </div>
    </div>

    <div class="footer">
      <p>Generated by Vivaha Wedding Planner • https://vivahaplan.com</p>
      <p style="margin-top: 5px;">This is an electronically generated invoice and is valid without signature.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const downloadInvoice = (data: InvoiceData) => {
  const html = generateInvoiceHTML(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${data.invoiceNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const emailInvoice = async (data: InvoiceData, recipientEmail: string) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/email/send-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: recipientEmail,
        invoiceData: data,
        invoiceHTML: generateInvoiceHTML(data),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send invoice email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
};
