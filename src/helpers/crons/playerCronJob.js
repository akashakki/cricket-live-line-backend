const cron = require('node-cron');
const config = require('../../config/config');
const { PlayerModel } = require('../../models');
const { GlobalService } = require('../../services');


async function fetchPlayerList() {
    let allPlayers = []; // Array to store all players
    let currentPage = 1; // Start from the first page
    let lastPage = 1; // Initialize last page variable

    try {
        do {
            // Fetch the player list for the current page
            const response = await GlobalService.globalFunctionFetchDataFromHeroGETMethod(`web/playersList?page=${currentPage}`)

            const playerList = response?.playerData?.data;
            lastPage = response.data?.playerData?.last_page; // Get the last page number from the response

            // console.log("🚀 ~ file: playerCronJob.js:14 ~ fetchPlayerList ~ playerList:", playerList);

            if (playerList && playerList.length > 0) {
                allPlayers = allPlayers.concat(playerList); // Add fetched players to allPlayers array

                // You can also process each player here if needed
                for (let player of playerList) {
                    const updatedObj = {
                        player_id: player?.player_player_api_id,
                        hero_player_id: player?.player_id,
                        name: player?.player_title,
                        image: player?.player_logo_url,
                        player_team_flag: player?.player_team_flag,
                        player_team_name_short: player?.player_team_name_short,
                        player_team_name: player?.player_team_name,
                        play_role: player?.player_play_role,
                    }
                    await PlayerModel.findOneAndUpdate({ player_id: player.player_player_api_id }, updatedObj, { upsert: true });
                    await fetchPlayerDetailsByPlayerId(player.player_player_api_id);
                }
            }

            currentPage++; // Increment to the next page
        } while (currentPage <= lastPage); // Continue until all pages are fetched

        console.log("Total players fetched:", allPlayers.length);
        // return allPlayers; // Return the complete list of players
    } catch (error) {
        console.error('Error making API call 52:', error);
    }
}


async function fetchTrendingPlayersList() {
    try {
        const response = await GlobalService.globalFunctionFetchDataFromHeroGETMethod(`web/trendingPlayers/all`)

        const playerList = response?.playerData;
        // console.log("🚀 ~ file: playerCronJob.js:14 ~ fetchPlayerList ~ playerList:", playerList)
        if (playerList && playerList?.length != 0) {
            // await fetchMatchDetails(playerList[0]?.match_id);
            for (let i = 0; i < playerList?.length; i++) {
                const player = playerList[i];
                const updatedObj = {
                    isTrending: true
                }
                await PlayerModel.findOneAndUpdate({ player_id: player.player_player_api_id }, updatedObj, { upsert: true });
            }
        }
    } catch (error) {
        console.error('Error making API call:', error);
    }
}



async function fetchPlayerDetailsByPlayerId(player_id) {
    console.log("🚀 ~ file: playerCronJob.js:75 ~ fetchPlayerDetailsByPlayerId ~ player_id:", player_id)
    try {
        const playerData = await GlobalService.globalFunctionFetchDataFromAPI('player_id', (player_id).toString(), 'playerInfo', 'post');

        // console.log("🚀 ~ file: playerCronJob.js:92 ~ fetchPlayerDetailsByPlayerId ~ playerData:", playerData)
        
        if (playerData) {
            const updatedObj = {
                player_id: playerData?.player?.player_id,
                name: playerData?.player?.name,
                image: playerData?.player?.image,
                style_bating: playerData?.player?.style_bating,
                style_bowling: playerData?.player?.style_bowling,
                born: playerData?.player?.born,
                height: playerData?.player?.height,
                teams: playerData?.player?.teams,
                birth_place: playerData?.player?.birth_place,
                description: playerData?.player?.description,
                batting_career: playerData?.batting_career,
                bowling_career: playerData?.bowling_career
            }
            await PlayerModel.findOneAndUpdate({ player_id: player_id }, updatedObj, { upsert: true, new: true });
        }
    } catch (error) {
        console.error('Error making API call 113:', error);
    }
}

// fetchPlayerDetailsByPlayerId(4958)


console.log("🚀 ~ file: matchCronJob.js:165 ~ config.env:", config.env)
if (config.env == "production") {// Schedule tasks to be run on the server.
    cron.schedule('0 0 * * *', async () => {
        console.log('Running a job at 00:00 at midnight');
        fetchPlayerList();
        fetchTrendingPlayersList();
    });

    fetchPlayerList()
    fetchTrendingPlayersList();
}