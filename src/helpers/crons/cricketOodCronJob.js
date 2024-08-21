const cron = require('node-cron');
const axios = require('axios');
const { Token, OodSeriesModel, MatchesRunnerModel, MatchesSessionModel } = require('../../models'); // Import the token model
const API_BASE_URL = 'https://bigbetexchange.com/api/v5';

async function login() {
    // Fetch new token
    const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
        user_name: 'rahulkumar',
        password: 'Docomo@123'
    });

    // Save new token to DB
    const newToken = loginResponse.data?.data?.token;
    console.log("🚀 ~ file: cricketOodCronJob.js:32 ~ login ~ newToken:", newToken)
    if (newToken) {
        await Token.findOneAndUpdate({ type: 'bigbetexchange' }, { token: newToken }, { upsert: true });
    }
    return newToken;
}

async function fetchDataWithToken() {
    try {
        const requestBody = { "limit": 50, "pageno": 1, "sport_id": 4, "series_id": 0, "type": "home" }
        console.log("🚀 ~ file: cricketOodCronJob.js:25 ~ fetchDataWithToken ~ requestBody:", requestBody)
        // Get the stored token from the database
        let tokenDoc = await Token.findOne({ type: 'bigbetexchange' });
        let token = tokenDoc ? tokenDoc.token : null;

        // Make the API request
        let response = await axios.post(`${API_BASE_URL}/event-game`, requestBody, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // Check if token is invalid
        if (response.data.message === 'Send valid token!') {
            console.log('Invalid token. Fetching a new one...');
            const newToken = await login();
            console.log("🚀 ~ file: cricketOodCronJob.js:39 ~ fetchDataWithToken ~ newToken:", newToken)
            // Retry the API call with the new token
            response = await axios.post(`${API_BASE_URL}/event-game`, requestBody, {
                headers: {
                    Authorization: `Bearer ${newToken}`
                }
            });
        }

        // Process the data from the API response
        console.log('Data fetched:', response.data?.data);
        for (const InplayMatches of response?.data?.data?.InplayMatches) {
            InplayMatches.matchType = 'Inplay';
            await OodSeriesModel.findOneAndUpdate({ series_id: InplayMatches?.series_id, market_id: InplayMatches?.market_id }, InplayMatches, { upsert: true, new: true });
        }

        for (const UpCommingMatches of response?.data?.data?.UpCommingMatches) {
            UpCommingMatches.matchType = 'Upcoming';
            await OodSeriesModel.findOneAndUpdate({ series_id: UpCommingMatches?.series_id, market_id: UpCommingMatches?.market_id }, UpCommingMatches, { upsert: true, new: true });
        }

    } catch (error) {
        console.error('Error during the API call:', error.message);
    }
}

// Function to fetch data and save it
async function fetchMatchDataAndSave(m_id, s_id) {
    try {
        let tokenDoc = await Token.findOne({ type: 'bigbetexchange' });
        let token = tokenDoc ? tokenDoc.token : null;
        const response = await axios.post(`${API_BASE_URL}/event-detals`, {
            match_id: m_id, // Replace with actual match_id
            sport_id: s_id  // Replace with actual sport_id
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const matchData = response.data?.data;
        console.log("🚀 ~ file: cricketOodCronJob.js:81 ~ fetchMatchDataAndSave ~ matchData:", matchData?.MatchDetails?.match_id)
        await MatchesRunnerModel.findOneAndUpdate({ matchId: matchData?.MatchDetails?.match_id }, matchData, { upsert: true, new: true });
    } catch (error) {
        console.error('Error fetching or saving data:', error);
    }
}

async function fetchSessionDataAndSave(m_id) {
    try {
        let tokenDoc = await Token.findOne({ type: 'bigbetexchange' });
        let token = tokenDoc ? tokenDoc.token : null;
        const response = await axios.post(`${API_BASE_URL}/event-session`, { match_id: m_id }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const matchData = response.data?.data;
        console.log("🚀 ~ file: cricketOodCronJob.js:81 ~ fetchSessionDataAndSave ~ m_id:", m_id)
        for (const sessions of matchData) {
            sessions['match_id'] = m_id;
            await MatchesSessionModel.findOneAndUpdate({ match_id: m_id, SelectionId:sessions?.SelectionId }, sessions, { upsert: true, new: true });
        }
    } catch (error) {
        console.error('Error fetching or saving data:', error);
    }
}

async function fetchMatches(){
    const fetchInpaySeries = await OodSeriesModel.find({});
    // console.log("🚀 ~ file: cricketOodCronJob.js:98 ~ cron.schedule ~ fetchInpaySeries:", fetchInpaySeries)
    for (const element of fetchInpaySeries) {
        console.log("🚀 ~ file: cricketOodCronJob.js:101 ~ cron.schedule ~ element:", element?.match_id, element?.sport_id)
        fetchMatchDataAndSave(element?.match_id, element?.sport_id)
        fetchSessionDataAndSave(element?.match_id);
    }
}

// Schedule the cron job to run every 2 hours
cron.schedule('0 */2 * * *', () => {
    console.log('Running cron job...');
    fetchDataWithToken();
});

// Cron job to run every half second
cron.schedule('*/0.5 * * * * *', async ()=>{
// cron.schedule('* * * * * *', async ()=>{
    console.log('Running cron job...every half second');
    fetchMatches();
});

// Run once on start
// fetchDataWithToken();
// fetchSessionDataAndSave("33469872")
setTimeout(() => {
    fetchDataWithToken();
}, 10000);
