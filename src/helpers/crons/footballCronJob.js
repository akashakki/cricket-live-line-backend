const cron = require('node-cron');
const axios = require('axios');
const config = require('../../config/config');
const { Token, OodSeriesModel, FootballModel, MatchesSessionModel } = require('../../models'); // Import the token model
//https://api.winkart365.com/api/public/exchange/odds/eventType/1 - Match List
//https://api.winkart365.com/api/public/exchange/odds/sma-event/1/47535827 - Get Football Match Details
//https://api.winkart365.com/api/public/match-center/stats/1/47535827 - Get Match Stats
//
const API_BASE_URL = 'https://api.winkart365.com/api/public';

async function fetchEventGames() {
    try {
        const response = await axios.get(`${API_BASE_URL}/exchange/odds/eventType/1`);

        const matchData = response.data?.result;
        for (const sessions of matchData) {
            console.log("🚀 ~ file: footballCronJob.js:23 ~ fetchEventGames ~ sessions:", sessions)
            let runner_json = []

            for (const runner of sessions?.runners) {
                runner_json.push({
                    selectionId: runner?.id,
                    handicap: runner?.hdp,
                    status: runner?.status,
                    lastPriceTraded: runner?.lastPriceTraded,
                    totalMatched: runner?.totalMatched,
                    adjustmentFactor: runner?.adjustmentFactor,
                    ex: {
                        availableToBack: runner?.back,
                        availableToLay: runner?.lay
                    }
                })
            }

            const obj = {
                sport_id: 3,
                SportName: 'Football',
                InplayStatus: sessions?.inPlay ? 'Inplay' : 'Upcoming',
                matchType: sessions?.inPlay ? 'Inplay' : 'Upcoming',
                seriesName: sessions?.competition?.name,
                match_id: sessions?.event?.id,
                name: sessions?.event?.name,
                runner_json: runner_json,
                start_date: sessions?.start,
                IsFancyAllow: sessions?.isFancy,
                IsBetAllow: sessions?.isBettable,
                numWinners: sessions?.numWinners,
                isBookmaker: sessions?.isBookmaker,
                numActiveRunners: sessions?.numActiveRunners,
            }
            await OodSeriesModel.findOneAndUpdate({ match_id: obj?.match_id }, obj, { upsert: true, new: true });
        }
    } catch (error) {
        console.error('Error fetching or saving data:', error);
    }
}

// Function to fetch data and save it
async function fetchMatchDataAndSave(m_id) {
    try {
        const response = await axios.post(`${API_BASE_URL}/exchange/odds/sma-event/1/${m_id}`);

        const matchData = response.data?.result;
        console.log("🚀 ~ file: cricketOodCronJob.js:81 ~ fetchMatchDataAndSave ~ matchData:", matchData)
        // await FootballModel.findOneAndUpdate({ matchId: matchData?.MatchDetails?.match_id }, matchData, { upsert: true, new: true });
    } catch (error) {
        console.error('Error fetching or saving data:', error);
    }
}

async function fetchInplayMatches() {
    const fetchInpaySeries = await OodSeriesModel.find({ matchType: 'Inplay' });
    for (const element of fetchInpaySeries) {
        console.log("🚀 ~ file: cricketOodCronJob.js:101 ~ cron.schedule ~ element:", element?.match_id, element?.sport_id)
        fetchMatchDataAndSave(element?.match_id)
        // fetchSessionDataAndSave(element?.match_id);
    }
}

async function fetchUpcomingMatches() {
    const fetchInpaySeries = await OodSeriesModel.find({ matchType: 'Upcoming' });
    for (const element of fetchInpaySeries) {
        console.log("🚀 ~ file: cricketOodCronJob.js:101 ~ cron.schedule ~ element:", element?.match_id, element?.sport_id)
        fetchMatchDataAndSave(element?.match_id)
        // fetchSessionDataAndSave(element?.match_id);
    }
}


// if (config.env == "production") {
//     // Schedule the cron job to run every 2 hours
//     cron.schedule('0 */2 * * *', () => {
//         console.log('Running cron job...');
//         fetchDataWithToken();
//     });

//     // Cron job to run every half second
//     // cron.schedule('*/0.5 * * * * *', async ()=>{
//     cron.schedule('* * * * * *', async () => {
//         console.log('Running cron job...every second');
//         fetchInplayMatches();
//     });

//     // Schedule the fetchUpcomingMatches function to run every 30 minutes
//     cron.schedule('*/30 * * * *', async () => {
//         console.log('Running fetchUpcomingMatches job every 30 minutes...');
//         await fetchUpcomingMatches();
//     });
// }