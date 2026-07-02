const bcrypt = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const environment = require('../../config/environment');
const { createEncryption } = require('../utils/encryption.utils');
//TODO: add boolean contact list fields to user that specifies if they are to receive certain correspondences, including monthly reminders to upload new mortgage data
const UserSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    dateCreated: {
      type: String
    },
    dateDeleted: {
      type: String,
      default: null,
    },
    validatedIPs: [{
      type: String,
    }],
    ipsAndLocations: [{
      type: Object //ip, isp, location, proxy, mobile, userAgent, userAgentData
    }],
    team: {
      type: String
    },
    role: [{
      type: String,
      enum: ['guest', 'user', 'admin', 'super'],
    }],
    email: {
      type: String,
      unique: true,
      lowercase: true,
    },
    firstName: { 
      type: String
    },
    lastName: { 
      type: String
    },
    initials: {
      type: String
    },
    fullName: {
      type: String
    },
    closedRefinances: {
      type: Number,
      default: 0,
    },
    closedRenegotiations: {
      type: Number,
      default: 0,
    },
    grossProfitNumber: {
      type: Number,
      default: 0,
    },
    grossProfitPercent: {
      type: Number,
      default: 0,
    },
    lastRenegotiation: {
      type: String,
    },
    renegotiationFrequency: {
      type: Number,
      default: 0,
    },
    lastRefinance: {
      type: String
    },
    refinanceFrequency: {
      type: Number,
      default: 0,
    },
    leadsAwaitingUpdate: {
      type: Number,
      default: 0,
    },
    leadsAwaitingVerification: {
      type: Number,
      default: 0,
    },
    memberMonthlyStats: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "MemberMonthlyStats"
    }],
    //* For sorting at load
    notifications: [{ // for lead and mortgage notifications and new assignments
      type: Object, 
      // date
      // notifType: lead, leadRemoved, leadAssigned, leadFinalized, mortgage, mortgageRemoved, mortgageAssigned, query
      // mortgageId
      // leadId
      // notifCount
      // leadStatus: inactive, awaitingAction, investigating, closing, awaitingUpdate
      // [timelineGuids]
      // queryNewLeads
      // totalQueries
    }],
    //* For sorting at load
    newReports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report"
    }],
    assignedMortgages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mortgage"
    }],
    awaitingActionLeads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveLead"
    }],
    investigatingLeads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveLead"
    }],
    closingLeads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveLead"
    }],
    awaitingUpdateLeads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActiveLead"
    }],
    notificationSchedule: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotificationSchedule"
    }],
    loginDates: [{
      type: Object, //date, ip
      maxlength: 5,
    }],
    defaultState: {
      type: String,
      default: null,
    },
    defaultCity: {
      type: String,
      default: null,
    },
  }
);

UserSchema.methods.getPublicUserData = async function () {
  const user = this.toJSON();
  const newUser = {
    userId: user._id,
    email: user.email,
    firstName: user.firstName,
    fullName: user.fullName,
    initials: user.initials,
    teamId: user.team,
    role: user.role[0],
  }
  return newUser;
};

UserSchema.methods.createAccessToken = function () {
  let expiresIn = parseFloat(environment.JWT_EXPIRATION_IN_MINUTES)
  if (Number.isNaN(expiresIn)) {
    expiresIn = 0
  } else {
    expiresIn = expiresIn.toString() + 'm'
  }
  return createEncryption(jwt.sign(
    { _id: this.id },
    environment.JWT_SECRET,
    { expiresIn },
  ));
};

/*
* These are helper functions attached to the model. They can be
* used without creating an instance of the model.`
* */
UserSchema.statics.findByEmailAddress = function (email) {
  return this.findOne({ email });
};

UserSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('User', UserSchema);
