const { Telegraf } = require('telegraf');
const axios = require('axios');
const cheerio = require('cheerio');
const {
    EventBridgeClient,
    EnableRuleCommand,
    DisableRuleCommand,
} = require("@aws-sdk/client-eventbridge");

// Replace 'YOUR_BOT_TOKEN' with your bot's token
const BOT_TOKEN = process.env.BOT_TOKEN;
// Replace 'CHAT_ID' with your group's chat ID
const CHAT_ID = process.env.CHAT_ID;

const bot = new Telegraf(BOT_TOKEN);

const client = new EventBridgeClient({});
const ruleName = process.env.RETRY_RULE_NAME;

const enableRetrySchedule = async () => {
    const command = new EnableRuleCommand({ Name: ruleName });
    await client.send(command);
    console.log(`Enabled rule: ${ruleName}`);
};

const disableRetrySchedule = async () => {
    const command = new DisableRuleCommand({ Name: ruleName });
    await client.send(command);
    console.log(`Disabled rule: ${ruleName}`);
};

const getLastUpdatedDate = async () => {
    try {
        const { data } = await axios.get('https://www.hnb.net/exchange-rates');
        const $ = cheerio.load(data);

        let updatedDate;

        // Find all <p> tags and look for one that contains "Last updated:"
        $("p").each((_, el) => {
            const text = $(el).text().trim();
            const match = text.match(/Last updated:\s*(\d{4}-\d{2}-\d{2})/);
            if (match) {
                updatedDate = match[1]; // the date string
            }
        });

        return updatedDate;
    } catch (error) {
        console.error('Error fetching last updated date:', error);
    }
};

const getExchangeRate = async () => {
    try {
        const { data } = await axios.get('https://www.hnb.net/exchange-rates');
        const $ = cheerio.load(data);

        const rates = [];
        $('table tbody tr').each((_, element) => {
            const currencyCode = $(element).find('td').eq(1).text().trim();
            const buyingRate = $(element).find('td').eq(2).text().trim();
            const sellingRate = $(element).find('td').eq(3).text().trim();

            rates.push({
                currencyCode,
                buyingRate,
                sellingRate,
            });
        });

        return rates;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
    }
};

const sendExchangeRate = async () => {
    const extractedDate = await getLastUpdatedDate();
    console.log("Extracted date:", extractedDate);

    // Get current date in YYYY-MM-DD format (UTC or local as needed)
    const today = new Date();
    const currentDate = today.toISOString().split("T")[0];

    if (extractedDate === currentDate) {
        const rates = await getExchangeRate();

        let message = `HNB Exchange Rate:\n`
        rates.forEach(({ currencyCode, buyingRate, sellingRate }) => {
            if (["USD", "EUR"].includes(currencyCode)) {
                message += `${currencyCode} - ${parseFloat(buyingRate).toFixed(2)}(B) - ${parseFloat(sellingRate).toFixed(2)}(S)\n`
            }
        });

        try {
            await bot.telegram.sendMessage(CHAT_ID, message);
            console.log('Message sent successfully');
            await disableRetrySchedule();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    } else {
        const currentHour = today.getHours(); // returns hour in 24-hour format (0-23)

        // This is 5.00 AM UTC
        if (currentHour < 5) {
            await enableRetrySchedule();
        } else {
            await disableRetrySchedule();
        }
    }
};

// Lambda handler
exports.run = async () => {
    await sendExchangeRate();
};