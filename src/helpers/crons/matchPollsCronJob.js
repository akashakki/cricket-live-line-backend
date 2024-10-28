const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');
const config = require('../../config/config');
const { MatchesModel, PollsModel } = require('../../models');
// const { GlobalService } = require('../../services');

async function promptForPollsAndQuizzes(matchData) {
    const {
        match_type,
        squad,
        head_to_head,
        forms,
        venue,
        team_a,
        team_b,
        series
    } = matchData;

    // Get key players by role
    const getKeyPlayersByRole = (teamSquad) => {
        const batsmen = teamSquad.player.filter(p => p.play_role === "Batsman").map(p => p.name);
        const bowlers = teamSquad.player.filter(p => p.play_role === "Bowler").map(p => p.name);
        const allrounders = teamSquad.player.filter(p => p.play_role === "Allrounder").map(p => p.name);
        return { batsmen, bowlers, allrounders };
    };

    const teamAPlayers = getKeyPlayersByRole(squad.team_a);
    const teamBPlayers = getKeyPlayersByRole(squad.team_b);

    // Combine all players for options
    const allPlayers = [
        ...teamAPlayers.batsmen,
        ...teamAPlayers.bowlers,
        ...teamAPlayers.allrounders,
        ...teamBPlayers.batsmen,
        ...teamBPlayers.bowlers,
        ...teamBPlayers.allrounders
    ];

    const allBatsmenAndAllroundersPlayers = [
        ...teamAPlayers.batsmen,
        ...teamAPlayers.allrounders,
        ...teamBPlayers.batsmen,
        ...teamBPlayers.allrounders
    ];

    // Generate structured JSON format
    const pollsAndQuizzes = {
        match_info: {
            match_type,
            series,
            venue,
            team_a,
            team_b,
            head_to_head: {
                team_a_wins: head_to_head.team_a_win_count,
                team_b_wins: head_to_head.team_b_win_count
            }
        },
        pre_match_polls: [
            {
                id: "poll_1",
                question: "Who will win the toss?",
                type: "single_choice",
                options: [
                    { id: "1", text: team_a },
                    { id: "2", text: team_b }
                ],
                category: "toss_prediction"
            },
            {
                id: "poll_2",
                question: "Who will win this match?",
                type: "single_choice",
                options: [
                    { id: "1", text: team_a },
                    { id: "2", text: team_b }
                ],
                category: "match_prediction"
            },
            {
                id: "poll_3",
                question: "What will be the best choice after winning the toss?",
                type: "single_choice",
                options: [
                    { id: "1", text: "Bat first" },
                    { id: "2", text: "Bowl first" }
                ],
                category: "strategy_prediction"
            }
        ],
        performance_prediction_polls: [
            {
                id: "perf_poll_1",
                question: "Who will be the top scorer in the match?",
                type: "single_choice",
                options: allBatsmenAndAllroundersPlayers.map((player, index) => ({
                    id: String(index + 1),
                    text: player
                })),
                category: "player_performance"
            },
            {
                id: "perf_poll_2",
                question: "Who will take the most wickets?",
                type: "single_choice",
                options: [...teamAPlayers.bowlers, ...teamBPlayers.bowlers].map((player, index) => ({
                    id: String(index + 1),
                    text: player
                })),
                category: "bowler_performance"
            },
            {
                id: "perf_poll_3",
                question: "Who will be the player of the match?",
                type: "single_choice",
                options: allPlayers.map((player, index) => ({
                    id: String(index + 1),
                    text: player
                })),
                category: "player_of_the_match"
            },
            {
                id: "perf_poll_4",
                question: "Which player will hit the most sixes?",
                type: "single_choice",
                options: allBatsmenAndAllroundersPlayers.map((player, index) => ({
                    id: String(index + 1),
                    text: player
                })),
                category: "most_sixes"
            },
            {
                id: "perf_poll_5",
                question: "Which bowler will have the best bowling figures?",
                type: "single_choice",
                options: [...teamAPlayers.bowlers, ...teamBPlayers.bowlers].map((player, index) => ({
                    id: String(index + 1),
                    text: player
                })),
                category: "best_bowling"
            }
        ],
        trivia_quiz: [
            {
                id: "quiz_1",
                question: `How many matches have ${team_a} won against ${team_b} in ${match_type} matches?`,
                type: "single_choice",
                options: [
                    { id: "1", text: head_to_head.team_a_win_count.toString() },
                    { id: "2", text: (head_to_head.team_a_win_count + 1).toString() },
                    { id: "3", text: (head_to_head.team_a_win_count + 2).toString() }
                ],
                correct_answer: "1",
                difficulty: "easy",
                category: "head_to_head",
                explanation: `${team_a} has won ${head_to_head.team_a_win_count} matches against ${team_b} in ${match_type} format.`
            }
        ],
        match_situation_predictions: [
            {
                id: "situation_1",
                question: "What will be the total score range?",
                type: "single_choice",
                options: [
                    { id: "1", text: "Below 250" },
                    { id: "2", text: "250-300" },
                    { id: "3", text: "300-350" },
                    { id: "4", text: "Above 350" }
                ],
                category: "score_prediction"
            },
            {
                id: "situation_2",
                question: "How many sixes will be hit in the match?",
                type: "single_choice",
                options: [
                    { id: "1", text: "0-5" },
                    { id: "2", text: "6-10" },
                    { id: "3", text: "11-15" },
                    { id: "4", text: "More than 15" }
                ],
                category: "match_events"
            },
            {
                id: "situation_3",
                question: "How many runs will be scored in the first over?",
                type: "single_choice",
                options: [
                    { id: "1", text: "0-5" },
                    { id: "2", text: "6-10" },
                    { id: "3", text: "11-15" },
                    { id: "4", text: "More than 15" }
                ],
                category: "first_over_prediction"
            },
            {
                id: "situation_4",
                question: "Will there be a wicket in the first over?",
                type: "single_choice",
                options: [
                    { id: "1", text: "Yes" },
                    { id: "2", text: "No" }
                ],
                category: "first_over_events"
            },
            {
                id: "situation_5",
                question: "Who will hit the first six of the match?",
                type: "single_choice",
                options: allPlayers.map((player, index) => ({
                    id: String(index + 1),
                    text: player
                })),
                category: "first_six"
            },
            {
                id: "situation_6",
                question: "Which team will score the most runs in the powerplay?",
                type: "single_choice",
                options: [
                    { id: "1", text: team_a },
                    { id: "2", text: team_b }
                ],
                category: "powerplay_prediction"
            }
        ]
    };

    // Add metadata for database storage
    const finalOutput = {
        match_id: matchData.match_id,
        created_at: new Date().toISOString(),
        status: "active",
        polls_and_quizzes: pollsAndQuizzes
    };

    return finalOutput;
}


