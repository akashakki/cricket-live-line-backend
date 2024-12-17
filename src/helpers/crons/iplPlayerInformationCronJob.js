const cron = require('node-cron');
const axios = require('axios');
const Cloudinary = require('../cloudinary');
const { IPLAuctionPlayerModel, PlayerModel } = require('../../models');

async function uploadImage(filePath, folderName) {
    try {
        // const filePath = 'path/to/your/image.jpg'; // Replace with your image file path
        const options = {
            folder: `crichamp/${folderName}`, // Optional: Specify a folder in Cloudinary
            use_filename: true, // Optional: Use the original file name
            unique_filename: false // Optional: Prevent Cloudinary from renaming the file
        };

        const response = await Cloudinary?.uploadImage(filePath, options);
        console.log('Uploaded image details:', response);
    } catch (error) {
        console.error('Upload failed:', error);
    }
}
//https://www.crictracker.com/_next/image/?url=https%3A%2F%2Fmedia.crictracker.com%2Fplayer%2Fhead%2F300x300%2Frasikh_salam_ebb74.png&w=120&q=75
// uploadImage('https://media.crictracker.com/team/thumbUrl/india-4_8cde.png', 'Team_Flag')

/**
 * Fetches and processes auction players from CricTracker
 */
async function syncAuctionPlayers() {
    try {
        // Prepare GraphQL request payload
        const requestData = {
            operationName: "ListAuctionPlayerFront",
            variables: {
                input: {
                    nLimit: 1000,
                    nSkip: 0,
                    sSearch: null,
                    sPlayingRole: null,
                    sSortBy: null,
                    nOrder: null,
                    eAuctionStatus: null,
                    iTeamId: null,
                    iCountryId: null,
                    iPrimaryTeam: null,
                    iSeriesId: "673707e03470097602540003"
                }
            },
            query: `query ListAuctionPlayerFront($input: oListAuctionPlayerInput!) {
                listAuctionPlayerFront(input: $input) {
                    nTotal
                    sMessage
                    aData {
                        _id
                        nBasePrice
                        nSoldPrice
                        bCappedPlayer
                        bOverseas
                        oTeam {
                            sAbbr
                            sTitle
                            oImg {
                                sUrl
                                sText
                                __typename
                            }
                            __typename
                        }
                        eAuctionStatus
                        oPrimaryTeam {
                            sTitle
                            sAbbr
                            oImg {
                                sUrl
                                sText
                                __typename
                            }
                            oJersey {
                                sUrl
                                sText
                                __typename
                            }
                            __typename
                        }
                        oPlayer {
                            sFullName
                            oImg {
                                sUrl
                                sText
                                __typename
                            }
                            __typename
                        }
                        oCountry {
                            sTitle
                            sAbbr
                            oImg {
                                sUrl
                                sText
                                __typename
                            }
                            __typename
                        }
                        sPlayingRole
                        __typename
                    }
                    __typename
                }
            }`
        };

        // Make the API request
        const response = await axios.post('https://gateway.crictracker.com/graphql', requestData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.data && response.data.data.listAuctionPlayerFront) {
            const players = response.data.data.listAuctionPlayerFront.aData;
            console.log("🚀 ~ file: iplPlayerInformationCronJob.js:106 ~ syncAuctionPlayers ~ players:", players[0]);

            if (players.length > 0) {
                for (const player of players) {
                    const existingPlayer = await IPLAuctionPlayerModel.findOne({ apiPlayerId: player?._id });
                    if (!existingPlayer) {
                        let uploadPrimaryTeamImage = '';
                        let uploadPrimaryTeamJerseyImage = '';
                        let uploadCountryImage = '';
                        let uploadIPLTeamImage = '';
                        let uploadPlayerImage = '';

                        // Upload images and handle failures
                        if(player?.oCountry?.oImg?.sUrl){
                            try {
                                uploadCountryImage = await uploadImage('https://media.crictracker.com/' + player?.oCountry?.oImg?.sUrl, 'Country_Flag');
                            } catch (err) {
                                console.error(`Error uploading country flag for player ${player?.oPlayer?.sFullName}`, err);
                                uploadCountryImage = ''; // Set blank if failed
                            }
                        }

                        if(player?.oTeam?.oImg?.sUrl){
                            try {
                                uploadIPLTeamImage = await uploadImage('https://media.crictracker.com/' + player?.oTeam?.oImg?.sUrl, 'IPL_Team_Flag');
                            } catch (err) {
                                console.error(`Error uploading IPL team flag for player ${player?.oPlayer?.sFullName}`, err);
                                uploadIPLTeamImage = ''; // Set blank if failed
                            }
                        }

                        if(player?.oPlayer && player?.oPlayer?.oImg && player?.oPlayer?.oImg?.sUrl){
                            try {
                                uploadPlayerImage = await uploadImage('https://media.crictracker.com/' + player?.oPlayer?.oImg?.sUrl, 'Players_Image');
                            } catch (err) {
                                console.error(`Error uploading player image for player ${player?.oPlayer?.sFullName}`, err);
                                uploadPlayerImage = ''; // Set blank if failed
                            }
                        }

                        if (player?.oPrimaryTeam && player?.oPrimaryTeam?.oImg && player?.oPrimaryTeam?.oImg?.sUrl) {
                            try {
                                uploadPrimaryTeamImage = await uploadImage('https://media.crictracker.com/' + player?.oPrimaryTeam?.oImg?.sUrl, 'Primary_Team_Image');
                            } catch (err) {
                                console.error(`Error uploading primary team image for player ${player?.oPlayer?.sFullName}`, err);
                                uploadPrimaryTeamImage = ''; // Set blank if failed
                            }
                        }

                        if (player?.oPrimaryTeam && player?.oPrimaryTeam?.oJersey) {
                            try {
                                uploadPrimaryTeamJerseyImage = await uploadImage('https://media.crictracker.com/' + player?.oPrimaryTeam?.oJersey?.sUrl, 'Team_Jersey_Image');
                            } catch (err) {
                                console.error(`Error uploading team jersey for player ${player?.oPlayer?.sFullName}`, err);
                                uploadPrimaryTeamJerseyImage = ''; // Set blank if failed
                            }
                        }

                        // Prepare data for database entry
                        const requestBody = {
                            basePrice: player?.nBasePrice,
                            soldPrice: player?.nSoldPrice,
                            isCappedPlayer: player?.bCappedPlayer,
                            isOverseas: player?.bOverseas,
                            iplTeamName: player?.oTeam?.sTitle,
                            iplTeamImage: uploadIPLTeamImage?.secure_url || '',
                            iplTeamName_short: player?.oTeam?.sAbbr,
                            auctionStatus: player?.eAuctionStatus == 's' ? 'Sold' : player?.eAuctionStatus == 'us' ? 'Unsold' : 'Retained',
                            primaryTeam: player?.oPrimaryTeam?.sTitle || '',
                            primaryTeamName_short: player?.oPrimaryTeam?.sAbbr || '',
                            primaryTeamFlag: uploadPrimaryTeamImage?.secure_url || '',
                            name: player?.oPlayer?.sFullName,
                            image: uploadPlayerImage?.secure_url || 'https://res.cloudinary.com/dlokrlj7n/image/upload/v1734414416/head-placeholder_ltzrxl.png',
                            teamJerseyImage: uploadPrimaryTeamJerseyImage?.secure_url || 'https://res.cloudinary.com/dlokrlj7n/image/upload/v1734377837/jersey-placeholder_vcvgy6.png',
                            countryName: player?.oCountry?.sTitle,
                            countryName_short: player?.oCountry?.sAbbr,
                            countryFlag: uploadCountryImage?.secure_url || '',
                            playingRole: player?.sPlayingRole,
                            apiPlayerId: player?._id,
                            apiResponse: JSON.stringify(player)
                        };

                        // Create database entry with or without image URLs
                        await IPLAuctionPlayerModel.create(requestBody);
                    }
                }
            }
            console.log(`Synced ${players.length} auction players successfully`);
        }
    } catch (error) {
        console.error('Error syncing auction players:', error);
    }
}

/**
 * Schedule the sync job to run every night at 2 AM
 */
function scheduleSyncJob() {
    // Cron job to run at 2:00 AM every day
    cron.schedule('0 2 * * *', () => {
        console.log('Starting nightly auction players sync...');
        syncAuctionPlayers();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Adjust timezone as needed
    });
}

syncAuctionPlayers();

// Export the scheduling function to be called when the application starts
module.exports = {
    scheduleSyncJob,
    syncAuctionPlayers
};