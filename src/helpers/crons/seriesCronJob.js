const cron = require('node-cron');
const axios = require('axios');
const { SeriesModel } = require('../../models');

// Schedule tasks to be run on the server.
cron.schedule('0 0 * * *', async () => {
// cron.schedule('* * * * *', async () => {
    console.log('Running a job at 00:00 at midnight');

    try {
        const response = await axios.get('http://24.199.71.166:8700/v2/client/series-list');
        const seriesList = response.data?.data?.data;
        if (seriesList && seriesList?.length != 0) {
            for (let i = 0; i < seriesList?.length; i++) {
                const series = seriesList[i];
                const seriesData = await SeriesModel.findOne({ series_id: series?.series_id, is_delete: 1 });
                if (!seriesData) {
                    await SeriesModel.create(series);
                }
            }
        }
    } catch (error) {
        console.error('Error making API call:', error);
    }
});
