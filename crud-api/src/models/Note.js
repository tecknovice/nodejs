const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
    title:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    body:{
        type: String,
        required: true,
        trim: true
    }
},{
    timestamps: true
})
const Note = mongoose.model('Note', noteSchema)

module.exports = Note