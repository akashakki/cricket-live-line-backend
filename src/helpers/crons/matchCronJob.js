const cron = require('node-cron');
const axios = require('axios');
const config = require('../../config/config');
const { MatchesModel, PlayerModel, VenuesModel, TeamsModel } = require('../../models');
const { GlobalService } = require('../../services');

async function fetchMatchList() {
    try {
        // const response = await axios.get(`${baseURL}homeList/${token}`); //'http://24.199.71.166:8700/v2/client/match-list'
        const matchList = await GlobalService.globalFunctionFetchDataFromAPIGETMethod('homeList');
        // const matchList = response.data?.data;
        if (matchList && matchList?.length != 0) {
            // await fetchMatchDetails(matchList[0]?.match_id);
            for (let i = 0; i < matchList?.length; i++) {
                const match = matchList[i];
                // await MatchesModel.create(match);
                await fetchMatchDetails(match);
                await fetchMatchScorecard(match);
                await fetchMatchSquadsByMatchId(match);
            }
        }
    } catch (error) {
        console.error('Error making API call:', error);
    }
}

async function fetchLiveMatchList() {
    try {
        // const response = await axios.get(`${baseURL}liveMatchList/${token}`) //'http://24.199.71.166:8700/v2/client/match-live-list');
        const matchList = await GlobalService.globalFunctionFetchDataFromAPIGETMethod('liveMatchList'); //response.data?.data;
        if (matchList && matchList?.length != 0) {
            // await fetchMatchDetails(matchList[0]?.match_id);
            for (let i = 0; i < matchList?.length; i++) {
                const match = matchList[i];
                console.log("🚀 ~ file: matchCronJob.js:31 ~ fetchLiveMatchList ~ match:", match?.match_status)
                // await MatchesModel.create(match);
                await fetchMatchDetails(match);
                await fetchMatchScorecard(match);
                await fetchMatchSquadsByMatchId(match);
            }
        }
    } catch (error) {
        console.error('Error making API call:', error);
    }
}

// async function fetchMatchDetailsFromHero() {
//     // console.log("🚀 ~ file: matchCronJob.js:63 ~ fetchMatchDetailsFromHero ~ match:", match?.match_id)
//     try {
//         let config = {
//             method: 'post',
//             maxBodyLength: Infinity, // Allow large request bodies if needed
//             // url: `${heroAPIBaseURL}web/getmatchlisting/`, // Your API endpoint
//             url: `${heroAPIBaseURL}cron/matchLiveBulkInfo`, // Your API endpoint
//             data: { "match_ids": [6157] } //{ "match_status": "All" } // Send the FormData object as the request body
//         };

//         const response = await axios.request(config);
//         console.log("🚀 ~ file: matchCronJob.js:75 ~ fetchMatchDetailsFromHero ~ response:", JSON.stringify(response?.data?.bulk_matches))
//         // const matchData = response.data?.data;

//     } catch (error) {
//         console.error('Error making API call:', error);
//     }
// }
// fetchMatchDetailsFromHero()

async function fetchMatchDetails(match) {
    console.log("🚀 ~ file: matchCronJob.js:30 ~ fetchMatchDetails ~ match_id:", match?.match_id);
    try {
        const matchData = await GlobalService.globalFunctionFetchDataFromAPI('match_id', (match?.match_id).toString(), 'matchInfo', 'post'); //response.data?.data;
        let matchDetails = {
            ...match,
            ...matchData
        }
        console.log("🚀 ~ file: matchCronJob.js:74 ~ fetchMatchDetails ~ matchDetails:", matchDetails?.match_id)
        if (matchDetails) {
            // Remove match_status if it exists
            delete matchDetails.match_status;

            // Save venue details
            const venueDetails = {
                venue_id: matchDetails.venue_id,
                venue: matchDetails.venue,
                place: matchDetails.place,
                pace_spin: matchDetails.pace_spin,
                ...matchDetails.venue_weather
            };
            await VenuesModel.findOneAndUpdate({ venue_id: matchDetails.venue_id }, venueDetails, { upsert: true });

            // Save team details
            const teamADetails = {
                team_id: matchDetails.team_a_id,
                team_name: matchDetails.team_a,
                team_short: matchDetails.team_a_short,
                team_img: matchDetails.team_a_img,
            };
            const teamBDetails = {
                team_id: matchDetails.team_b_id,
                team_name: matchDetails.team_b,
                team_short: matchDetails.team_b_short,
                team_img: matchDetails.team_b_img,
            };
            await TeamsModel.findOneAndUpdate({ team_id: matchDetails.team_a_id }, teamADetails, { upsert: true });
            await TeamsModel.findOneAndUpdate({ team_id: matchDetails.team_b_id }, teamBDetails, { upsert: true });

            // Save player details
            const players = [
                ...(matchDetails.squad?.team_a?.player || []),
                ...(matchDetails.squad?.team_b?.player || [])
            ];

            for (const player of players) {
                await PlayerModel.findOneAndUpdate({ player_id: player.player_id }, player, { upsert: true });
            }

            matchDetails['match_status'] = match?.match_status;
            matchDetails['date_time'] = match?.match_status;
            await MatchesModel.findOneAndUpdate({ match_id: match?.match_id }, matchDetails, { upsert: true, new: true });
        }
    } catch (error) {
        console.error('Error making API call:', error);
    }
}

