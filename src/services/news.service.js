const { NewsModel } = require('../models');
const CONSTANT = require('../config/constant');

const convertPubDateToISO = (pub_date) => {
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

        return isoDateString;
    } catch (error) {
        console.error('Error during date conversion:', error);
        throw error; // Re-throw the error so the calling function can handle it
    }
};



/**
 * Create a Record
 * @param {Object} requestBody
 * @returns {Promise<Record>}
 */
const create = async (requestBody) => {
    if (requestBody.news_id && await NewsModel.isFieldValueTaken('news_id', requestBody.news_id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `News ID ${requestBody.news_id} already exists.` };
    }
    if (requestBody.title && await NewsModel.isFieldValueTaken('title', requestBody.title)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Title - ${requestBody.title} already exists.` };
    }
    const data = await NewsModel.create(requestBody);
    return { data: data, code: 200, message: CONSTANT.CREATED };
};

/**
 * Query for Record
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.searchBy] - Search By use for search
 * @returns {Promise<QueryResult>}
 */
const queries = async (options) => {
    var condition = { $and: [{ isDelete: 1 }] };
    if (options.searchBy && options.searchBy != 'undefined') {
        var searchBy = {
            $regex: ".*" + options.searchBy + ".*",
            $options: "si"
        }

        condition.$and.push({
            $or: [{
                title: searchBy
            }]
        })
    }
    if (options.status && options.status != 'undefined') {
        condition.$and.push({
            $or: [{
                status: options.status
            }]
        })
    }
    const data = await NewsModel.paginate(condition, options);
    return data;
};

/**
 * Get Record by id
 * @param {ObjectId} id
 * @returns {Promise<Record>}
 */
const getById = async (id) => {
    var data = await NewsModel.findById(id)
    return data;
};

const getByNewsId = async (id) => {
    var data = await NewsModel.findOne({ news_id: id })
    return data;
};

/**
 * Update industry by id
 * @param {ObjectId} id
 * @param {Object} updateBody
 * @returns {Promise<industry>}
 */
const updateById = async (id, updateBody) => {
    const data = await getById(id);
    if (updateBody.news_id && await NewsModel.isFieldValueTaken('news_id', updateBody.news_id, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `News ID ${updateBody.news_id} already exists.` };
    }
    if (updateBody.title && await NewsModel.isFieldValueTaken('title', updateBody.title, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Title - ${updateBody.title} already exists.` };
    }
    Object.assign(data, updateBody);
    await data.save();
    return { data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.UPDATED };
};

/**
 * Delete industry by id
 * @param {ObjectId} id
 * @returns {Promise<industry>}
 */
const deleteById = async (id) => {
    const data = await getById(id);
    if (!data) {
        return { data: {}, code: CONSTANT.NOT_FOUND, message: CONSTANT.NOT_FOUND_MSG }
    }
    data.isDelete = 0;
    await data.save();
    return { data: data, code: CONSTANT.SUCCESSFUL, message: CONSTANT.DELETED }
};

const getListWithoutPagination = async (options) => {
    var condition = { $and: [{}] };

    // Search by name (if provided)
    if (options.searchBy && options.searchBy != 'undefined') {
        var searchBy = {
            $regex: ".*" + options.searchBy + ".*",
            $options: "si"
        }

        condition.$and.push({
            $or: [{
                name: searchBy
            }]
        });
    }

    // Filter by status (if provided)
    if (options.status && options.status != 'undefined') {
        condition.$and.push({
            $or: [{
                status: options.status
            }]
        });
    }

    let allNews = await NewsModel.find(condition).exec();

    // Sort based on converted pub_date
    allNews = allNews.sort((a, b) => {
        const dateA = new Date(convertPubDateToISO(a.pub_date));
        const dateB = new Date(convertPubDateToISO(b.pub_date));

        return dateB - dateA; // Sort by date descending (latest first)
    });

    // Apply limit if provided
    if (options.limit) {
        allNews = allNews.slice(0, options.limit);
    }

    return allNews;
};




const getNewsBySeriesId = async (series_id) => {
    // Base condition: filter for upcoming matches
    var condition = { $and: [{}] };

    // Check if series_id is valid
    if (series_id && series_id !== 'undefined') {
        condition.$and.push({
            series_id: Number(series_id)
        });
    }

    // Fetch matches from MongoDB without date comparison initially
    let news = await NewsModel.find(condition);

    return news;
}

module.exports = {
    create,
    queries,
    getById,
    updateById,
    deleteById,
    getListWithoutPagination,
    getNewsBySeriesId,
    getByNewsId
};
