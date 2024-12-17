//https://www.crictracker.com/_next/data/g2XS67JPUUk2arjd9gpx6/en/ipl-auction/teams.json?slug=ipl-auction&slug=teams
const cron = require('node-cron');
const axios = require('axios');
const Cloudinary = require('../cloudinary');
const { IPLTeamsModel } = require('../../models');


async function uploadImage(filePath, folderName) {
    try {
        // const filePath = 'path/to/your/image.jpg'; // Replace with your image file path
        const options = {
            folder: `crichamp/${folderName}`, // Optional: Specify a folder in Cloudinary
            use_filename: true, // Optional: Use the original file name
            unique_filename: false // Optional: Prevent Cloudinary from renaming the file
        };

        const response = await Cloudinary?.uploadImage(filePath, options);
        console.log('Uploaded image details:', response?.secure_url);
        return response?.secure_url;
    } catch (error) {
        console.error('Upload failed:', error);
    }
}

async function syncIPLTeams() {
    try {
        const response = await axios.get('https://www.crictracker.com/_next/data/g2XS67JPUUk2arjd9gpx6/en/ipl-auction/teams.json?slug=ipl-auction&slug=teamsl', {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // console.log("🚀 ~ file: iplTeamCronJob.js:32 ~ syncIPLTeams ~ response.data:", response.data?.pageProps?.category?.actionTeamData?.listAuctionTeamFront)
        if (response.data && response.data.pageProps && response.data?.pageProps?.category && response.data?.pageProps?.category?.actionTeamData?.listAuctionTeamFront && response.data?.pageProps?.category?.actionTeamData?.listAuctionTeamFront?.aData) {
            const teams = response.data?.pageProps?.category?.actionTeamData?.listAuctionTeamFront?.aData;
            // console.log("🚀 ~ file: iplTeamCronJob.js:35 ~ syncIPLTeams ~ teams:", teams[1])
            if (teams.length > 0) {
                for (const team of teams) {
                    const existingTeam = await IPLTeamsModel.findOne({ apiTeamId: team?._id });
                    if (!existingTeam) {        
                        const predefineUrlForTeamImage = 'https://res.cloudinary.com/dlokrlj7n/image/upload/v1734422482/crichamp/IPL_Team_Flag/';
                        const uploadIPLTeamImage = predefineUrlForTeamImage + team?.oTeam?.oImg?.sUrl?.split("/")[2];
                        const requestBody = {
                            totalSpend: team?.nTotalSpent,
                            purseLeft: team?.nPurseLeft,
                            playerCount: team?.nPlayerCount,
                            overseaPlayerCount: team?.nOverseaPlayerCount,
                            colorCode: team?.sColorCode,
                            teamId: team?.oTeam?._id,
                            apiId: team?._id,
                            name: team?.oTeam?.sAltName,
                            shortName: team?.oTeam?.sAbbr,
                            image: uploadIPLTeamImage,
                            apiResponse: JSON.stringify(team)
                        };

                        // Create database entry with or without image URLs
                        await IPLTeamsModel.create(requestBody);
                    }
                }
            }
            console.log(`Synced ${teams.length} teams successfully`);
        }
    } catch (error) {
        console.error('Error syncing teams:', error);
    }
}

// async function syncTeamDetails(slug) {
//     try {
//         const response = await axios.get(`https://www.crictracker.com/_next/data/g2XS67JPUUk2arjd9gpx6/en/ipl-auction/teams/${slug}.json?slug=ipl-auction&slug=teams&slug=${slug}`, {
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         // console.log("🚀 ~ file: iplTeamCronJob.js:32 ~ syncIPLTeams ~ response.data:", response.data?.pageProps?.category?.actionTeamData?.listAuctionTeamFront)
//         if (response.data && response.data.pageProps && response.data?.pageProps?.category && response.data?.pageProps?.category?.teamDetail && response.data?.pageProps?.category?.teamDetail?.aBid) {
//             const bids = response.data?.pageProps?.category?.teamDetail?.aBid;
//             // console.log("🚀 ~ file: iplTeamCronJob.js:35 ~ syncIPLbids ~ bids:", bids[1])
//             let updatedBids = [];
//             if (bids.length > 0) {
//                 for (const team of bids) {
//                     const predefineUrlForTeamImage = 'https://res.cloudinary.com/dlokrlj7n/image/upload/v1734422482/crichamp/IPL_Team_Flag/';
//                     const uploadIPLTeamImage = predefineUrlForTeamImage + team?.oTeam?.oImg?.sUrl?.split("/")[2];
//                     const teamsBids = {
//                         soldPrice: team?.nSoldPrice,
//                         bidPrice: team?.nBidPrice,
//                         sold: team?.bSold,
//                         bRTM: team?.bRTM,
//                         iplTeamImage: uploadIPLTeamImage,
//                         iplTeamName: team?.oTeam?.sTitle,
//                         apiBidTeamId: team?._id,
//                         apiResponse: JSON.stringify(team)
//                     };
//                     updatedBids.push(teamsBids);
//                 }
//             }
//             return updatedBids;
//         }
//     } catch (error) {
//         console.error('Error syncing teams:', error);
//     }
// }

syncIPLTeams()