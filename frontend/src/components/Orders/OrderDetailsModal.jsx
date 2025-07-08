import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  MapPin,
  User,
  Phone,
  CreditCard,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Download,
  Printer,
  Share2,
  MessageCircle,
  Mail,
  Copy,
  ExternalLink,
  FileText,
  QrCode,
  Send,
  Smartphone,
  Globe,
  Link,
  RefreshCw,
} from "lucide-react";
import { StatusBadge } from "../common";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getLocalizedText,
} from "../../utils/formatters";

import ordersAPI from "../../services/ordersAPI";

const OrderDetailsModal = ({
  isOpen,
  onClose,
  orderId,
  onEdit,
  onDelete,
  onStatusUpdate,
  onPaymentStatusUpdate,
}) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderDetails();
    }
  }, [isOpen, orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getOrder(orderId);
      if (response.success) {
        setOrder(response.data);
      } else {
        console.error("Failed to load order:", response.message);
      }
    } catch (error) {
      console.error("Error loading order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (onStatusUpdate) {
      await onStatusUpdate(orderId, newStatus);
      loadOrderDetails(); // Reload to get updated data
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus) => {
    if (onPaymentStatusUpdate) {
      await onPaymentStatusUpdate(orderId, newPaymentStatus);
      loadOrderDetails(); // Reload to get updated data
    }
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");

    // Generate the print content
    const printContent = generatePrintContent(order);

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Advanced Actions Functions
  const handleShareWhatsApp = () => {
    const orderSummary = generateOrderSummary(order);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      orderSummary
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleShareWhatsAppToStore = () => {
    if (order.store?.phone) {
      const orderSummary = generateOrderSummary(order);
      const phoneNumber = order.store.phone.replace(/[^\d]/g, ""); // Remove non-digits
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        orderSummary
      )}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  const handleSendEmail = () => {
    const orderSummary = generateOrderSummary(order);
    const subject = `طلب رقم ${order.order_number} - ${order.store?.name}`;
    const mailtoUrl = `mailto:${
      order.store?.email || ""
    }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      orderSummary
    )}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyOrderDetails = async () => {
    const orderSummary = generateOrderSummary(order);
    try {
      await navigator.clipboard.writeText(orderSummary);
      // Show success message (you can add toast notification here)
      alert("تم نسخ تفاصيل الطلب بنجاح!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = orderSummary;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("تم نسخ تفاصيل الطلب بنجاح!");
    }
  };

  const handleGenerateQR = () => {
    const orderUrl = `${window.location.origin}/orders/${order.id}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      orderUrl
    )}`;

    // Open QR code in new window
    const qrWindow = window.open("", "_blank");
    qrWindow.document.write(`
      <html>
        <head><title>QR Code - طلب رقم ${order.order_number}</title></head>
        <body style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
          <h2>QR Code للطلب رقم ${order.order_number}</h2>
          <img src="${qrUrl}" alt="QR Code" style="border: 1px solid #ddd; padding: 10px;"/>
          <p>امسح الكود للوصول لتفاصيل الطلب</p>
          <button onclick="window.print()" style="padding: 10px 20px; margin: 10px;">طباعة</button>
          <button onclick="window.close()" style="padding: 10px 20px; margin: 10px;">إغلاق</button>
        </body>
      </html>
    `);
  };

  const handleExportPDF = () => {
    // Create a more detailed print version for PDF
    const printWindow = window.open("", "_blank");
    const pdfContent = generatePDFContent(order);

    printWindow.document.write(pdfContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleDuplicateOrder = () => {
    // Create a copy of the order for editing
    const duplicatedOrder = {
      ...order,
      order_number: `${order.order_number}-COPY`,
      status: "draft",
      payment_status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (onEdit) {
      onEdit(duplicatedOrder);
    }
  };

  // Helper function to generate order summary for sharing
  const generateOrderSummary = (order) => {
    const language = "ar"; // Default language

    const statusLabels = {
      ar: {
        draft: "مسودة",
        confirmed: "مؤكد",
        in_progress: "قيد التنفيذ",
        delivered: "تم التسليم",
        cancelled: "ملغي",
      },
      en: {
        draft: "Draft",
        confirmed: "Confirmed",
        in_progress: "In Progress",
        delivered: "Delivered",
        cancelled: "Cancelled",
      },
    };

    const paymentStatusLabels = {
      ar: {
        pending: "معلق",
        paid: "مدفوع",
        partial: "مدفوع جزئياً",
        overdue: "متأخر",
      },
      en: {
        pending: "Pending",
        paid: "Paid",
        partial: "Partially Paid",
        overdue: "Overdue",
      },
    };

    const labels = statusLabels[language] || statusLabels.ar;
    const paymentLabels =
      paymentStatusLabels[language] || paymentStatusLabels.ar;

    let summary =
      language === "ar"
        ? `🏪 *تفاصيل الطلب رقم ${order.order_number}*\n\n`
        : `🏪 *Order Details #${order.order_number}*\n\n`;

    summary +=
      language === "ar"
        ? `📅 *تاريخ الطلب:* ${formatDate(order.order_date)}\n`
        : `📅 *Order Date:* ${formatDate(order.order_date)}\n`;

    summary +=
      language === "ar"
        ? `🏬 *المتجر:* ${order.store?.name}\n`
        : `🏬 *Store:* ${order.store?.name}\n`;

    summary +=
      language === "ar"
        ? `📍 *العنوان:* ${order.store?.address}\n`
        : `📍 *Address:* ${order.store?.address}\n`;

    summary +=
      language === "ar"
        ? `📞 *الهاتف:* ${order.store?.phone}\n\n`
        : `📞 *Phone:* ${order.store?.phone}\n\n`;

    summary +=
      language === "ar"
        ? `📋 *حالة الطلب:* ${labels[order.status]}\n`
        : `📋 *Order Status:* ${labels[order.status]}\n`;

    summary +=
      language === "ar"
        ? `💳 *حالة الدفع:* ${paymentLabels[order.payment_status]}\n\n`
        : `💳 *Payment Status:* ${paymentLabels[order.payment_status]}\n\n`;

    if (order.delivery_date) {
      summary +=
        language === "ar"
          ? `🚚 *تاريخ التسليم:* ${formatDate(order.delivery_date)}\n\n`
          : `🚚 *Delivery Date:* ${formatDate(order.delivery_date)}\n\n`;
    }

    summary +=
      language === "ar" ? `💰 *الملخص المالي:*\n` : `💰 *Financial Summary:*\n`;

    summary +=
      language === "ar"
        ? `• المبلغ الإجمالي: ${formatCurrency(order.total_amount)}\n`
        : `• Total Amount: ${formatCurrency(order.total_amount)}\n`;

    if (order.discount_amount > 0) {
      summary +=
        language === "ar"
          ? `• الخصم: ${formatCurrency(order.discount_amount)}\n`
          : `• Discount: ${formatCurrency(order.discount_amount)}\n`;
    }

    summary +=
      language === "ar"
        ? `• المبلغ النهائي: ${formatCurrency(order.final_amount)}\n\n`
        : `• Final Amount: ${formatCurrency(order.final_amount)}\n\n`;

    if (order.items && order.items.length > 0) {
      summary +=
        language === "ar" ? `📦 *عناصر الطلب:*\n` : `📦 *Order Items:*\n`;

      order.items.forEach((item, index) => {
        summary += `${index + 1}. ${item.product?.name} - `;
        summary +=
          language === "ar"
            ? `الكمية: ${item.quantity}`
            : `Qty: ${item.quantity}`;

        if (item.gift_quantity > 0) {
          summary +=
            language === "ar"
              ? ` (+${item.gift_quantity} هدية)`
              : ` (+${item.gift_quantity} gift)`;
        }
        summary += ` - ${formatCurrency(item.final_price)}\n`;
      });
      summary += `\n`;
    }

    if (order.gifts) {
      summary +=
        language === "ar"
          ? `🎁 *الهدايا:* ${order.gifts}\n\n`
          : `🎁 *Gifts:* ${order.gifts}\n\n`;
    }

    if (order.notes) {
      summary +=
        language === "ar"
          ? `📝 *ملاحظات:* ${order.notes}\n\n`
          : `📝 *Notes:* ${order.notes}\n\n`;
    }

    summary +=
      language === "ar"
        ? `⏰ *تم الإنشاء:* ${formatDate(order.created_at)}\n`
        : `⏰ *Created:* ${formatDate(order.created_at)}\n`;

    summary += `\n---\n`;
    summary +=
      language === "ar"
        ? `تم إنشاء هذا الملخص من نظام إدارة المخبز 🥖`
        : `Generated from Bakery Management System 🥖`;

    return summary;
  };

  // Generate PDF content (enhanced version)
  const generatePDFContent = (order) => {
    const statusLabels = {
      draft: "مسودة",
      confirmed: "مؤكد",
      in_progress: "قيد التنفيذ",
      delivered: "تم التسليم",
      cancelled: "ملغي",
    };

    const paymentStatusLabels = {
      pending: "معلق",
      paid: "مدفوع",
      partial: "مدفوع جزئياً",
      overdue: "متأخر",
    };

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير مفصل - طلب رقم ${order.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6; color: #333; background: white; padding: 20px; direction: rtl;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;
            text-align: center;
          }
          .header h1 { font-size: 28px; margin-bottom: 10px; }
          .header p { font-size: 16px; opacity: 0.9; }
          .section { 
            background: #f8f9fa; padding: 20px; border-radius: 8px; 
            margin-bottom: 20px; border-left: 4px solid #667eea;
          }
          .section h2 { color: #667eea; margin-bottom: 15px; font-size: 20px; }
          .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
          .info-item { background: white; padding: 15px; border-radius: 6px; border: 1px solid #e9ecef; }
          .info-label { font-weight: bold; color: #495057; margin-bottom: 5px; }
          .info-value { color: #212529; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .items-table th, .items-table td { 
            padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;
          }
          .items-table th { background: #667eea; color: white; }
          .items-table tr:nth-child(even) { background: #f8f9fa; }
          .financial-summary { 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white; padding: 20px; border-radius: 8px; margin: 20px 0;
          }
          .financial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
          .financial-item { text-align: center; }
          .financial-label { font-size: 14px; opacity: 0.9; }
          .financial-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
          .footer { 
            text-align: center; margin-top: 40px; padding: 20px;
            border-top: 2px solid #667eea; color: #6c757d;
          }
          @media print {
            body { padding: 0; }
            .header { background: #667eea !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير مفصل للطلب</h1>
          <p>طلب رقم ${order.order_number} - ${order.store?.name}</p>
        </div>

        <div class="section">
          <h2>معلومات الطلب الأساسية</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">رقم الطلب</div>
              <div class="info-value">${order.order_number}</div>
            </div>
            <div class="info-item">
              <div class="info-label">تاريخ الطلب</div>
              <div class="info-value">${formatDate(order.order_date)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">حالة الطلب</div>
              <div class="info-value">${statusLabels[order.status]}</div>
            </div>
            <div class="info-item">
              <div class="info-label">حالة الدفع</div>
              <div class="info-value">${
                paymentStatusLabels[order.payment_status]
              }</div>
            </div>
            ${
              order.delivery_date
                ? `
            <div class="info-item">
              <div class="info-label">تاريخ التسليم</div>
              <div class="info-value">${formatDate(order.delivery_date)}</div>
            </div>
            `
                : ""
            }
          </div>
        </div>

        <div class="section">
          <h2>معلومات المتجر</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">اسم المتجر</div>
              <div class="info-value">${order.store?.name || "غير محدد"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">العنوان</div>
              <div class="info-value">${
                order.store?.address || "غير محدد"
              }</div>
            </div>
            <div class="info-item">
              <div class="info-label">رقم الهاتف</div>
              <div class="info-value">${order.store?.phone || "غير محدد"}</div>
            </div>
            ${
              order.store?.email
                ? `
            <div class="info-item">
              <div class="info-label">البريد الإلكتروني</div>
              <div class="info-value">${order.store.email}</div>
            </div>
            `
                : ""
            }
          </div>
        </div>

        ${
          order.items && order.items.length > 0
            ? `
        <div class="section">
          <h2>عناصر الطلب</h2>
          <table class="items-table">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>سعر الوحدة</th>
                <th>الخصم</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>
                    ${item.product?.name || "غير محدد"}
                    ${
                      item.product?.unit
                        ? `<br><small>(${item.product.unit})</small>`
                        : ""
                    }
                  </td>
                  <td>
                    ${item.quantity}
                    ${
                      item.gift_quantity > 0
                        ? `<br><small style="color: green;">(+${item.gift_quantity} هدية)</small>`
                        : ""
                    }
                  </td>
                  <td>${formatCurrency(item.unit_price)}</td>
                  <td style="color: red;">${formatCurrency(
                    item.discount_amount
                  )}</td>
                  <td><strong>${formatCurrency(item.final_price)}</strong></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <div class="financial-summary">
          <h2 style="text-align: center; margin-bottom: 20px;">الملخص المالي</h2>
          <div class="financial-grid">
            <div class="financial-item">
              <div class="financial-label">المبلغ الإجمالي</div>
              <div class="financial-value">${formatCurrency(
                order.total_amount
              )}</div>
            </div>
            <div class="financial-item">
              <div class="financial-label">إجمالي الخصم</div>
              <div class="financial-value">${formatCurrency(
                order.discount_amount
              )}</div>
            </div>
            <div class="financial-item">
              <div class="financial-label">المبلغ النهائي</div>
              <div class="financial-value">${formatCurrency(
                order.final_amount
              )}</div>
            </div>
            <div class="financial-item">
              <div class="financial-label">المبلغ المدفوع</div>
              <div class="financial-value">${formatCurrency(
                order.paid_amount || 0
              )}</div>
            </div>
          </div>
        </div>

        ${
          order.gifts
            ? `
        <div class="section">
          <h2>الهدايا</h2>
          <p>${order.gifts}</p>
        </div>
        `
            : ""
        }

        ${
          order.notes
            ? `
        <div class="section">
          <h2>ملاحظات</h2>
          <p>${order.notes}</p>
        </div>
        `
            : ""
        }

        <div class="footer">
          <p>تم إنشاء هذا التقرير في ${new Date().toLocaleString("ar-EG")}</p>
          <p>نظام إدارة المخبز - جميع الحقوق محفوظة</p>
        </div>
      </body>
      </html>
    `;
  };

  // Helper function to generate CSV data
  const generateCSVData = (order) => {
    const headers = ["Field", "Value"];
    const rows = [
      ["Order Number", order.order_number],
      ["Store Name", order.store?.name || ""],
      ["Order Date", formatDate(order.order_date)],
      [
        "Delivery Date",
        order.delivery_date ? formatDate(order.delivery_date) : "",
      ],
      ["Status", order.status],
      ["Payment Status", order.payment_status],
      ["Total Amount", order.total_amount],
      ["Discount Amount", order.discount_amount],
      ["Final Amount", order.final_amount],
      ["Paid Amount", order.paid_amount || 0],
      ["Gifts", order.gifts || ""],
      ["Notes", order.notes || ""],
      ["Store Phone", order.store?.phone || ""],
      ["Store Address", order.store?.address || ""],
      ["Created At", formatDate(order.created_at)],
      ["Updated At", formatDate(order.updated_at)],
    ];

    return [headers, ...rows];
  };

  // Helper function to download CSV
  const downloadCSV = (data, filename) => {
    const csvContent = data
      .map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generatePrintContent = (order) => {
    const statusLabels = {
      draft: "مسودة",
      confirmed: "مؤكد",
      in_progress: "قيد التنفيذ",
      delivered: "تم التسليم",
      cancelled: "ملغي",
    };

    const paymentStatusLabels = {
      pending: "معلق",
      paid: "مدفوع",
      partial: "مدفوع جزئياً",
      overdue: "متأخر",
    };

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>طلب رقم ${order.order_number}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
            direction: rtl;
          }
          
                     .header {
             background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
             border-bottom: 4px solid #2563eb;
             margin-bottom: 30px;
             position: relative;
             overflow: hidden;
           }
           
           .header::before {
             content: '';
             position: absolute;
             top: 0;
             left: 0;
             right: 0;
             height: 4px;
             background: linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa, #3b82f6, #2563eb);
             background-size: 200% 100%;
             animation: shimmer 3s ease-in-out infinite;
           }
           
           @keyframes shimmer {
             0%, 100% { background-position: 200% 0; }
             50% { background-position: -200% 0; }
           }
           
           .header-content {
             display: flex;
             justify-content: space-between;
             align-items: center;
             padding: 25px 30px;
             position: relative;
           }
           
           .logo-section {
             display: flex;
             align-items: center;
             gap: 20px;
           }
           
           .logo {
             filter: drop-shadow(0 4px 8px rgba(37, 99, 235, 0.2));
             transition: transform 0.3s ease;
           }
           
           .logo:hover {
             transform: scale(1.05);
           }
           
           .company-info h1 {
             color: #1e293b;
             font-size: 32px;
             font-weight: 800;
             margin: 0 0 5px 0;
             text-shadow: 0 2px 4px rgba(0,0,0,0.1);
             background: linear-gradient(135deg, #1e293b, #2563eb);
             -webkit-background-clip: text;
             -webkit-text-fill-color: transparent;
             background-clip: text;
           }
           
           .company-subtitle {
             color: #64748b;
             font-size: 14px;
             font-weight: 500;
             margin: 0 0 8px 0;
             letter-spacing: 0.5px;
             text-transform: uppercase;
           }
           
           .company-tagline {
             color: #475569;
             font-size: 16px;
             font-weight: 400;
             margin: 0;
             font-style: italic;
           }
           
           .print-info {
             text-align: left;
             display: flex;
             flex-direction: column;
             gap: 15px;
             background: white;
             padding: 20px;
             border-radius: 12px;
             box-shadow: 0 4px 12px rgba(0,0,0,0.1);
             border: 1px solid #e2e8f0;
           }
           
           .print-date, .print-time {
             font-size: 13px;
             color: #475569;
             line-height: 1.4;
           }
           
           .print-date strong, .print-time strong {
             color: #1e293b;
             font-weight: 600;
             display: block;
             margin-bottom: 4px;
           }
           
           .header-divider {
             height: 3px;
             background: linear-gradient(90deg, transparent, #2563eb, transparent);
             margin: 0 30px;
           }
          
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          
          .section-title {
            background: #f3f4f6;
            padding: 12px 16px;
            border-right: 4px solid #2563eb;
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .info-label {
            font-weight: 600;
            color: #374151;
          }
          
          .info-value {
            color: #1f2937;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .status-draft { background: #fef3c7; color: #92400e; }
          .status-confirmed { background: #dbeafe; color: #1e40af; }
          .status-in_progress { background: #fef3c7; color: #92400e; }
          .status-delivered { background: #d1fae5; color: #065f46; }
          .status-cancelled { background: #fee2e2; color: #991b1b; }
          
          .payment-pending { background: #fef3c7; color: #92400e; }
          .payment-paid { background: #d1fae5; color: #065f46; }
          .payment-partial { background: #fed7aa; color: #9a3412; }
          .payment-overdue { background: #fee2e2; color: #991b1b; }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          
          .items-table th,
          .items-table td {
            padding: 12px;
            text-align: right;
            border: 1px solid #d1d5db;
          }
          
          .items-table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
          }
          
          .items-table tbody tr:nth-child(even) {
            background: #f9fafb;
          }
          
          .financial-summary {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
          }
          
          .financial-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #d1d5db;
          }
          
          .financial-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
            color: #059669;
          }
          
          .history-item {
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 10px;
            background: #fafafa;
          }
          
          .history-date {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          
          .history-action {
            font-weight: 600;
            color: #374151;
          }
          
                     .notes-box {
             background: #fffbeb;
             border: 1px solid #fbbf24;
             border-radius: 8px;
             padding: 15px;
             margin-top: 15px;
           }
           
           .footer {
             margin-top: 50px;
             padding: 25px 0;
             background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
             border-top: 3px solid #2563eb;
             position: relative;
           }
           
           .footer::before {
             content: '';
             position: absolute;
             top: 0;
             left: 0;
             right: 0;
             height: 3px;
             background: linear-gradient(90deg, transparent, #2563eb, transparent);
           }
           
           .footer-content {
             display: flex;
             justify-content: space-between;
             align-items: center;
             padding: 0 30px;
           }
           
           .footer-left {
             text-align: right;
           }
           
           .footer-title {
             font-size: 18px;
             font-weight: 700;
             color: #1e293b;
             margin: 0 0 5px 0;
           }
           
           .footer-subtitle {
             font-size: 12px;
             color: #64748b;
             margin: 0 0 8px 0;
             font-weight: 500;
             letter-spacing: 0.5px;
           }
           
           .footer-copyright {
             font-size: 11px;
             color: #94a3b8;
             margin: 0;
           }
           
           .footer-right {
             text-align: left;
           }
           
           .footer-print-info {
             font-size: 12px;
             color: #475569;
             margin: 0;
             line-height: 1.5;
           }
           
           .footer-print-info strong {
             color: #1e293b;
             font-weight: 600;
           }
          
          @media print {
            body {
              padding: 0;
            }
            
            .section {
              page-break-inside: avoid;
            }
            
            .items-table {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
                 <div class="header">
           <div class="header-content">
             <div class="logo-section">
               <div class="logo">
                 <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <circle cx="50" cy="50" r="45" fill="#2563eb" stroke="#1e40af" stroke-width="2"/>
                   <path d="M30 45 C30 35, 40 25, 50 25 C60 25, 70 35, 70 45 C70 50, 65 55, 60 55 L40 55 C35 55, 30 50, 30 45 Z" fill="white"/>
                   <circle cx="42" cy="42" r="3" fill="#2563eb"/>
                   <circle cx="58" cy="42" r="3" fill="#2563eb"/>
                   <path d="M35 65 Q50 75 65 65" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
                   <rect x="25" y="70" width="50" height="8" rx="4" fill="white"/>
                 </svg>
               </div>
               <div class="company-info">
                 <h1>نظام إدارة المخابز</h1>
                 <p class="company-subtitle">Bakery Management System</p>
                 <p class="company-tagline">إدارة شاملة ومتطورة لأعمال المخابز</p>
               </div>
             </div>
             <div class="print-info">
               <div class="print-date">
                 <strong>تاريخ الطباعة:</strong><br>
                 ${new Date().toLocaleDateString("en-GB", {
                   year: "numeric",
                   month: "2-digit",
                   day: "2-digit",
                 })}
               </div>
               <div class="print-time">
                 <strong>وقت الطباعة:</strong><br>
                 ${new Date().toLocaleTimeString("en-GB", {
                   hour: "2-digit",
                   minute: "2-digit",
                   hour12: false,
                 })}
               </div>
             </div>
           </div>
           <div class="header-divider"></div>
         </div>

        <!-- معلومات الطلب الأساسية -->
        <div class="section">
          <div class="section-title">معلومات الطلب</div>
          <div class="info-grid">
            <div>
              <div class="info-item">
                <span class="info-label">رقم الطلب:</span>
                <span class="info-value">${order.order_number}</span>
              </div>
                             <div class="info-item">
                 <span class="info-label">تاريخ الطلب:</span>
                 <span class="info-value">${new Date(
                   order.order_date
                 ).toLocaleDateString("en-GB", {
                   year: "numeric",
                   month: "2-digit",
                   day: "2-digit",
                 })}</span>
               </div>
               <div class="info-item">
                 <span class="info-label">تاريخ التسليم:</span>
                 <span class="info-value">${
                   order.delivery_date
                     ? new Date(order.delivery_date).toLocaleDateString(
                         "en-GB",
                         {
                           year: "numeric",
                           month: "2-digit",
                           day: "2-digit",
                         }
                       )
                     : "غير محدد"
                 }</span>
               </div>
              <div class="info-item">
                <span class="info-label">حالة الطلب:</span>
                <span class="info-value">
                  <span class="status-badge status-${order.status}">${
      statusLabels[order.status]
    }</span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">حالة الدفع:</span>
                <span class="info-value">
                  <span class="status-badge payment-${order.payment_status}">${
      paymentStatusLabels[order.payment_status]
    }</span>
                </span>
              </div>
            </div>
            <div>
              <div class="info-item">
                <span class="info-label">اسم المتجر:</span>
                <span class="info-value">${
                  order.store?.name || "غير محدد"
                }</span>
              </div>
              <div class="info-item">
                <span class="info-label">هاتف المتجر:</span>
                <span class="info-value">${
                  order.store?.phone || "غير محدد"
                }</span>
              </div>
              <div class="info-item">
                <span class="info-label">عنوان المتجر:</span>
                <span class="info-value">${
                  order.store?.address || "غير محدد"
                }</span>
              </div>
              <div class="info-item">
                <span class="info-label">منشئ الطلب:</span>
                <span class="info-value">${
                  order.creator?.full_name || "غير محدد"
                }</span>
              </div>
                             <div class="info-item">
                 <span class="info-label">تاريخ الإنشاء:</span>
                 <span class="info-value">${new Date(
                   order.created_at
                 ).toLocaleDateString("en-GB", {
                   year: "numeric",
                   month: "2-digit",
                   day: "2-digit",
                 })} - ${new Date(order.created_at).toLocaleTimeString(
      "en-GB",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    )}</span>
               </div>
            </div>
          </div>
        </div>

        <!-- عناصر الطلب -->
        <div class="section">
          <div class="section-title">عناصر الطلب (${
            order.items?.length || 0
          } عنصر)</div>
          ${
            order.items && order.items.length > 0
              ? `
            <table class="items-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الوحدة</th>
                  <th>الكمية</th>
                  <th>سعر الوحدة</th>
                  <th>الخصم</th>
                  <th>المجموع</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item) => `
                  <tr>
                    <td>
                      <strong>${item.product?.name || "غير محدد"}</strong>
                      ${
                        item.gift_quantity > 0
                          ? `<br><small style="color: #059669;">+${item.gift_quantity} هدية</small>`
                          : ""
                      }
                    </td>
                    <td>${item.product?.unit || "غير محدد"}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.unit_price)}</td>
                    <td style="color: #dc2626;">${formatCurrency(
                      item.discount_amount || 0
                    )}</td>
                    <td><strong>${formatCurrency(
                      item.final_price
                    )}</strong></td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          `
              : '<p style="text-align: center; color: #6b7280; padding: 20px;">لا توجد عناصر في هذا الطلب</p>'
          }
        </div>

        <!-- الملخص المالي -->
        <div class="section">
          <div class="section-title">الملخص المالي</div>
          <div class="financial-summary">
            <div class="financial-row">
              <span>المبلغ الإجمالي:</span>
              <span>${formatCurrency(order.total_amount)}</span>
            </div>
            <div class="financial-row">
              <span>إجمالي الخصم:</span>
              <span style="color: #dc2626;">-${formatCurrency(
                order.discount_amount
              )}</span>
            </div>
            <div class="financial-row">
              <span>المبلغ النهائي:</span>
              <span>${formatCurrency(order.final_amount)}</span>
            </div>
            <div class="financial-row">
              <span>المبلغ المدفوع:</span>
              <span style="color: #059669;">${formatCurrency(
                order.paid_amount || 0
              )}</span>
            </div>
            <div class="financial-row">
              <span>المبلغ المتبقي:</span>
              <span style="color: ${
                order.final_amount - (order.paid_amount || 0) > 0
                  ? "#dc2626"
                  : "#059669"
              };">
                ${formatCurrency(order.final_amount - (order.paid_amount || 0))}
              </span>
            </div>
          </div>
        </div>

        <!-- سجل التغييرات -->
        ${
          order.history && order.history.length > 0
            ? `
          <div class="section">
            <div class="section-title">سجل التغييرات</div>
                         ${order.history
                           .map(
                             (entry) => `
               <div class="history-item">
                 <div class="history-date">${new Date(
                   entry.created_at
                 ).toLocaleDateString("en-GB", {
                   year: "numeric",
                   month: "2-digit",
                   day: "2-digit",
                 })} - ${new Date(entry.created_at).toLocaleTimeString(
                               "en-GB",
                               {
                                 hour: "2-digit",
                                 minute: "2-digit",
                                 hour12: false,
                               }
                             )}</div>
                 <div class="history-action">${entry.action}</div>
                 ${
                   entry.details
                     ? `<div style="color: #6b7280; font-size: 14px; margin-top: 5px;">${entry.details}</div>`
                     : ""
                 }
               </div>
             `
                           )
                           .join("")}
          </div>
        `
            : ""
        }

        <!-- الملاحظات -->
        ${
          order.notes
            ? `
          <div class="section">
            <div class="section-title">الملاحظات</div>
            <div class="notes-box">
              ${order.notes}
            </div>
          </div>
        `
            : ""
        }

                 <!-- تذييل الطباعة -->
         <div class="footer">
           <div class="footer-content">
             <div class="footer-left">
               <p class="footer-title">نظام إدارة المخابز</p>
               <p class="footer-subtitle">Bakery Management System</p>
               <p class="footer-copyright">© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
             </div>
             <div class="footer-right">
               <p class="footer-print-info">
                 <strong>تم إنتاج هذا التقرير في:</strong><br>
                 ${new Date().toLocaleDateString("en-GB", {
                   year: "numeric",
                   month: "long",
                   day: "numeric",
                 })} - ${new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })}
               </p>
             </div>
           </div>
         </div>
      </body>
      </html>
    `;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return <Edit className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "delivered":
        return <Package className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "partial":
        return <AlertCircle className="h-4 w-4" />;
      case "overdue":
        return <XCircle className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {loading ? "جاري التحميل..." : `طلب رقم ${order?.order_number}`}
              </h2>
              {order && (
                <p className="text-sm text-gray-600">
                  تم الإنشاء في {formatDate(order.created_at)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order && (
              <>
                {/* Quick Actions */}
                <div className="flex items-center gap-1 mr-2 border-r border-gray-200 pr-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md"
                    title="مشاركة على واتساب"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCopyOrderDetails}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                    title="نسخ تفاصيل الطلب"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleGenerateQR}
                    className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md"
                    title="إنشاء QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </button>
                </div>

                {/* Print & Export Actions */}
                <div className="flex items-center gap-1 mr-2 border-r border-gray-200 pr-2">
                  <button
                    onClick={handlePrint}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                    title="طباعة تفاصيل الطلب"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                    title="تصدير كـ PDF"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                </div>

                {/* Management Actions */}
                <div className="flex items-center gap-1 mr-2 border-r border-gray-200 pr-2">
                  <button
                    onClick={() => onEdit && onEdit(order)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                    title="تعديل الطلب"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDuplicateOrder}
                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md"
                    title="نسخ الطلب"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                {/* Danger Actions */}
                <div className="flex items-center gap-1 mr-2">
                  {order.can_be_cancelled && (
                    <button
                      onClick={() => onDelete && onDelete(order)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                      title="حذف الطلب"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : order ? (
          <div className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "details"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                تفاصيل الطلب
              </button>
              <button
                onClick={() => setActiveTab("items")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "items"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                العناصر ({order.items?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "history"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                سجل التغييرات
              </button>
              <button
                onClick={() => setActiveTab("actions")}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === "actions"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                إجراءات متقدمة
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Status Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          حالة الطلب
                        </span>
                        {order.can_be_modified && (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="draft">مسودة</option>
                            <option value="confirmed">مؤكد</option>
                            <option value="in_progress">قيد التنفيذ</option>
                            <option value="delivered">تم التسليم</option>
                            <option value="cancelled">ملغي</option>
                          </select>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <StatusBadge status={order.status} type="order" />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          حالة الدفع
                        </span>
                        <select
                          value={order.payment_status}
                          onChange={(e) =>
                            handlePaymentStatusChange(e.target.value)
                          }
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">معلق</option>
                          <option value="paid">مدفوع</option>
                          <option value="partial">مدفوع جزئياً</option>
                          <option value="overdue">متأخر</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPaymentStatusIcon(order.payment_status)}
                        <StatusBadge
                          status={order.payment_status}
                          type="payment"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        معلومات الطلب
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <span className="text-sm text-gray-600">
                              تاريخ الطلب:
                            </span>
                            <span className="mr-2 font-medium">
                              {formatDate(order.order_date)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <span className="text-sm text-gray-600">
                              تاريخ التسليم:
                            </span>
                            <span className="mr-2 font-medium">
                              {formatDate(order.delivery_date)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <span className="text-sm text-gray-600">
                              منشئ الطلب:
                            </span>
                            <span className="mr-2 font-medium">
                              {order.creator?.full_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        معلومات المتجر
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div>
                            <span className="text-sm text-gray-600">
                              اسم المتجر:
                            </span>
                            <span className="mr-2 font-medium">
                              {order.store?.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <div>
                            <span className="text-sm text-gray-600">
                              الهاتف:
                            </span>
                            <span className="mr-2 font-medium">
                              {order.store?.phone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                          <div>
                            <span className="text-sm text-gray-600">
                              العنوان:
                            </span>
                            <span className="mr-2 font-medium">
                              {order.store?.address}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      الملخص المالي
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">
                          المبلغ الإجمالي:
                        </span>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">الخصم:</span>
                        <div className="text-lg font-bold text-red-600">
                          -{formatCurrency(order.discount_amount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          المبلغ النهائي:
                        </span>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(order.final_amount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          المبلغ المدفوع:
                        </span>
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(order.paid_amount || 0)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        ملاحظات
                      </h3>
                      <p className="text-gray-700">{order.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "items" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    عناصر الطلب
                  </h3>

                  {order.items && order.items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              المنتج
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              الكمية
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              سعر الوحدة
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              الخصم
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              المجموع
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {order.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.product?.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.product?.unit}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.quantity}
                                {item.gift_quantity > 0 && (
                                  <span className="text-green-600 mr-1">
                                    (+{item.gift_quantity} هدية)
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.unit_price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                {formatCurrency(item.discount_amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(item.final_price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد عناصر في هذا الطلب
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    سجل التغييرات
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          تم إنشاء الطلب
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(order.created_at)} -{" "}
                          {order.creator?.full_name}
                        </div>
                      </div>
                    </div>

                    {order.updated_at !== order.created_at && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Edit className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            تم تحديث الطلب
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(order.updated_at)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Add more history items based on order status changes */}
                  </div>
                </div>
              )}

              {activeTab === "actions" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    إجراءات متقدمة للطلب
                  </h3>

                  {/* Sharing & Communication */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-green-600" />
                      المشاركة والتواصل
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <button
                        onClick={handleShareWhatsApp}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition-all"
                      >
                        <MessageCircle className="h-6 w-6 text-green-600" />
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            مشاركة عامة
                          </div>
                          <div className="text-sm text-gray-600">واتساب</div>
                        </div>
                      </button>

                      {order.store?.phone && (
                        <button
                          onClick={handleShareWhatsAppToStore}
                          className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition-all"
                        >
                          <Smartphone className="h-6 w-6 text-green-600" />
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              إرسال للمتجر
                            </div>
                            <div className="text-sm text-gray-600">
                              واتساب مباشر
                            </div>
                          </div>
                        </button>
                      )}

                      <button
                        onClick={handleSendEmail}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all"
                      >
                        <Mail className="h-6 w-6 text-blue-600" />
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            إرسال بريد
                          </div>
                          <div className="text-sm text-gray-600">
                            البريد الإلكتروني
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={handleCopyOrderDetails}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all"
                      >
                        <Copy className="h-6 w-6 text-purple-600" />
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            نسخ التفاصيل
                          </div>
                          <div className="text-sm text-gray-600">للحافظة</div>
                        </div>
                      </button>

                      <button
                        onClick={handleGenerateQR}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all"
                      >
                        <QrCode className="h-6 w-6 text-indigo-600" />
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            QR Code
                          </div>
                          <div className="text-sm text-gray-600">
                            رمز الاستجابة
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          const orderUrl = `${window.location.origin}/orders/${order.id}`;
                          navigator.clipboard.writeText(orderUrl);
                          alert("تم نسخ رابط الطلب!");
                        }}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all"
                      >
                        <Link className="h-6 w-6 text-gray-600" />
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            نسخ الرابط
                          </div>
                          <div className="text-sm text-gray-600">
                            رابط مباشر
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Export & Print */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Download className="h-5 w-5 text-red-600" />
                      التصدير والطباعة
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all"
                      >
                        <Printer className="h-6 w-6 text-gray-600" />
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            طباعة عادية
                          </div>
                          <div className="text-sm text-gray-600">
                            تفاصيل أساسية
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-red-200 hover:border-red-400 hover:shadow-md transition-all"
                      >
                        <FileText className="h-6 w-6 text-red-600" />
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            تقرير مفصل
                          </div>
                          <div className="text-sm text-gray-600">
                            PDF احترافي
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          const csvData = generateCSVData(order);
                          downloadCSV(
                            csvData,
                            `order-${order.order_number}.csv`
                          );
                        }}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition-all"
                      >
                        <Download className="h-6 w-6 text-green-600" />
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            تصدير CSV
                          </div>
                          <div className="text-sm text-gray-600">
                            جدول بيانات
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Order Management */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      إدارة الطلب
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <button
                        onClick={handleDuplicateOrder}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all"
                      >
                        <RefreshCw className="h-6 w-6 text-indigo-600" />
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            نسخ الطلب
                          </div>
                          <div className="text-sm text-gray-600">
                            إنشاء نسخة
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          loadOrderDetails();
                          alert("تم تحديث بيانات الطلب!");
                        }}
                        className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all"
                      >
                        <RefreshCw className="h-6 w-6 text-blue-600" />
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            تحديث البيانات
                          </div>
                          <div className="text-sm text-gray-600">
                            إعادة تحميل
                          </div>
                        </div>
                      </button>

                      {order.store?.phone && (
                        <button
                          onClick={() => {
                            window.open(`tel:${order.store.phone}`, "_self");
                          }}
                          className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition-all"
                        >
                          <Phone className="h-6 w-6 text-green-600" />
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              اتصال بالمتجر
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.store.phone}
                            </div>
                          </div>
                        </button>
                      )}

                      {order.store?.address && (
                        <button
                          onClick={() => {
                            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              order.store.address
                            )}`;
                            window.open(mapsUrl, "_blank");
                          }}
                          className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all"
                        >
                          <MapPin className="h-6 w-6 text-blue-600" />
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              عرض الموقع
                            </div>
                            <div className="text-sm text-gray-600">
                              خرائط جوجل
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Status Updates */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      تحديث سريع للحالة
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        onClick={() => handleStatusChange("confirmed")}
                        className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition-all"
                      >
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">
                          تأكيد
                        </span>
                      </button>

                      <button
                        onClick={() => handleStatusChange("in_progress")}
                        className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all"
                      >
                        <Clock className="h-6 w-6 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">
                          قيد التنفيذ
                        </span>
                      </button>

                      <button
                        onClick={() => handleStatusChange("delivered")}
                        className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all"
                      >
                        <Package className="h-6 w-6 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">
                          تم التسليم
                        </span>
                      </button>

                      <button
                        onClick={() => handlePaymentStatusChange("paid")}
                        className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition-all"
                      >
                        <CreditCard className="h-6 w-6 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">
                          تم الدفع
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">فشل في تحميل تفاصيل الطلب</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal;
