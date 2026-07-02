const moment = require('moment');
const UserModel = require('../../models/user');
const TeamModel = require('../../models/team');
const ReportModel = require('../../models/report');
const MortgageModel = require('../../models/mortgage');
const ActiveLeadModel = require('../../models/activeLead');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function deleteMortgage(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info(`*** ${req.body.userFullName} is:`)
    console.info('*** Deleting the mortgage')
    console.info(`mortgageID: ${req.body.mortgageId}`)
    let todaysDate = moment(new Date())
    console.info(`Time: ${todaysDate}`)

    let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
    let mortgageId = req.body.mortgageId
    let reportIds = []
    let assigneeIds = []
    let mortgageNotFound = false
    let leadStatus = ''
    let leadId = '0000000000000000000000000'
    if (mortgageId) {
      let mortgage = await MortgageModel.findById(mortgageId)
      if (mortgage) {

        for (let i = 0; i < mortgage.reports.length; i++) {
          let report = await ReportModel.findByIdAndUpdate((mortgage.reports[i]), {
            isActive: false,
            dateDeleted: todaysDate,
          })
        }

        if (mortgage.activeLead) {
          let activeLead = await ActiveLeadModel.findById(mortgage.activeLead)
          leadId = activeLead._id
          leadStatus = activeLead.status
          assigneeIds = activeLead.assigneeIds
          await ActiveLeadModel.findByIdAndUpdate((leadId), {
            isActive: false,
            dateDeleted: todaysDate,
          })
          for (let i = 0; i < assigneeIds.length; i++) {
            let user = await UserModel.findById(activeLead.assigneeIds[i])
            await user.updateOne({
              $pull: {
                newReports: { $in: reportIds },
                awaitingActionLeads: leadId,
                investigatingLeads: leadId,
                closingLeads: leadId,
              }
            })
          }

          await TeamModel.findByIdAndUpdate((req.body.teamId), {
            $pull: {
              mortgages: mortgageId,
              reports: reportIds,
              inavtiveLeads: mortgageId,
              leadsAwaitingAction: leadId,
              investigatingLeads: leadId,
              closingLeads: leadId,
            }
          })
        } else {
          await TeamModel.findByIdAndUpdate((req.body.teamId), {
            $pull: {
              mortgages: mortgageId,
              reports: reportIds,
              inavtiveLeads: mortgageId,
            }
          })
        }
        await mortgage.deleteOne()
      } else {
        mortgageNotFound = true
      }
    } else {
      mortgageNotFound = true
    }

    let newLog = await handleRequestLog('Log', logTime, 'Mortgage Deleted', 'Mortgages', [{type: 'Mortgage ID', detail: mortgageId}], 'success', false, req.body.userFullName)
    sendApiSuccessResponse(res, {leadId, assigneeIds, leadStatus, mortgageId, reportIds, newLog, mortgageNotFound}, 'update successful');
    console.info("*** Success")
    console.info('')
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    let newLog = await handleRequestLog('Error', errorTime, 'API Request Error', 'Mortgages', [{type: 'Delete Mortgage'}], error, true, req.body.userFullName)
    sendApiErrorResponse(res, newLog, error)
  }
}

module.exports = { deleteMortgage }