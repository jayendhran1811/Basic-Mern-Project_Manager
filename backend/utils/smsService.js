const twilio = require('twilio');

/**
 * Send SMS using Twilio
 * @param {string} to - Recipient phone number (e.g., +91XXXXXXXXXX)
 * @param {string} body - Message body
 */
const sendSMS = async (to, body) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    // If credentials are missing, throw error to be caught by route handler
    if (!accountSid || !authToken || !twilioNumber) {
        const missing = [];
        if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
        if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
        if (!twilioNumber) missing.push('TWILIO_PHONE_NUMBER');

        throw new Error(`Twilio credentials missing in .env: ${missing.join(', ')}`);
    }

    try {
        const client = twilio(accountSid, authToken);
        const message = await client.messages.create({
            body: body,
            from: twilioNumber,
            to: to
        });
        console.log(`SMS sent successfully: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error('Twilio SMS error:', error.message);
        throw error;
    }
};

module.exports = { sendSMS };

