const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const uploadReportSchema = new mongoose.Schema(
  {
    date: {
      type: String
    },
    contributor: {
      type: String
    },
    uploadTimeParsed: {
      type: Number
    },
    uploadType: {
      type: String
    },
    numberSuccessess: {
      type: Number,
      default: 0,
    },
    numberErrors: {
      type: Number,
      default: 0,
    },
    numberNoResults: {
      type: Number,
      default: 0,
    },
    numberDuplicates: {
      type: Number,
      default: 0,
    },
    numberNewLeads: {
      type: Number,
      default: 0,
    },
    monthlyQueriesExhausted: {
      type: Boolean,
      default: false,
    },
    uploadErrors: [{
      rowIndex: {
        type: Number,
      },
      errors: [{
        type: Object
      }],
    }],
    duplicateObjs: [{
      type: Object, // streetAddress, city, state, postalCode
    }],
    noResultsObjs: [{
      type: Object, // streetAddress, city, state, postalCode
    }],
    errorObjs: [{
      type: Object, // streetAddress, city, state, postalCode
    }],
    newLeadObjs: [{
      type: Object, // streetAddress, city, state, postalCode
    }],
  }
);

uploadReportSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('UploadReport', uploadReportSchema);
