const UserModel = require('../models/user');

exports.updateLeadStatus = async function (assigneeIds, leadId, newLeadStatus) {
  for (let i = 0; i < assigneeIds.length; i++) {
    if (newLeadStatus === 'investigating') {
      await UserModel.findByIdAndUpdate((assigneeIds[i]), {
        $push: { 
          investigatingLeads: {
            $each: [ leadId ],
            $position: 0
          },
        },
        $pull: { awaitingActionLeads: leadId }
      })
    } else if (newLeadStatus === 'closing') {
      await UserModel.findByIdAndUpdate((assigneeIds[i]), {
        $push: {
          closingLeads: {
            $each: [ leadId ],
            $position: 0
          },
        },
        $pull: { investigatingLeads: leadId }
      })
    } else if (newLeadStatus === 'awaitingUpdate') {
      await UserModel.findByIdAndUpdate((assigneeIds[i]), {
        $push: {
          awaitingUpdateLeads: {
            $each: [ leadId ],
            $position: 0
          },
        },
        $pull: { closingLeads: leadId }
      })
    }
  }
  return
}