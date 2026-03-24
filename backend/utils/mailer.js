const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your preferred service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendVerificationCode = async (email, code) => {
    const mailOptions = {
        from: `"Lolly's Food Joint" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Lolly\'s Verification Code',
        html: `
            <div style="font-family: 'Poppins', sans-serif; padding: 40px; background-color: #F9FAFB;">
                <h1 style="color: #F97316;">Verify Your Account</h1>
                <p>Welcome to Lolly's Food Joint! Your verification code is:</p>
                <div style="font-size: 32px; font-weight: 700; color: #111827; margin: 30px 0;">${code}</div>
                <p>Please enter this code in the app to complete your registration.</p>
                <p>This code will expire in 10 minutes.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

exports.sendReportEmail = async (email, reportType, orders) => {
    const ordersHtml = orders.map(order => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${order.order_number}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${order.customer_name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">R${parseFloat(order.total_amount).toFixed(2)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${order.status}</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: `"Lolly's Corporate" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Lolly's Executive Report: ${reportType}`,
        html: `
            <div style="font-family: 'Montserrat', sans-serif; padding: 40px; background-color: #ffffff; color: #111827;">
                <h1 style="color: #F97316; font-size: 24px;">Executive Performance Report</h1>
                <p style="color: #6B7280;">This report contains sensitive company information. Access has been logged.</p>
                
                <h3 style="margin-top: 30px;">Recent Activity Overview</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #F9FAFB;">
                            <th style="text-align: left; padding: 12px; border-bottom: 2px solid #F3F4F6;">Order #</th>
                            <th style="text-align: left; padding: 12px; border-bottom: 2px solid #F3F4F6;">Customer</th>
                            <th style="text-align: left; padding: 12px; border-bottom: 2px solid #F3F4F6;">Amount</th>
                            <th style="text-align: left; padding: 12px; border-bottom: 2px solid #F3F4F6;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ordersHtml}
                    </tbody>
                </table>
                
                <div style="margin-top: 40px; padding: 20px; background-color: #FDFCF0; border-radius: 12px;">
                    <p style="font-size: 12px; color: #9CA3AF;">&copy; 2026 Lolly's Food Joint. Proprietary and Confidential.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending report email:', error);
    }
};
