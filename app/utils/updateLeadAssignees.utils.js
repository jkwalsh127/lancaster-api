const UserModel = require('../models/user');

exports.updateLeadAssignees = async function (newAssigneeIds, removedAssigneeIds, leadId, leadStatus) {
  for (let i = 0; i < newAssigneeIds.length; i++) {
    if (leadStatus === 'awaitingAction') {
      await UserModel.findByIdAndUpdate((newAssigneeIds[i]), {
        $push: { 
          awaitingActionLeads: {
            $each: [ leadId ],
            $position: 0
          },
        },
      })
    } else if (leadStatus === 'investigating') {
      await UserModel.findByIdAndUpdate((newAssigneeIds[i]), {
        $push: { 
          investigatingLeads: {
            $each: [ leadId ],
            $position: 0
          },
        },
      })
    } else if (leadStatus === 'closing') {
      await UserModel.findByIdAndUpdate((newAssigneeIds[i]), {
        $push: {
          closingLeads: {
            $each: [ leadId ],
            $position: 0
          },
        },
      })
    } else if (leadStatus === 'awaitingUpdate') {
      await UserModel.findByIdAndUpdate((newAssigneeIds[i]), {
        $push: {
          awaitingUpdateLeads: {
            $each: [ leadId ],
            $position: 0
          },
        },
      })
    }
  }

  for (let i = 0; i < removedAssigneeIds.length; i++) {
    if (leadStatus === 'awaitingAction') {
      await UserModel.findByIdAndUpdate((removedAssigneeIds[i]), {
        $pull: { 
          awaitingActionLeads: leadId,
        },
      })
    } else if (leadStatus === 'investigating') {
      await UserModel.findByIdAndUpdate((removedAssigneeIds[i]), {
        $pull: { 
          investigatingLeads: leadId,
        },
      })
    } else if (leadStatus === 'closing') {
      await UserModel.findByIdAndUpdate((removedAssigneeIds[i]), {
        $pull: { 
          closingLeads: leadId,
        },
      })
    } else if (leadStatus === 'awaitingUpdate') {
      await UserModel.findByIdAndUpdate((removedAssigneeIds[i]), {
        $pull: { 
          awaitingUpdateLeads: leadId,
        },
      })
    }
  }

  return
}