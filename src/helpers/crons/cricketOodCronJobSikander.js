const cron = require('node-cron');
const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config/config');
const { Token, OodSeriesModel, MatchesRunnerModel, MatchesSessionModel, OddsMatchDetailsModel } = require('../../models'); // Import the token model
const API_BASE_URL = 'https://sikander777.com/api/v5';


// Function to fetch data and save it
async function fetchMatchDataAndSave(m_id, s_id) {
    try {
        let tokenDoc = await Token.findOne({ type: 'sikander' });
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
        // console.log("🚀 ~ file: cricketOodCronJob.js:81 ~ fetchMatchDataAndSave ~ matchData:", matchData?.MatchDetails?.match_id)
        await MatchesRunnerModel.findOneAndUpdate({ matchId: matchData?.MatchDetails?.match_id }, matchData, { upsert: true, new: true });
    } catch (error) {
        console.error('Error fetching or saving data:', error);
    }
}

async function fetchSessionDataAndSave(m_id) {
    try {
        let tokenDoc = await Token.findOne({ type: 'sikander' });
        let token = tokenDoc ? tokenDoc.token : null;
        const response = await axios.post(`${API_BASE_URL}/event-session`, { match_id: m_id }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const matchData = response.data?.data;
        // console.log("🚀 ~ file: cricketOodCronJob.js:81 ~ fetchSessionDataAndSave ~ m_id:", m_id)

        // Remove all existing records for the match_id
        await MatchesSessionModel.deleteMany({ match_id: m_id });

        for (const sessions of matchData) {
            sessions['match_id'] = m_id;
            await MatchesSessionModel.findOneAndUpdate({ match_id: m_id, SelectionId: sessions?.SelectionId }, sessions, { upsert: true, new: true });
        }
    } catch (error) {
        console.error('Error fetching or saving data:', error);
    }
}

async function fetchMatchScore(matchId) {
    // console.log("🚀 ~ file: cricketOodCronJob.js:128 ~ fetchMatchScore ~ matchId:", matchId)
    const url = `https://score.jeoad.com/api/v1/getScore?matchId=${matchId}`;

    try {
        const response = await axios.get(url);
        const data = response.data.data;
        // return response.data;
        // Remove all existing records for the match_id
        await OddsMatchDetailsModel.deleteMany({ match_id: matchId });
        let sessions = {};
        // for (const sessions of data) {
        if (data) {
            sessions['match_id'] = matchId;
            sessions['matchStats'] = data[0]
            sessions['matchSummary'] = data[1]
            sessions['matchDetails'] = data[2]
            await OddsMatchDetailsModel.findOneAndUpdate({ match_id: matchId }, sessions, { upsert: true, new: true });
        }
        fetchAndExtractIframeID(`https://winx777.com/score/sportRadar/?eventId=${matchId}`, matchId);
        // }
    } catch (error) {
        console.error("Error fetching match score:", error);
        throw error; // Re-throw the error for further handling if needed
    }
}

async function fetchInplayMatches() {
    const fetchInpaySeries = await OodSeriesModel.find({ matchType: 'Inplay', sport_id: 4, SportName: 'Cricket', matchFrom: 'sikander' });
    for (const element of fetchInpaySeries) {
        // console.log("🚀 ~ file: cricketOodCronJob.js:101 ~ cron.schedule ~ element:", element?.match_id, element?.sport_id)
        fetchMatchDataAndSave(element?.match_id, element?.sport_id)
        fetchSessionDataAndSave(element?.match_id);
        fetchMatchScore(element?.match_id);
    }
}


async function fetchUpcomingMatches() {
    const fetchInpaySeries = await OodSeriesModel.find({ matchType: 'Upcoming', sport_id: 4, SportName: 'Cricket', matchFrom: 'sikander' });
    for (const element of fetchInpaySeries) {
        // console.log("🚀 ~ file: cricketOodCronJob.js:101 ~ cron.schedule ~ element:", element?.match_id, element?.sport_id)
        fetchMatchDataAndSave(element?.match_id, element?.sport_id)
        fetchSessionDataAndSave(element?.match_id);
    }
}

async function fetchAndExtractIframeID(url, matchId) {
    try {
        // Fetch HTML content from the provided URL
        const response = await axios.get(url);
        const html = response.data;

        // Load HTML into cheerio
        const $ = cheerio.load(html);

        // Select the iframe element
        const iframeSrc = $('iframe').attr('src');

        if (iframeSrc) {
            // Extract the ID from the iframe's src attribute
            const urlParams = new URLSearchParams(iframeSrc.split('?')[1]);
            const id = urlParams.get('id');
            const aC = urlParams.get('aC');

            // console.log('Extracted ID:', id, aC);
            const score_widget_url = `https://www.satsports.net/score_widget/index.html?id=${id}&aC=${aC}`
            await OddsMatchDetailsModel.findOneAndUpdate({ match_id: matchId }, { score_widget_url: score_widget_url, scorecard_id: id }, { upsert: true, new: true });
            // return {id, aC};
        } else {
            console.log('No iframe found in the HTML.');
        }
    } catch (error) {
        console.error('Error fetching or parsing HTML:', error);
    }
}

// console.log("🚀 ~ file: cricketOodCronJob.js:136 ~ config.env:", config.env)
if (config.env == "production") {
    // Cron job to run every half second
    // cron.schedule('*/0.5 * * * * *', async ()=>{
    cron.schedule('* * * * * *', async () => {
        console.log('Running cron job...every second');
        fetchInplayMatches();
    });

    // Schedule the fetchUpcomingMatches function to run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        console.log('Running fetchUpcomingMatches job every 30 minutes...');
        await fetchUpcomingMatches();
    });
}