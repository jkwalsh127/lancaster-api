//* newObj = {discrepancy: bool, value: str/int, backup: str/int}
exports.mappingMortgage = async function (attomBool, clCurrentMortgageBool, attomValue, coreLogicValue) {
  let newObj = {
    discrepancy: false,
    value: null,
    backup: null,
  }
  let empty = false
  let backupOnly = false
  let noBackup = false
  let populated = false

  if (attomBool && clCurrentMortgageBool) {
    populated = true
    if (attomValue !== coreLogicValue) {
      newObj.discrepancy = true
    } else {
      newObj.discrepancy = false
    }
    newObj.value = coreLogicValue
    newObj.backup = attomValue
  } else if (clCurrentMortgageBool) {
    populated = true
    noBackup = true
    newObj.value = coreLogicValue
    newObj.backup = null
  } else if (attomBool) {
    populated = true
    backupOnly = true
    newObj.value = attomValue
    newObj.backup = null
  } else {
    empty = true
  }

  if (newObj.discrepancy) {
    // if (isNaN(parseInt(newObj.value))) {
    if (typeof newObj.value === 'string') {
      if ((newObj.value && newObj.value.length > 0) && (newObj.backup && newObj.backup.length > 0)) {
        if (newObj.value.toUpperCase() === newObj.backup.toUpperCase()) {
          newObj.discrepancy = false
          newObj.value = newObj.value.toUpperCase() 
          newObj.backup = newObj.backup.toUpperCase()
        } else {
          newObj.value = newObj.value.toUpperCase() 
          newObj.backup = newObj.backup.toUpperCase()
        }
      } else {
        newObj.discrepancy = false
        if ((newObj.value && newObj.value.length > 0)) {
          newObj.value = newObj.value.toUpperCase() 
        }
        if ((newObj.backup && newObj.backup.length > 0)) {
          newObj.backup = newObj.backup.toUpperCase()
        }
      }
    } else {
      if (parseInt(newObj.value) > 0 && parseInt(newObj.backup) > 0) {
        if (parseInt(newObj.value) === parseInt(newObj.backup)) {
          newObj.discrepancy = false
          newObj.value = parseInt(newObj.value)
          newObj.backup = parseInt(newObj.backup)
        } else {
          newObj.value = parseInt(newObj.value)
          newObj.backup = parseInt(newObj.backup)
        }
      } else {
        newObj.discrepancy = false
        if (parseInt(newObj.value) > 0) {
          newObj.value = parseInt(newObj.value) 
        }
        if (parseInt(newObj.backup) > 0) {
          newObj.backup = parseInt(newObj.backup)
        }
      }
    }
  }

  return {newObj, empty, backupOnly, noBackup, populated}
}

//* newObj = {discrepancy: bool, value: str/int, backup: str/int}
exports.mappingAttomT = async function (attomDataBool, propMixValue, attomValue, isString) {
  let newObj = {
    discrepancy: false,
    value: null,
    backup: null,
  }
  let empty = false
  let backupOnly = false
  let noBackup = false
  let populated = false
  if (propMixValue.length > 1) {
    if (attomDataBool) {
      if (attomValue !== propMixValue) {
        newObj.discrepancy = true
        if (attomValue && attomValue.length > 0) {
          populated = true
          newObj.value = attomValue
          newObj.backup = propMixValue
        } else {
          noBackup = true
          newObj.value = propMixValue
          newObj.backup = null
        }
      } else {
        populated = true
        newObj.discrepancy = false
        newObj.value = propMixValue
        newObj.backup = null
      }
    } else {
      noBackup = true
      newObj.discrepancy = false
      newObj.value = propMixValue
      newObj.backup = null
    }
  } else {
    if (attomDataBool && attomValue && attomValue.length > 0) {
      backupOnly = true
      newObj.discrepancy = false
      newObj.value = attomValue
      newObj.backup = null
    } else {
      empty = true
      newObj.discrepancy = false
      newObj.value = ''
      newObj.backup = null
    }
  }

  if (newObj.discrepancy) {
    if (isNaN(parseInt(newObj.value)) || isString) {
      if ((newObj.value && newObj.value.length > 0) && (newObj.backup && newObj.backup.length > 0)) {
        if (newObj.value.toUpperCase() === newObj.backup.toUpperCase()) {
          newObj.discrepancy = false
          newObj.value = newObj.value.toUpperCase() 
          newObj.backup = newObj.backup.toUpperCase()
        } else {
          newObj.value = newObj.value.toUpperCase() 
          newObj.backup = newObj.backup.toUpperCase()
        }
      } else {
        newObj.discrepancy = false
        if ((newObj.value && newObj.value.length > 0)) {
          newObj.value = newObj.value.toUpperCase() 
        }
        if ((newObj.backup && newObj.backup.length > 0)) {
          newObj.backup = newObj.backup.toUpperCase()
        }
      }
    } else {
      if (parseInt(newObj.value) > 0 && parseInt(newObj.backup) > 0) {
        if (parseInt(newObj.value) === parseInt(newObj.backup)) {
          newObj.discrepancy = false
          newObj.value = parseInt(newObj.value)
          newObj.backup = parseInt(newObj.backup)
        } else {
          newObj.value = parseInt(newObj.value)
          newObj.backup = parseInt(newObj.backup)
        }
      } else {
        newObj.discrepancy = false
        if (parseInt(newObj.value) > 0) {
          newObj.value = parseInt(newObj.value) 
        }
        if (parseInt(newObj.backup) > 0) {
          newObj.backup = parseInt(newObj.backup)
        }
      }
    }
  }
  
  return {newObj, empty, backupOnly, noBackup, populated}
}