// async function main() {
//     try {
//         const matchData = await MatchesModel.findOne({ match_id: 6316 }).exec();

//         if (matchData) {
//             const promptPollsAndQuizzes = await promptForPollsAndQuizzes(matchData);
//             console.log("🚀 ~ file: ai.js:341 ~ main ~ promptPollsAndQuizzes:", JSON.stringify(promptPollsAndQuizzes))
//             // const pollsAndQuizzes = await generateUserPollsAndQuizzes(promptPollsAndQuizzes);
//             // console.log("Generated User Polls and Quizzes:", pollsAndQuizzes);
//         } else {
//             console.log("No match found with the given ID.");
//         }
//     } catch (error) {
//         console.error("Error in fetching match data:", error.message);
//     }
// }

// // Call the main function
// main();

async function createPollsForUpcomingMatches() {
    try {
        // Fetch all upcoming matches
        const currentTime = new Date();
        const startOfDay = new Date(); // Current date and time
        startOfDay.setHours(0, 0, 0, 0); // Set to start of the day

        const fourDaysLater = new Date(); // Current date and time
        fourDaysLater.setDate(fourDaysLater.getDate() + 4); // Set to 4 days later

        const upcomingMatches = await MatchesModel.aggregate([
            {
                $match: {
                    match_status: "Upcoming",
                    $expr: {
                        $and: [
                            { $gte: [{ $dateFromString: { dateString: "$date_time", format: "%Y-%m-%d %H:%M:%S" } }, startOfDay] },
                            { $lt: [{ $dateFromString: { dateString: "$date_time", format: "%Y-%m-%d %H:%M:%S" } }, fourDaysLater] }
                        ]
                    }
                }
            },
            {
                $sort: { date_time: 1 } // Sort upcoming matches by date
            }
        ]);
        // const upcomingMatches = await MatchesModel.find({ match_status: 'Upcoming' }).exec();

        for (const matchData of upcomingMatches) {
            // Check if polls already exist for the match
            const existingPolls = await PollsModel.findOne({ match_id: matchData.match_id }).exec();

            // Calculate time until match starts
            // const matchStartTime = 2024-10-28T06:30:00.000Z  "2024-10-28 12:45:00"//new Date(matchData.date_time);
            const values = matchData.date_time?.split(" ");
            const matchStartTime = values[0] + 'T' + values[1] + '.000Z'
            console.log("🚀 ~ file: matchPollsCronJob.js:297 ~ createPollsForUpcomingMatches ~ matchStartTime:", matchData.match_id, matchStartTime)
            const hoursUntilMatch = (new Date(matchStartTime) - currentTime) / (1000 * 60 * 60); // Convert to hours
            console.log("🚀 ~ file: matchPollsCronJob.js:301 ~ createPollsForUpcomingMatches ~ hoursUntilMatch:", hoursUntilMatch)

            if (!existingPolls && hoursUntilMatch <= 5 && hoursUntilMatch >= 4) {
                const promptPollsAndQuizzes = await promptForPollsAndQuizzes(matchData);
                console.log("🚀 ~ file: ai.js:341 ~ createPollsForUpcomingMatches ~ promptPollsAndQuizzes:", JSON.stringify(promptPollsAndQuizzes));

                // Create new polls in the PollsModel
                const newPolls = new PollsModel({
                    match_id: matchData.match_id,
                    match_info: promptPollsAndQuizzes?.polls_and_quizzes?.match_info,
                    pre_match_polls: promptPollsAndQuizzes?.polls_and_quizzes?.pre_match_polls,
                    performance_prediction_polls: promptPollsAndQuizzes?.polls_and_quizzes?.performance_prediction_polls,
                    trivia_quiz: promptPollsAndQuizzes?.polls_and_quizzes?.trivia_quiz,
                    match_situation_predictions: promptPollsAndQuizzes?.polls_and_quizzes?.match_situation_predictions
                });

                await newPolls.save();
                console.log(`Polls created successfully for match ID: ${matchData.match_id}.`);
            } else if (existingPolls) {
                console.log(`Polls already exist for match ID: ${matchData.match_id}.`);
            } else {
                console.log(`Polls can only be created for match ID: ${matchData.match_id} 4-5 hours before the match.`);
            }
        }
    } catch (error) {
        console.error("Error in creating polls for upcoming matches:", error.message);
    }
}

// if (config.env == "production") {
//     // Schedule the cron job to run every 30 minutes
//     cron.schedule('*/10 * * * *', () => {
//         console.log('Checking for upcoming matches to create polls...');
//         createPollsForUpcomingMatches();
//     });
// }
// createPollsForUpcomingMatches();