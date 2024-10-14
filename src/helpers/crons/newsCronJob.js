const cron = require('node-cron');
const axios = require('axios');
const config = require('../../config/config');
const FormData = require('form-data');
const { NewsModel } = require('../../models');
const { GlobalService } = require('../../services');

const convertToMongoDate = (pub_date) => {
    const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    try {
        // Split the date and time parts: "06 Oct, 2024 | 04:55 PM" -> ["06 Oct, 2024", "04:55 PM"]
        let [datePart, timePart] = pub_date.split('|').map(part => part.trim());
        // console.log("🚀 ~ file: newsCronJob.js:20 ~ convertToMongoDate ~ datePart, timePart:", datePart, timePart)

        // Split date part: "06 Oct, 2024" -> ["06", "Oct,", "2024"]
        let [day, monthAbbr, year] = datePart.split(' ');

        // Remove the comma from the month abbreviation
        monthAbbr = monthAbbr.replace(',', '');
        // console.log("🚀 ~ file: newsCronJob.js:24 ~ convertToMongoDate ~ day, monthAbbr, year:", day, monthAbbr, year)

        // Now lookup the month
        let month = months[monthAbbr];
        // console.log("🚀 ~ file: newsCronJob.js:24 ~ convertToMongoDate ~ month:", month)

        // Handle AM/PM in time part: "04:55 PM" -> 24-hour format "16:55"
        let [time, modifier] = timePart.split(' '); // Split time and AM/PM
        let [hours, minutes] = time.split(':').map(Number);

        // Convert to 24-hour format
        if (modifier === 'PM' && hours < 12) {
            hours += 12;
        } else if (modifier === 'AM' && hours === 12) {
            hours = 0; // Midnight edge case
        }

        // Construct the time in 24-hour format
        let timeIn24Hour = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

        // Construct the full date string in the format YYYY-MM-DDTHH:mm:ssZ
        let isoDateString = `${year}-${month}-${day}T${timeIn24Hour}Z`;

        // console.log("🚀 ~ file: newsCronJob.js:42 ~ convertToMongoDate ~ isoDateString:", isoDateString)
        // Convert to JavaScript Date object and return
        let dateObject = new Date(isoDateString);
        // console.log("🚀 ~ file: newsCronJob.js:44 ~ convertToMongoDate ~ dateObject:", dateObject)

        // Check if the date is valid
        if (isNaN(dateObject.getTime())) {
            throw new Error(`Invalid date conversion for pub_date: ${pub_date}`);
        }

        return dateObject;
    } catch (error) {
        console.error('Error during date conversion:', error);
        throw error; // Re-throw the error so the calling function can handle it
    }
};


async function fetchNewsList() {
    try {
        // Fetch the player list for the current page

        const newsList = await GlobalService.globalFunctionFetchDataFromAPIGETMethod('news');

        if (newsList && newsList.length > 0) {
            // You can also process each player here if needed
            for (let news of newsList) {
                news['new_date'] = convertToMongoDate(news?.pub_date)
                await NewsModel.findOneAndUpdate({ news_id: news?.news_id }, news, { upsert: true });
            }
        }

        // console.log("Total players fetched:", newsList.length);
        // return allPlayers; // Return the complete list of players
    } catch (error) {
        console.error('Error making API call 52:', error);
    }
}

// console.log("🚀 ~ file: matchCronJob.js:165 ~ config.env:", config.env)
if (config.env == "production") {// Schedule tasks to be run on the server.
    cron.schedule('0 * * * *', async () => {
        console.log('News Cron Running a job every hours');
        fetchNewsList();
    });

    fetchNewsList();
}