async function fetchMatchScorecard(match) {
    console.log("🚀 ~ file: matchCronJob.js:164 ~ fetchMatchScorecard ~ match:", match?.match_id)
    try {

        const matchData = await GlobalService.globalFunctionFetchDataFromAPI('match_id', (match?.match_id).toString(), 'scorecardByMatchId', 'post'); //response.data?.data;
        // matchDetails['match_id'] = match?.match_id;
        let matchDetails = {
            ...match,
            ...matchData
        }
        if (matchDetails) {
            await MatchesModel.findOneAndUpdate({ match_id: match?.match_id }, matchDetails, { upsert: true, new: true });
        }
    } catch (error) {
        console.error('Error making API call:', error);
    }
}

async function fetchMatchSquadsByMatchId(match) {
    try {
        // const response = await axios.request(config);
        const response = await GlobalService.globalFunctionFetchDataFromAPI('match_id', (match?.match_id).toString(), 'squadsByMatchId', 'post');
        // const matchData = response.data?.data;
        let squad = {
            team_a: response?.team_a,
            team_b: response?.team_b
        }

        if (squad) {
            await MatchesModel.findOneAndUpdate({ match_id: match?.match_id }, { $set: { squad: squad } }, { upsert: true, new: true });
        }
    } catch (error) {
        console.error('Error making API call:', error);
    }
}

async function fetchUpcomingMatches() {
    try {
        const matchList = await GlobalService.globalFunctionFetchDataFromAPIGETMethod('upcomingMatches'); //response.data?.data;
        console.log("🚀 ~ file: matchCronJob.js:169 ~ fetchUpcomingMatches ~ matchList:", matchList)
        if (matchList && matchList?.length != 0) {
            await fetchMatchDetails(matchList[0]?.match_id);
            for (let i = 0; i < matchList?.length; i++) {
                const match = matchList[i];
                console.log("🚀 ~ file: matchCronJob.js:31 ~ fetchLiveMatchList ~ match:", match?.match_status)
                // await MatchesModel.create(match);
                await fetchMatchDetails(match);
                await fetchMatchScorecard(match);
                await fetchMatchSquadsByMatchId(match);
            }
        }
    } catch (error) {
        console.log("🚀 ~ file: matchCronJob.js:170 ~ fetchUpcomingMatches ~ error:", error)
    }
}


console.log("🚀 ~ file: matchCronJob.js:165 ~ config.env:", config.env)
if (config.env == "production") {// Schedule tasks to be run on the server.
    // cron.schedule('0 0 * * *', async () => {
    // cron.schedule('* * * * *', async () => {
    //     console.log('Match Running a job every mint');
    //     fetchMatchList()
    //     // setInterval(fetchMatchList(), 500);
    // });

    // // cron.schedule('0 */1 * * *', async () => {
    // cron.schedule('* * * * *', async () => {
    //     console.log('Running a job at every hour');
    //     // fetchLiveMatchList()
    //     setInterval(fetchLiveMatchList(), 500);
    // });

    // Runs fetchMatchList every second
    setInterval(() => {
        console.log('Match Running a job every second');
        fetchMatchList();
    }, 10000); // 1000 milliseconds = 1 second

    // Runs fetchLiveMatchList every second
    setInterval(() => {
        console.log('Running fetchLiveMatchList every second');
        fetchLiveMatchList();
    }, 10000); // 1000 milliseconds = 1 second

    // Schedule task to run every 30 minutes
    cron.schedule('*/30 * * * *', () => {
        console.log('Fetching upcoming matches...');
        fetchUpcomingMatches();
    });

    // Schedule task to run every 10 minutes
    cron.schedule('*/10 * * * *', () => {
        console.log('Fetching upcoming matches...');
        fetchLiveAndFinishMatchesFromDB();
    });

    fetchMatchList();
    fetchLiveMatchList();
}

// fetchUpcomingMatches();
// fetchMatchList()
// fetchLiveMatchList()