const cron = require('node-cron');
const axios = require('axios');
const config = require('../../config/config');
const heroAPIBaseURL = 'https://app.heroliveline.com/csadmin/api/'
const { SeriesModel, MatchesModel, PlayerModel, VenuesModel, TeamsModel, NewsModel } = require('../../models');

async function fetchSeriesList() {
    // let allPlayers = []; // Array to store all players
    let currentPage = 1; // Start from the first page
    let lastPage = 1; // Initialize last page variable

    try {
        do {
            // Fetch the player list for the current page
            const response = await axios.get(`${heroAPIBaseURL}web/series/seriesList?page=${currentPage}`);

            const seriesList = response.data?.seriesList?.data;
            // console.log("🚀 ~ file: seriesCronJob.js:18 ~ fetchSeriesList ~ seriesList:", seriesList)
            lastPage = response.data?.seriesList?.last_page; // Get the last page number from the response

            // console.log("🚀 ~ file: playerCronJob.js:14 ~ fetchseriesList ~ seriesList:", seriesList);

            if (seriesList && seriesList.length > 0) {
                // allPlayers = allPlayers.concat(seriesList); // Add fetched players to allPlayers array

                // You can also process each player here if needed
                for (let series of seriesList) {
                    const updatedObj = {
                        series_id: series?.series_cid,
                        series:series?.series_title,
                        series_type: series?.series_type,
                        series_date: series?.series_start_date + ' - ' + series?.series_end_date,
                        total_matches: series?.series_matches,
                        start_date: series?.series_start_date,
                        end_date: series?.series_end_date,
                        image: series?.series_image,
                        month_wise: series?.series_month_wise
                    }
                    await SeriesModel.findOneAndUpdate({ series_id: series.series_cid }, updatedObj, { upsert: true });
                    // console.log("🚀 ~ file: seriesCronJob.js:26 ~ fetchSeriesList ~ series:", series?.series_venues_detail)
                    if (series &&series?.series_venues_detail && series?.series_venues_detail?.data) {
                        for (const venue of series.series_venues_detail?.data) {
                            await VenuesModel.findOneAndUpdate({ venue_id: venue.venue_id }, venue, { upsert: true });
                        }
                    }
                    // await fetchSeriesDetails(series?.series_cid);
                }
            }

            currentPage++; // Increment to the next page
        } while (currentPage <= lastPage); // Continue until all pages are fetched

        // return allPlayers; // Return the complete list of players
    } catch (error) {
        console.error('Error making API call 54:', error);
    }
}

// async function fetchSeriesList() {
//     try {
//         const response = await axios.get('http://24.199.71.166:8700/v2/client/series-list');
//         const seriesList = response.data?.data?.data;
//         if (seriesList && seriesList?.length != 0) {
//             for (let i = 0; i < seriesList?.length; i++) {
//                 const series = seriesList[i];
//                 // await SeriesModel.create(series);
//                 await fetchSeriesDetails(series?.series_id);
//             }
//         }
//     } catch (error) {
//         console.error('Error making API call:', error);
//     }
// }

const fetchSeriesDetails = async (series_id) => {
    console.log("🚀 ~ file: SeriesCronJob.js:30 ~ fetchSeriesDetails ~ series_id:", series_id);
    try {
        const response = await axios.get('http://24.199.71.166:8700/v2/client/series-info/' + series_id);
        const seriesDetails = response.data?.data;

        if (seriesDetails) {
            seriesDetails['series_id'] = series_id;

            // Save venue details
            if (seriesDetails.venuesBySeriesId?.data) {
                for (const venue of seriesDetails.venuesBySeriesId.data) {
                    const venueDetails = {
                        venue_id: venue.id,
                        name: venue.name,
                        place: venue.place,
                        image: venue.image
                    };
                    await VenuesModel.findOneAndUpdate({ venue_id: venue.id }, venueDetails, { upsert: true });
                }
            }

            // Save team details
            if (seriesDetails.squadsBySeriesId?.data) {
                for (const squad of seriesDetails.squadsBySeriesId.data) {
                    const teamDetails = {
                        team_id: squad.team.id,  // Assuming team.id exists
                        team_name: squad.team.name,
                        team_short: squad.team.short_name,
                        team_flag: squad.team.flag
                    };

                    // Skip if team_id is null or undefined
                    if (teamDetails.team_id) {
                        await TeamsModel.findOneAndUpdate({ team_id: teamDetails.team_id }, teamDetails, { upsert: true });
                    } else {
                        console.warn(`Skipping team without team_id: ${squad.team.name}`);
                    }
                }
            }

            // Save player details
            if (seriesDetails.topThreePlayersBySeriesId?.data && seriesDetails.topThreePlayersBySeriesId?.data?.length !== 0) {
                const players = [
                    ...seriesDetails.topThreePlayersBySeriesId.data.batsman,
                    ...seriesDetails.topThreePlayersBySeriesId.data.bowler
                ];

                for (const player of players) {
                    const playerDetails = {
                        player_id: player.player_id,
                        player: player.player,
                        matches: player.matches,
                        batting_career: {
                            runs: player.runs,
                            sr: player.sr,
                            avg: player.avg,
                            fours: player.fours,
                            sixes: player.sixes
                        },
                        bowling_career: {
                            overs: player.overs,
                            balls: player.balls,
                            wkts: player.wkts,
                            eco: player.eco
                        }
                    };

                    // Remove undefined fields from the playerDetails object
                    Object.keys(playerDetails).forEach(key => {
                        if (playerDetails[key] === undefined || playerDetails[key] === null) {
                            delete playerDetails[key];
                        }
                    });

                    await PlayerModel.findOneAndUpdate({ player_id: player.player_id }, playerDetails, { upsert: true });
                }
            }

            // Save news using series ID
            if (seriesDetails.newsBySeriesId?.data) {
                for (const news of seriesDetails.newsBySeriesId.data) {
                    const newsDetails = {
                        news_id: news.news_id,
                        series_id: series_id,
                        title: news.title,
                        description: news.description,
                        image: news.image,
                        pub_date: news.pub_date,
                        content: [news.content]
                    };

                    // Check if player_id exists and is not null
                    if (news.player_id) {
                        newsDetails['player_id'] = news.player_id;
                    }
                    await NewsModel.findOneAndUpdate({ news_id: newsDetails.news_id }, newsDetails, { upsert: true });
                }
            }

            // Save matches details
            if (seriesDetails.recentMatchesBySeriesId?.data || seriesDetails.upcomingMatchesBySeriesId?.data) {
                const matchs = [
                    ...seriesDetails.recentMatchesBySeriesId?.data,
                    ...seriesDetails.upcomingMatchesBySeriesId?.data
                ];
                for (const match of matchs) {
                    match['series_id'] = series_id
                    await MatchesModel.findOneAndUpdate({ match_id: match.match_id }, match, { upsert: true });
                }
            }

            // Create or update series details
            await SeriesModel.findOneAndUpdate({ series_id: series_id }, seriesDetails, { upsert: true, new: true });
        }
    } catch (error) {
        console.error('Error making API call:', error);
    }
};


if (config.env == "production") {// Schedule tasks to be run on the server.
    cron.schedule('0 0 * * *', async () => {
        // cron.schedule('* * * * *', async () => {
        console.log('Running a job at 00:00 at midnight');
        fetchSeriesList()
    });
    // fetchSeriesList()
}
fetchSeriesList()