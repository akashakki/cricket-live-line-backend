const cron = require('node-cron');
const axios = require('axios');
const config = require('../../config/config');
const FormData = require('form-data');
const { NewsModel } = require('../../models');
const baseURL = 'https://apicricketchampion.in/apiv4/';
const token = 'deed03c60ab1c13b1dbef6453421ead6';
const heroAPIBaseURL = 'https://app.heroliveline.com/csadmin/api/'


async function fetchNewsList() {
    try {
            // Fetch the player list for the current page
            const response = await axios.get(`${baseURL}news/${token}`) //'http://24.199.71.166:8700/v2/client/match-live-list');
            const newsList = response.data?.data;

            if (newsList && newsList.length > 0) {
                // You can also process each player here if needed
                for (let news of newsList) {
                    await NewsModel.findOneAndUpdate({ news_id: news?.news_id }, news, { upsert: true });
                }
            }

        console.log("Total players fetched:", newsList.length);
        // return allPlayers; // Return the complete list of players
    } catch (error) {
        console.error('Error making API call 52:', error);
    }
}

console.log("🚀 ~ file: matchCronJob.js:165 ~ config.env:", config.env)
if (config.env == "production") {// Schedule tasks to be run on the server.
    cron.schedule('0 * * * *', async () => {
        console.log('News Cron Running a job every hours');
        fetchNewsList();
    });

    fetchNewsList()
    // fetchTrendingPlayersList();
}