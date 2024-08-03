const mongoose = require('mongoose');
const { toJSON } = require("./plugins");
const mongoosePaginate = require('mongoose-paginate-v2');

const disposableEmailDomainSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true
  },
  status: { type: Number, default: 1 }, //0 is Inactive, 1 is Active
  isDelete: { type: Number, default: 1 }, //0 is delete, 1 is Active
},
{
  timestamps: true
});


disposableEmailDomainSchema.set('toObject', { virtuals: true });
disposableEmailDomainSchema.set('toJSON', { virtuals: true });

// add plugin that converts mongoose to json
disposableEmailDomainSchema.plugin(toJSON);
disposableEmailDomainSchema.plugin(mongoosePaginate);


// Static method to check if a field value is taken
disposableEmailDomainSchema.statics.isFieldValueTaken = async function (fieldName, value, excludeId) {
    const query = { [fieldName]: value };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    const response = await this.findOne(query);
    return !!response;
};

module.exports = mongoose.model('DisposableEmailDomain', disposableEmailDomainSchema);