//* newObj = {discrepancy: bool, value: str/int, backup: str/int}
exports.mappingPropMixT = async function (attomDataBool, propMixValue, attomValue) {
  let newObj = {
    discrepancy: false,
    value: null,
    backup: null,
  }
  let empty = false
  let backupOnly = false
  let noBackup = false
  let populated = false
  if (propMixValue.length > 0) {
    if (attomDataBool) {
      if (attomValue !== propMixValue) {
        newObj.discrepancy = true
        if (attomValue && attomValue.length > 0) {
          populated = true
          newObj.value = propMixValue
          newObj.backup = attomValue
        } else {
          noBackup = true
          newObj.value = propMixValue
          newObj.backup = null
        }
      } else {
        populated = true
        newObj.discrepancy = false
        newObj.value = propMixValue
        newObj.backup = null
      }
    } else {
      noBackup = true
      newObj.discrepancy = false
      newObj.value = propMixValue
      newObj.backup = null
    }
  } else {
    if (attomDataBool && attomValue && attomValue.length > 1) {
      backupOnly = true
      newObj.discrepancy = false
      newObj.value = attomValue
      newObj.backup = null
    } else {
      empty = true
      newObj.discrepancy = false
      newObj.value = ''
      newObj.backup = null
    }
  }

  if (newObj.discrepancy) {
    if (typeof newObj.value === 'string') {
      if ((newObj.value && newObj.value.length > 0) && (newObj.backup && newObj.backup.length > 0)) {
        if (newObj.value.toUpperCase() === newObj.backup.toUpperCase()) {
          newObj.discrepancy = false
          newObj.value = newObj.value.toUpperCase()
          newObj.backup = newObj.backup.toUpperCase()
        } else {
          newObj.value = newObj.value.toUpperCase() 
          newObj.backup = newObj.backup.toUpperCase()
        }
      } else {
        newObj.discrepancy = false
        if ((newObj.value && newObj.value.length > 0)) {
          newObj.value = newObj.value.toUpperCase() 
        }
        if ((newObj.backup && newObj.backup.length > 0)) {
          newObj.backup = newObj.backup.toUpperCase()
        }
      }
    } else {
      if (parseInt(newObj.value) > 0 && parseInt(newObj.backup) > 0) {
        if (parseInt(newObj.value) === parseInt(newObj.backup)) {
          newObj.discrepancy = false
          newObj.value = parseInt(newObj.value)
          newObj.backup = parseInt(newObj.backup)
        } else {
          newObj.value = parseInt(newObj.value)
          newObj.backup = parseInt(newObj.backup)
        }
      } else {
        newObj.discrepancy = false
        if (parseInt(newObj.value) > 0) {
          newObj.value = parseInt(newObj.value) 
        }
        if (parseInt(newObj.backup) > 0) {
          newObj.backup = parseInt(newObj.backup)
        }
      }
    }
  }
  // if (newObj.discrepancy) {
  //   if (isNaN(parseInt(newObj.value))) {
  //     if ((newObj.value && newObj.value.length > 0) && (newObj.backup && newObj.backup.length > 0)) {
  //       if (newObj.value.toUpperCase() === newObj.backup.toUpperCase()) {
  //         newObj.discrepancy = false
  //         newObj.value = newObj.value.toUpperCase()
  //         newObj.backup = newObj.backup.toUpperCase()
  //       } else {
  //         newObj.value = newObj.value.toUpperCase() 
  //         newObj.backup = newObj.backup.toUpperCase()
  //       }
  //     } else {
  //       newObj.discrepancy = false
  //       if ((newObj.value && newObj.value.length > 0)) {
  //         newObj.value = newObj.value.toUpperCase() 
  //       }
  //       if ((newObj.backup && newObj.backup.length > 0)) {
  //         newObj.backup = newObj.backup.toUpperCase()
  //       }
  //     }
  //   } else {
  //     if (parseInt(newObj.value) > 0 && parseInt(newObj.backup) > 0) {
  //       if (parseInt(newObj.value) === parseInt(newObj.backup)) {
  //         newObj.discrepancy = false
  //         newObj.value = parseInt(newObj.value)
  //         newObj.backup = parseInt(newObj.backup)
  //       } else {
  //         newObj.value = parseInt(newObj.value)
  //         newObj.backup = parseInt(newObj.backup)
  //       }
  //     } else {
  //       newObj.discrepancy = false
  //       if (parseInt(newObj.value) > 0) {
  //         newObj.value = parseInt(newObj.value) 
  //       }
  //       if (parseInt(newObj.backup) > 0) {
  //         newObj.backup = parseInt(newObj.backup)
  //       }
  //     }
  //   }
  // }
  
  return {newObj, empty, backupOnly, noBackup, populated}
}

