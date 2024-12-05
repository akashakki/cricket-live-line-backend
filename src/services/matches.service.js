const { MatchesModel } = require('../models');
const CONSTANT = require('../config/constant');
// const { options } = require('joi');
const moment = require('moment');

/**
 * Create a Record
 * @param {Object} requestBody
 * @returns {Promise<Record>}
 */
const create = async (requestBody) => {
    if (requestBody.match_id && await MatchesModel.isFieldValueTaken('match_id', requestBody.match_id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Match Id ${requestBody.match_id} already exists.` };
    }
    if (requestBody.name && await MatchesModel.isFieldValueTaken('name', requestBody.name)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Name - ${requestBody.name} already exists.` };
    }
    const data = await MatchesModel.create(requestBody);
    return { data: data, code: 200, message: CONSTANT.CREATED };
};

/**
 * Query For Home Page Match List
 * @returns {Promise<QueryResult>}
 */
const queriesForHomeList = async (options) => {
    try {
        const currentDate = new Date();
        const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
        const fourDaysLater = new Date(startOfDay.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days ahead
        // const oneDayBefore = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000); // 1 day before
        const threeDayBefore = new Date(startOfDay.getTime() - 72 * 60 * 60 * 1000); // 1 day before

        const query = [
            // Stage 1: Separate live matches
            {
                $match: {
                    match_status: "Live"
                }
            },
            {
                $sort: { date_time: 1 } // Sort live matches by date
            },
            {
                $unionWith: {
                    coll: "matches",
                    pipeline: [
                        // Stage 2: Upcoming matches for the next 4 days
                        {
                            $match: {
                                match_status: "Upcoming",
                                // $expr: {
                                //     $and: [
                                //         { $gte: [{ $dateFromString: { dateString: "$date_time", format: "%Y-%m-%d %H:%M:%S" } }, startOfDay] },
                                //         { $lt: [{ $dateFromString: { dateString: "$date_time", format: "%Y-%m-%d %H:%M:%S" } }, fourDaysLater] }
                                //     ]
                                // }
                            }
                        },
                        {
                            $sort: { date_time: 1 } // Sort upcoming matches by date
                        },
                        {
                            $unionWith: {
                                coll: "matches",
                                pipeline: [
                                    // Stage 3: Finished matches from the previous 1 day
                                    {
                                        $match: {
                                            match_status: "Finished",
                                            $expr: {
                                                $and: [
                                                    { $gte: [{ $dateFromString: { dateString: "$date_time", format: "%Y-%m-%d %H:%M:%S" } }, threeDayBefore] },
                                                    { $lt: [{ $dateFromString: { dateString: "$date_time", format: "%Y-%m-%d %H:%M:%S" } }, fourDaysLater] }
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $sort: { date_time: 1 } // Sort finished matches by date
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                $sort: { date_time: 1 } // Final sort by date
            },
            {
                $limit: 30 // Limit the result to 30 records
            },
            {
                $project: {
                    date_time: 1,
                    match_date: 1,
                    _id: 0, // Exclude _id field if not needed
                    "squad": 1,
                    "match_id": 1,
                    "forms": 1,
                    "fav_team": 1,
                    "min_rate": 1,
                    "max_rate": 1,
                    "head_to_head": 1,
                    "is_hundred": 1,
                    "man_of_match": 1,
                    "man_of_match_player": 1,
                    "match_date": 1,
                    "match_time": 1,
                    "match_type": 1,
                    "matchs": 1,
                    "pace_spin": 1,
                    "place": 1,
                    "referee": 1,
                    "result": 1,
                    "series": 1,
                    "series_id": 407,
                    "series_type": 1,
                    "team_a": 1,
                    "team_a_id": 16,
                    "team_a_img": 1,
                    "team_a_over": 1,
                    "team_a_scores": 1,
                    "team_a_short": 1,
                    "team_b": 1,
                    "team_b_id": 1,
                    "team_b_img": 1,
                    "team_b_scores": 1,
                    "team_b_over": 1,
                    "team_b_short": 1,
                    "team_comparison": 1,
                    "third_umpire": 1,
                    "toss": 1,
                    "toss_comparison": 1,
                    "umpire": 1,
                    "venue": 1,
                    "venue_id": 1,
                    "venue_weather": 1,
                    "weather": 1,
                    "match_status": 1
                }
            }
        ];

        const data = await MatchesModel.aggregate(query);
        return data;

    } catch (error) {
        console.error("Error fetching matches:", error);
        throw new Error("Error fetching match data");
    }
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
                name: searchBy
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
    const data = await MatchesModel.paginate(condition, options);
    return data;
};

/**
 * Get Record by id
 * @param {ObjectId} id
 * @returns {Promise<Record>}
 */
const getById = async (id) => {
    var data = await MatchesModel.findById(id)
    return data;
};

/**
 * Get Record by id
 * @param {ObjectId} id
 * @returns {Promise<Record>}
 */
const getByMatchId = async (id) => {
    var data = await MatchesModel.findOne({ match_id: id })
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
    if (updateBody.match_id && await MatchesModel.isFieldValueTaken('match_id', updateBody.match_id, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Match Id ${updateBody.match_id} already exists.` };
    }
    if (updateBody.name && await MatchesModel.isFieldValueTaken('name', updateBody.name, id)) {
        return { data: {}, code: CONSTANT.BAD_REQUEST, message: `Name - ${updateBody.name} already exists.` };
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
    var condition = { $and: [{ isDelete: 1 }] };
    if (options.searchBy && options.searchBy != 'undefined') {
        var searchBy = {
            $regex: ".*" + options.searchBy + ".*",
            $options: "si"
        }

        condition.$and.push({
            $or: [{
                name: searchBy
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
    let query = MatchesModel.find(condition);

    if (options.limit) {
        query = query.limit(options.limit);
    }

    const Industry = await query.exec();
    return Industry;
};

const getRecentMatchesBySeriesId = async (series_id) => {
    const today = moment().startOf('day'); // Get today's date

    var condition = { $and: [{ match_status: "Finished" }] };

    // Check if series_id is valid
    if (series_id && series_id !== 'undefined') {
        condition.$and.push({
            $or: [{
                series_id: Number(series_id)
            }]
        });
    }

    // Fetch all matches and filter them in JavaScript as MongoDB's string comparison may not work properly with date formats.
    let matches = await MatchesModel.find(condition);

    // Filter matches that have a `date_wise` or `match_date` before today's date
    matches = matches.filter(match => {
        const matchDateWise = moment(match.date_wise, 'DD MMM YYYY, dddd');
        const matchDate = moment(match.match_date, 'DD-MMM');

        return matchDateWise.isBefore(today) || matchDate.isBefore(today);
    });


    return matches;
};

const getUpcomingMatchesBySeriesId = async (series_id) => {
    const today = moment().startOf('day'); // Get today's date

    // Base condition: filter for upcoming matches
    var condition = { $and: [{ match_status: "Upcoming" }] };

    // Check if series_id is valid
    if (series_id && series_id !== 'undefined') {
        condition.$and.push({
            series_id: Number(series_id)
        });
    }

    // Fetch matches from MongoDB without date comparison initially
    let matches = await MatchesModel.find(condition);

    // Now filter out the upcoming matches using JavaScript's `moment`
    matches = matches.filter(match => {
        const matchDateWise = moment(match.date_wise, 'DD MMM YYYY, dddd');
        const matchDate = moment(match.match_date, 'DD-MMM');

        // Only keep matches that are today or after today
        return matchDateWise.isSameOrAfter(today) || matchDate.isSameOrAfter(today);
    });

    return matches;
};

const getAllUpcomingMatchesBySeriesId = async (series_id) => {
    // Base condition: filter for upcoming matches
    var condition = { $and: [{ match_status: "Upcoming" }] };

    // Check if series_id is valid
    if (series_id && series_id !== 'undefined') {
        condition.$and.push({
            series_id: Number(series_id)
        });
    }

    // Fetch matches from MongoDB without date comparison initially
    let matches = await MatchesModel.find(condition);

    return matches;
};


const updateByMatchId = async (id, updateBody) => {
    const data = await MatchesModel.findOne({ match_id: id });
    Object.assign(data, updateBody);
    await data.save();
};


module.exports = {
    create,
    queriesForHomeList,
    queries,
    getById,
    getByMatchId,
    updateById,
    updateByMatchId,
    deleteById,
    getListWithoutPagination,
    getRecentMatchesBySeriesId,
    getUpcomingMatchesBySeriesId,
    getAllUpcomingMatchesBySeriesId
};
