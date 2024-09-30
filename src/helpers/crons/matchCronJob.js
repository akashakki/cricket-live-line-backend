const cron = require('node-cron');
const axios = require('axios');
const config = require('../../config/config');
const FormData = require('form-data');
const { MatchesModel, PlayerModel, VenuesModel, TeamsModel } = require('../../models');
const baseURL = 'https://apicricketchampion.in/apiv4/';
const token = 'deed03c60ab1c13b1dbef6453421ead6';

async function fetchMatchList() {
    try {
        const response = await axios.get(`${baseURL}homeList/${token}`); //'http://24.199.71.166:8700/v2/client/match-list'
        const matchList = response.data?.data;
        if (matchList && matchList?.length != 0) {
            // await fetchMatchDetails(matchList[0]?.match_id);
            for (let i = 0; i < matchList?.length; i++) {
                const match = matchList[i];
                // await MatchesModel.create(match);
                await fetchMatchDetails(match);
            }
        }
    } catch (error) {
        console.error('Error making API call:', error);
    }
}

async function fetchLiveMatchList() {
    try {
        const response = await axios.get(`${baseURL}liveMatchList/${token}`) //'http://24.199.71.166:8700/v2/client/match-live-list');
        const matchList = response.data?.data;
        if (matchList && matchList?.length != 0) {
            // await fetchMatchDetails(matchList[0]?.match_id);
            for (let i = 0; i < matchList?.length; i++) {
                const match = matchList[i];
                console.log("🚀 ~ file: matchCronJob.js:31 ~ fetchLiveMatchList ~ match:", match?.match_status)
                // await MatchesModel.create(match);
                await fetchMatchDetails(match);
            }
        }
    } catch (error) {
        console.error('Error making API call:', error);
    }
}

// async function fetchMatchDetails(match_id) {
//     console.log("🚀 ~ file: matchCronJob.js:30 ~ fetchMatchDetails ~ match_id:", match_id)
//     try {
//         const response = await axios.get('http://24.199.71.166:8700/v2/client/match-info/' + match_id);
//         console.log("🚀 ~ file: matchCronJob.js:33 ~ fetchMatchDetails ~ response:", response?.data?.data)
//         const matchDetails = response.data?.data;
//         if (matchDetails) {
//             console.log("🚀 ~ file: matchCronJob.js:36 ~ fetchMatchDetails ~ matchDetails.match_id:", match_id)
//             const matchData = await MatchesModel.findOne({ match_id: match_id, is_delete: 1 });
//             if (!matchData) {
//                 delete matchDetails.match_status;
//                 await MatchesModel.create(matchDetails);
//             }
//         }
//     } catch (error) {
//         console.error('Error making API call:', error);
//     }
// }
async function fetchMatchDetails(match) {
    console.log("🚀 ~ file: matchCronJob.js:30 ~ fetchMatchDetails ~ match_id:", match?.match_id);
    try {
        // const response = await axios.get(`${baseURL}matchInfo/${token}`) //'http://24.199.71.166:8700/v2/client/match-info/' + match_id);
        const formData = new FormData();
        formData.append('match_id', (match?.match_id).toString()); // Add match_id to formdata

        let config = {
            method: 'post',
            maxBodyLength: Infinity, // Allow large request bodies if needed
            url: `${baseURL}matchInfo/${token}`, // Your API endpoint
            headers: { 
              ...formData.getHeaders() // Ensure correct headers for FormData, including Content-Type
            },
            data: formData // Send the FormData object as the request body
          };

        const response = await axios.request(config);
        const matchData = response.data?.data;
        // matchDetails['match_id'] = match?.match_id;
          let matchDetails = {
            ...match,
            ...matchData
          }
          console.log("🚀 ~ file: matchCronJob.js:74 ~ fetchMatchDetails ~ matchDetails:", matchDetails)
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

            // Create or update match details
            // console.log("🚀 ~ file: matchCronJob.js:107 ~ fetchMatchDetails ~ matchDetails:", date_wise)
            // if (date_wise) {
            //     matchDetails['date_wise'] = date_wise;
            // }
            matchDetails['match_status'] = match?.match_status;
            await MatchesModel.findOneAndUpdate({ match_id: match?.match_id }, matchDetails, { upsert: true, new: true });
        }
    } catch (error) {
        console.error('Error making API call:', error);
    }
}



// if (config.env == "production") {// Schedule tasks to be run on the server.
    // cron.schedule('0 0 * * *', async () => {
    //     cron.schedule('* * * * *', async () => {
    //     console.log('Running a job at 00:00 at midnight');
    //     fetchMatchList()
    // });

    // // cron.schedule('0 */1 * * *', async () => {
    //     cron.schedule('* * * * *', async () => {
    //     console.log('Running a job at every hour');
    //     fetchLiveMatchList()
    // });

    fetchMatchList()
    fetchLiveMatchList()
// }