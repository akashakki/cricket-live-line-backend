const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const mongoosePaginate = require('mongoose-paginate-v2');


const replySchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId, //here user id can be both andmin id  and normal user id
        ref: 'company'
    },
    content: {
        type: String
    },
    // userType: {
    //     type: String, // Store the user type (admin or user)
    //     enum: ['admin', 'user'], // Define possible values for user type
    // },
    date: {
        type: Date,
        default: Date.now,
    },

}, {
    timestamps: true,
});


const ticketSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'company',

        },
        subject: {
            type: String,

            index: true,
        },
        department: {
            type: String,

        },
        message: {
            type: String,

        },
        priority: {
            type: String,

            enum: ['high', 'medium', 'low'],
        },
        status: {
            type: String,

            default: 'open',
            enum: ['open', 'resolved', 'closed'],
        },
        userAdminReplies: [replySchema],
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
ticketSchema.plugin(toJSON);
ticketSchema.plugin(mongoosePaginate);
// paginate(ticketSchema);

/**
 * @typedef Token
 */
const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
