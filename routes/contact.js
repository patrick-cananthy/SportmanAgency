const express = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Email configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'sportsmantalenta56@gmail.com',
            pass: process.env.EMAIL_PASS || '' // Set this in .env file
        }
    });
};

// Email mapping based on form type
const getRecipientEmail = (formType) => {
    const emailMap = {
        'brands': 'sportsmantalentagencybrandprom@gmail.com',
        'athletes': 'scoutresearchedusportsmantalent@gmail.com',
        'media': 'sportsmantalenta56@gmail.com',
        'careers': 'sportsmantalenta56@gmail.com'
    };
    return emailMap[formType] || 'sportsmantalenta56@gmail.com';
};

// Contact form submission
router.post('/submit', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('formType').isIn(['brands', 'athletes', 'media', 'careers']).withMessage('Invalid form type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, message, formType, sport, level, outlet, subject, position } = req.body;
        
        const recipientEmail = getRecipientEmail(formType);
        
        // Build email subject based on form type
        let emailSubject = '';
        switch (formType) {
            case 'brands':
                emailSubject = `Brand Partnership Inquiry from ${name}`;
                break;
            case 'athletes':
                emailSubject = `Talent Representation Inquiry from ${name}${sport ? ` - ${sport}` : ''}`;
                break;
            case 'media':
                emailSubject = subject || `Media Inquiry from ${name}${outlet ? ` - ${outlet}` : ''}`;
                break;
            case 'careers':
                emailSubject = `Career Application from ${name}${position ? ` - ${position}` : ''}`;
                break;
            default:
                emailSubject = `Contact Form Submission from ${name}`;
        }

        // Build email body
        let emailBody = `
            <h2>New ${formType.charAt(0).toUpperCase() + formType.slice(1)} Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
        `;

        if (sport) emailBody += `<p><strong>Sport:</strong> ${sport}</p>`;
        if (level) emailBody += `<p><strong>Competition Level:</strong> ${level}</p>`;
        if (outlet) emailBody += `<p><strong>Media Outlet:</strong> ${outlet}</p>`;
        if (subject && formType === 'media') emailBody += `<p><strong>Subject:</strong> ${subject}</p>`;
        if (position) emailBody += `<p><strong>Position:</strong> ${position}</p>`;

        emailBody += `
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><small>This email was sent from the Sportsman Talent Agency contact form.</small></p>
        `;

        // Check if email credentials are configured
        if (!process.env.EMAIL_PASS) {
            console.error('Email password not configured. Please set EMAIL_PASS in .env file');
            return res.status(500).json({ 
                message: 'Email service not configured. Please contact us directly at ' + recipientEmail 
            });
        }

        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER || 'sportsmantalenta56@gmail.com',
            to: recipientEmail,
            subject: emailSubject,
            html: emailBody,
            replyTo: email
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            message: 'Thank you for your inquiry! We will get back to you soon.',
            success: true 
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            message: 'Failed to send message. Please try again or contact us directly.',
            error: error.message 
        });
    }
});

module.exports = router;

