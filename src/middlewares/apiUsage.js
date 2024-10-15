const mongoose = require('mongoose');
const { UserModel, ApiUsageModel } = require('../models');

const trackApiUsage = async (req, res, next) => {
    try {
        const apiKey = req.headers['key'] || req.query['key'];
        const apiKeySecret = req.headers['secret'] || req.query['secret'];
        const token = req.headers['token'];
        const domain = req.headers['origin'] || req.headers['referer'];

        const apiEndpoint = req.originalUrl;
        const method = req.method;
        const ipAddress = req.ip;

        // Get the start and end of the current day to ensure daily tracking
        const startOfToday = new Date(new Date().setHours(0, 0, 0, 0)); // Midnight today
        const endOfToday = new Date(new Date().setHours(23, 59, 59, 999)); // End of the day today

        // Fetch user details from the database with API key and secret
        const userDetails = await UserModel.findOne({ apiKeySecret, apiKey });
        const userId = userDetails?._id ? userDetails?.id : 'anonymous';

        // Check if record exists for this user, API, and day
        let apiUsage = await ApiUsageModel.findOne({
            userId,
            apiEndpoint,
            method,
            date: { $gte: startOfToday, $lte: endOfToday } // Ensure the date falls within today
        });

        if (apiUsage) {
            // If record exists, increment the usage count and update lastUsedAt
            apiUsage.count += 1;
            apiUsage.lastUsedAt = new Date(); // Update last usage timestamp
        } else {
            // If no record exists, create a new entry for today
            apiUsage = new ApiUsageModel({
                userId,
                apiEndpoint,
                method,
                token,
                domain,
                count: 1,
                firstUsedAt: new Date(), // First API usage time
                lastUsedAt: new Date(),  // Last API usage time (same as first for now)
                ipAddress,
                date: new Date() // Date for tracking daily usage
            });
        }

        // Save the record to the database
        await apiUsage.save();
        next(); // Continue to the next middleware or route handler
    } catch (error) {
        console.error("Error tracking API usage:", error);
        next(); // Continue even if logging fails to ensure user experience isn't affected
    }
};

module.exports = trackApiUsage;
