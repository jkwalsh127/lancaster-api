const moment = require('moment')
const UserModel = require("../models/user")

exports.notifyAssignees = async function (assigneeIds, userId, mortgageId, leadId, newTimelineGuid, notifType, leadStatus, queryNewLeads, totalQueries, newLeadIds, uploadTimeParsed, userFullName, leadObjs) {
  let userNotification = null
  if (assigneeIds && assigneeIds.length > 0) {
    let todaysDate = moment(new Date()).format('MMM Do')
    //* loop through assignees
    for (let i = 0; i < assigneeIds.length; i++) {
      let assignee = await UserModel.findById(assigneeIds[i]).select('notifications fullName')
      //* if this is a query notification, assign to all members
      if (notifType === 'query' || notifType === 'upload') {
        let newNotification = {}
        let existingNotification = null
        if (notifType === 'query') {
          existingNotification = assignee.notifications.find(notification => notification.notifType === 'query')
        } else {
          existingNotification = assignee.notifications.find(notification => notification.notifType === 'upload')
        }
        if (existingNotification) {
          newNotification = existingNotification
          if (notifType !== 'upload' || existingNotification.uploadTimeParsed !== uploadTimeParsed) {
            if (newNotification.date.length === 1) {
              newNotification.date.push(todaysDate)
            } else {
              newNotification.date[1] = todaysDate
            }
            newNotification.notifCount = newNotification.notifCount + 1
          } else if (notifType === 'upload') {
            newNotification.uploadTimeParsed = uploadTimeParsed
            newNotification.contributor = userFullName
          }
          newNotification.totalQueries = newNotification.totalQueries + totalQueries
          newNotification.queryNewLeads = newNotification.queryNewLeads + queryNewLeads
          if (newNotification.newLeadIds) {
            newNotification.newLeadIds = [...newNotification.newLeadIds, ...newLeadIds]
          } else {
            newNotification.newLeadIds = newLeadIds
          }
          if (newNotification.leadObjs) {
            newNotification.leadObjs = [...newNotification.leadObjs, ...leadObjs]
          } else {
            newNotification.leadObjs = leadObjs
          }
          let notificationIndex = assignee.notifications.indexOf(existingNotification)
          let newNotifications = assignee.notifications
          newNotifications[notificationIndex] = newNotification
          if (userId !== assignee._id) {
            await assignee.updateOne({notifications: newNotifications})
          }
        } else {
          newNotification = {
            date: [todaysDate],
            notifType: notifType,
            queryNewLeads: queryNewLeads,
            totalQueries: totalQueries,
            newLeadIds: newLeadIds,
            leadObjs: leadObjs,
            notifCount: 1,
          }
          if (notifType === 'upload') {
            newNotification.uploadTimeParsed = uploadTimeParsed
            newNotification.contributor = userFullName
          }
          if (userId !== assignee._id) {
            await assignee.updateOne({
              $push: { 
                notifications: {
                  $each: [ newNotification ],
                  $position: 0
                },
              }
            })
          }
        }
        if (userId === assignee._id) {
          userNotification = newNotification
        }
      } else {
        let newNotification = {}
        //* check to see if the assignee has an existing notification for the entity
        let existingNotification = assignee.notifications.find(notification => notification.mortgageId === mortgageId.toString())
        //* if a notification exists, increment the count on the notification, else, provide a new notification
        if (existingNotification) {
          newNotification = existingNotification
          //* if an assignee is being removed from a lead or the lead is being dismissed, empty the timelineGuid array and set the count to 1, else, update notification accordingly
          if (notifType === 'leadRemoved' || notifType === 'leadDismissed' || notifType === 'mortgageRemoved') {
            if (newNotification.date.length === 1) {
              newNotification.date.push(todaysDate)
            } else {
              newNotification.date[1] = todaysDate
            }
            newNotification.notifCount = newNotification.notifCount + 1
            newNotification.timelineGuids = []
            newNotification.notifType = notifType
            let notificationIndex = assignee.notifications.indexOf(existingNotification)
            let newNotifications = assignee.notifications
            newNotifications[notificationIndex] = newNotification
            if (userId !== assignee._id) {
              await assignee.updateOne({notifications: newNotifications})
            }
          } else {
            if (newNotification.date.length === 1) {
              newNotification.date.push(todaysDate)
            } else {
              newNotification.date[1] = todaysDate
            }
            newNotification.notifCount = newNotification.notifCount + 1
            newNotification.timelineGuids.push(newTimelineGuid)
            newNotification.leadStatus = leadStatus
            let notificationIndex = assignee.notifications.indexOf(existingNotification)
            let newNotifications = assignee.notifications
            newNotifications[notificationIndex] = newNotification
            if (userId !== assignee._id) {
              await assignee.updateOne({notifications: newNotifications})
            }
          }
        } else {
          let leadIdString = null
          if (leadId) {
            leadIdString = leadId.toString()
          }
          newNotification = {
            date: todaysDate,
            notifType: notifType,
            mortgageId: mortgageId.toString(),
            leadId: leadIdString,
            notifCount: 1,
            leadStatus: leadStatus,
          }
          if (notifType !== 'leadRemoved' && notifType !== 'leadDismissed' && notifType !== 'mortgageRemoved') {
            newNotification.timelineGuids = [newTimelineGuid]
          }
          if (userId !== assignee._id) {
            await assignee.updateOne({
              $push: { 
                notifications: {
                  $each: [ newNotification ],
                  $position: 0
                },
              }
            })
          }
        }
        if (userId === assignee._id) {
          userNotification = newNotification
        }
      }
    }
  }
  return userNotification
}