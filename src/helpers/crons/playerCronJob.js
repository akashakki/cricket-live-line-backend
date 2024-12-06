const cron = require('node-cron');
const config = require('../../config/config');
const { PlayerModel } = require('../../models');
const { GlobalService } = require('../../services');


/**
 * Fetch and sync player list from the API
 * This function handles pagination and updates players in the database
 */
async function fetchPlayerList() {
    let currentPage = 1;
    let processedPlayerIds = new Set();

    try {
        while (true) {
            // Fetch the player list for the current page
            const response = await GlobalService.globalFunctionFetchDataFromHeroGETMethod(
                `web/playersList?page=${currentPage}`
            );

            const playerList = response?.playerData?.data || [];
            const lastPage = response?.playerData?.last_page || 1;

            // If no players, break the loop
            if (playerList.length === 0) {
                break;
            }

            // Process players in batches to avoid overwhelming the database
            const playerBulkOps = [];

            for (const player of playerList) {
                // Validate player data
                if (!player?.player_player_api_id) {
                    console.warn('Skipping player due to missing player_id:', player);
                    continue;
                }

                const playerId = player.player_player_api_id.toString();

                // Skip if player already processed in this batch
                if (processedPlayerIds.has(playerId)) {
                    continue;
                }
                processedPlayerIds.add(playerId);

                // Prepare update object
                const updatedObj = {
                    player_id: playerId,
                    hero_player_id: player.player_id,
                    name: player.player_title,
                    image: player.player_logo_url,
                    player_team_flag: player.player_team_flag,
                    player_team_name_short: player.player_team_name_short,
                    player_team_name: player.player_team_name,
                    play_role: player.player_play_role,
                };

                // Add to bulk operations
                playerBulkOps.push({
                    updateOne: {
                        filter: { player_id: playerId },
                        update: { $set: updatedObj },
                        upsert: true
                    }
                });

                // Fetch additional player details
                try {
                    await fetchPlayerDetailsByPlayerId(player.player_player_api_id);
                } catch (detailError) {
                    console.error(`Error fetching details for player ${playerId}:`, detailError);
                }
            }

            // Perform bulk write to optimize database operations
            if (playerBulkOps.length > 0) {
                try {
                    await PlayerModel.bulkWrite(playerBulkOps);
                } catch (bulkWriteError) {
                    console.error('Bulk write error:', bulkWriteError);
                }
            }

            // Move to next page
            currentPage++;

            // Break if all pages processed
            if (currentPage > lastPage) {
                break;
            }
        }

        console.log('Player list fetching and syncing completed.');
    } catch (error) {
        console.error('Error in fetchPlayerList:', error);
    }
}

/**
 * Fetch detailed player information and update database
 * @param {string|number} player_id - Player's unique identifier
 */
async function fetchPlayerDetailsByPlayerId(player_id) {
    // Validate player ID
    if (!player_id) {
        console.warn('Invalid player_id provided:', player_id);
        return;
    }

    try {
        // Fetch player data from different endpoints
        const playerData = await GlobalService.globalFunctionFetchDataFromAPI(
            'player_id',
            player_id.toString(),
            'playerInfo',
            'post'
        );

        const response = await GlobalService.globalFunctionFetchDataFromHeroPostMethod(
            { "player_api_id": player_id },
            'web/playersDetail/',
            'post'
        );

        const playersDetail = response?.playersDetail;
        console.log("🚀 ~ file: playerCronJob.js:128 ~ fetchPlayerDetailsByPlayerId ~ playersDetail:",player_id, playersDetail?.player_gender)

        // Only proceed if player data exists
        if (!playerData?.player) {
            console.warn(`No player data found for ID: ${player_id}`);
            return;
        }

        // Prepare detailed player information
        const updatedObj = {
            player_id: playerData.player.player_id?.toString(),
            name: playerData.player.name,
            image: playerData.player.image,
            style_bating: playerData.player.style_bating,
            style_bowling: playerData.player.style_bowling,
            born: playerData.player.born,
            height: playerData.player.height,
            teams: playerData.player.teams,
            birth_place: playerData.player.birth_place,
            description: playerData.player.description,
            batting_career: playerData.batting_career,
            bowling_career: playerData.bowling_career,
            player_team_flag: playersDetail?.player_team_flag,
            gender: playersDetail?.player_gender,
            isTrending: playersDetail?.trending_player_status === 0 ? false : true
        };

        // Update or insert player details
        await PlayerModel.findOneAndUpdate(
            { player_id: player_id?.toString() },
            { $set: updatedObj },
            {
                upsert: true,
                new: true,
                runValidators: true // Ensures validation runs on update
            }
        );

    } catch (error) {
        // Detailed error logging
        console.error(`Comprehensive error fetching player details for ID ${player_id}:`, {
            message: error.message,
            name: error.name,
            code: error.code,
            stack: error.stack
        });
    }
}

// console.log("🚀 ~ file: matchCronJob.js:165 ~ config.env:", config.env)
if (config.env == "production") {// Schedule tasks to be run on the server.
    cron.schedule('0 0 * * *', async () => {
        console.log('Running a job at 00:00 at midnight');
        await fetchPlayerList();
    });

    (async () => {
        await fetchPlayerList();
    })();
}

async function removeDuplicatePlayers() {
    const duplicates = await PlayerModel.aggregate([
        {
            $group: {
                _id: "$player_id",
                count: { $sum: 1 },
                docs: { $push: "$_id" }, // Collect all document IDs for each player_id
            }
        },
        {
            $match: {
                count: { $gt: 1 } // Only groups with duplicates
            }
        }
    ]);

    for (const duplicate of duplicates) {
        const [keep, ...remove] = duplicate.docs; // Keep the first document, remove the rest
        await PlayerModel.deleteMany({ _id: { $in: remove } }); // Delete duplicate documents
    }

    console.log("Duplicate players removed successfully.");
}

removeDuplicatePlayers();

(async () => {
    await fetchPlayerList();
})();