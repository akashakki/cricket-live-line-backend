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
                        const requestBody = {
                            apiTeamId: team?._id,
                            name: team?.oTeam?.sTitle,
                            shortName: team?.oTeam?.sAbbr,
                            image: team?.oTeam?.oImg?.sUrl,
                            apiResponse: JSON.stringify(team)
                        };

                        // Create database entry with or without image URLs
                        await IPLTeamsModel.create(requestBody);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error syncing auction players:', error);
    }
}

// syncIPLTeams()