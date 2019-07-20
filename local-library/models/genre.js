var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var gerneSchema = new Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength: 100
    }
})
gerneSchema
    .virtual('url')
    .get(function () {
        return '/genre/' + this.name
    })

module.exports = mongoose.model('Gerne',gerneSchema)