//* newObj = {discrepancy: bool, value: str/int, backup: str/int}
exports.mappingPropMixTT = async function (attomDataBool, propMixValue, attomValue, backupValue) {
  let newObj = {
    discrepancy: false,
    value: null,
    backup: null,
  }
  let empty = false
  let backupOnly = false
  let noBackup = false
  let populated = false
  if (propMixValue.length > 1) {
    if (attomDataBool) {
      if (attomValue !== propMixValue) {
        if (backupValue !== propMixValue) {
          newObj.discrepancy = true
          if (attomValue && attomValue.length > 0) {
            populated = true
            newObj.value = propMixValue
            newObj.backup = attomValue
          } else if (backupValue.length > 0) {
            populated = true
            newObj.value = propMixValue
            newObj.backup = backupValue
          } else {
            noBackup = true
            newObj.value = propMixValue
            newObj.backup = null
          }
        } else {
          populated = true
          newObj.discrepancy = false
          newObj.value = propMixValue
          newObj.backup = null
        }
      } else {
        populated = true
        newObj.discrepancy = false
        newObj.value = propMixValue
        newObj.backup = null
      }
    } else {
      if (backupValue && backupValue.length > 1) {
        populated = true
        newObj.discrepancy = false
        newObj.value = propMixValue
        newObj.backup = backupValue
      } else {
        noBackup = true
        newObj.discrepancy = false
        newObj.value = propMixValue
        newObj.backup = null
      }
    }
  } else if (attomDataBool && attomValue && attomValue.length > 0) {
    if (backupValue.length > 0) {
      backupOnly = true
      newObj.discrepancy = false
      newObj.value = attomValue
      newObj.backup = backupValue
    } else {
      backupOnly = true
      newObj.discrepancy = false
      newObj.value = attomValue
      newObj.backup = null
    }
  } else if (backupValue && backupValue.length > 0) {
    backupOnly = true
    newObj.discrepancy = false
    newObj.value = backupValue
    newObj.backup = null
  } else {
    empty = true
    newObj.discrepancy = false
    newObj.value = ''
    newObj.backup = null
  }
  
  if (newObj.discrepancy) {
    // if (isNaN(parseInt(newObj.value))) {
    if (typeof newObj.value === 'string') {
      if ((newObj.value && newObj.value.length > 0) && (newObj.backup && newObj.backup.length > 0)) {
        if (newObj.value.toUpperCase() === newObj.backup.toUpperCase()) {
          newObj.discrepancy = false
          newObj.value = newObj.value.toUpperCase() 
          newObj.backup = newObj.backup.toUpperCase()
        } else {
          newObj.value = newObj.value.toUpperCase() 
          newObj.backup = newObj.backup.toUpperCase()
        }
      } else {
        newObj.discrepancy = false
        if ((newObj.value && newObj.value.length > 0)) {
          newObj.value = newObj.value.toUpperCase() 
        }
        if ((newObj.backup && newObj.backup.length > 0)) {
          newObj.backup = newObj.backup.toUpperCase()
        }
      }
    } else {
      if (parseInt(newObj.value) > 0 && parseInt(newObj.backup) > 0) {
        if (parseInt(newObj.value) === parseInt(newObj.backup)) {
          newObj.discrepancy = false
          newObj.value = parseInt(newObj.value)
          newObj.backup = parseInt(newObj.backup)
        } else {
          newObj.value = parseInt(newObj.value)
          newObj.backup = parseInt(newObj.backup)
        }
      } else {
        newObj.discrepancy = false
        if (parseInt(newObj.value) > 0) {
          newObj.value = parseInt(newObj.value) 
        }
        if (parseInt(newObj.backup) > 0) {
          newObj.backup = parseInt(newObj.backup)
        }
      }
    }
  }

  return {newObj, empty, backupOnly, noBackup, populated}
};