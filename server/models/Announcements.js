const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        summary: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        priority: {
            type: String,
            default: "medium"
        },
        status: {
            type: String,
            default: "draft"
        },
        date: {
            type: Date,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        audience: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);
module.exports = mongoose.model('Announcement', serviceSchema);

