const cron = require('node-cron');
const config = require('../../config/config');
const { PlayerModel } = require('../../models');
const { GlobalService } = require('../../services');


async function fetchPlayerList() {
    let currentPage = 1; // Start from the first page
    let lastPage = 1; // Initialize last page variable

    try {
        do {
            // Fetch the player list for the current page
            const response = await GlobalService.globalFunctionFetchDataFromHeroGETMethod(
                `web/playersList?page=${currentPage}`
            );

            const playerList = response?.playerData?.data;
            lastPage = response?.playerData?.last_page || 1; // Get the last page number

            if (playerList && playerList.length > 0) {
                for (let player of playerList) {
                    if (!player?.player_player_api_id) {
                        console.warn('Skipping player due to missing player_id:', player);
                        continue; // Skip invalid players
                    }

                    const updatedObj = {
                        player_id: player?.player_player_api_id,
                        hero_player_id: player?.player_id,
                        name: player?.player_title,
                        image: player?.player_logo_url,
                        player_team_flag: player?.player_team_flag,
                        player_team_name_short: player?.player_team_name_short,
                        player_team_name: player?.player_team_name,
                        play_role: player?.player_play_role,
                    };

                    try {
                        // Update or insert player in the database
                        await PlayerModel.findOneAndUpdate(
                            { player_id: player.player_player_api_id },
                            updatedObj,
                            { upsert: true, new: true }
                        );
                        // Fetch additional details for the player
                        await fetchPlayerDetailsByPlayerId(player.player_player_api_id);
                    } catch (error) {
                        if (error.code === 11000) {
                            console.error('Duplicate entry detected for player_id:', player.player_player_api_id);
                        } else {
                            console.error('Error updating player:', error);
                        }
                    }
                }
            }

            currentPage++; // Increment to the next page
        } while (currentPage <= lastPage); // Continue until all pages are fetched

        console.log('Player list fetching completed.');
    } catch (error) {
        console.error('Error fetching player list:', error);
    }
}

async function fetchTrendingPlayersList() {
    try {
        const response = await GlobalService.globalFunctionFetchDataFromHeroGETMethod(`web/trendingPlayers/all`);
        const playerList = response?.playerData;

        if (playerList && playerList.length > 0) {
            for (let player of playerList) {
                if (!player?.player_player_api_id) {
                    console.warn('Skipping player due to missing player_id:', player);
                    continue; // Skip invalid players
                }

                player['isTrending'] = true;

                try {
                    await PlayerModel.findOneAndUpdate(
                        { player_id: player.player_player_api_id },
                        player,
                        { upsert: true, new: true }
                    );
                } catch (error) {
                    if (error.code === 11000) {
                        console.error('Duplicate entry detected for player_id:', player.player_player_api_id);
                    } else {
                        console.error('Error updating trending player:', error);
                    }
                }
            }
        }

        console.log('Trending players list fetching completed.');
    } catch (error) {
        console.error('Error fetching trending players list:', error);
    }
}

async function fetchPlayerDetailsByPlayerId(player_id) {
    console.log("🚀 ~ file: playerCronJob.js:104 ~ fetchPlayerDetailsByPlayerId ~ player_id:", player_id)
    if (!player_id) {
        console.error('Invalid player_id provided:', player_id);
        return;
    }

    try {
        const playerData = await GlobalService.globalFunctionFetchDataFromAPI(
            'player_id',
            player_id.toString(),
            'playerInfo',
            'post'
        );

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
                bowling_career: playerData?.bowling_career,
            };

            await PlayerModel.findOneAndUpdate(
                { player_id: player_id },
                updatedObj,
                { upsert: true, new: true }
            );
        }
    } catch (error) {
        if (error.code === 11000) {
            console.error('Duplicate entry detected for player_id:', player_id);
        } else {
            console.error('Error fetching player details:', error);
        }
    }
}

// fetchPlayerDetailsByPlayerId(4958)


// console.log("🚀 ~ file: matchCronJob.js:165 ~ config.env:", config.env)
if (config.env == "production") {// Schedule tasks to be run on the server.
    cron.schedule('0 0 * * *', async () => {
        console.log('Running a job at 00:00 at midnight');
        await fetchPlayerList();
        await fetchTrendingPlayersList();
    });

    (async () => {
        await fetchPlayerList();
        await fetchTrendingPlayersList();
    })();
}
// (async () => {
//     await fetchPlayerList();
//     await fetchTrendingPlayersList();
// })();