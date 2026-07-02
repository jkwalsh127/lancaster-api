

exports.FormatStreetAddress = async function (UnitPrefix, UnitNumber, StreetNumber, StreetDirPrefix, StreetName, StreetSuffix, StreetDirSuffix) {
  console.info(`********* Formatting Street Address`)
  
  let streetAddress = ''
  if (UnitPrefix) {
    if (UnitNumber) {
      if (StreetDirPrefix) {
        if (StreetSuffix) {
          if (StreetDirSuffix) {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${UnitNumber} ${StreetDirPrefix} ${StreetName} ${StreetSuffix} ${StreetDirSuffix}`
          } else {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${UnitNumber} ${StreetDirPrefix} ${StreetName} ${StreetSuffix}`
          }
        } else {
          if (StreetDirSuffix) {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${UnitNumber} ${StreetDirPrefix} ${StreetName} ${StreetDirSuffix}`
          } else {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${UnitNumber} ${StreetDirPrefix} ${StreetName}`
          }
        }
      } else {
        if (StreetSuffix) {
          if (StreetDirSuffix) {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${UnitNumber} ${StreetName} ${StreetSuffix} ${StreetDirSuffix}`
          } else {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${UnitNumber} ${StreetName} ${StreetSuffix}`
          }
        } else {
          if (StreetDirSuffix) {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${UnitNumber} ${StreetName} ${StreetDirSuffix}`
          } else {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${UnitNumber} ${StreetName}`
          }
        }
      }
    } else {
      if (StreetDirPrefix) {
        if (StreetSuffix) {
          if (StreetDirSuffix) {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${StreetDirPrefix} ${StreetName} ${StreetSuffix} ${StreetDirSuffix}`
          } else {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${StreetDirPrefix} ${StreetName} ${StreetSuffix}`
          }
        } else {
          if (StreetDirSuffix) {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${StreetDirPrefix} ${StreetName} ${StreetDirSuffix}`
          } else {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${StreetDirPrefix} ${StreetName}`
          }
        }
      } else {
        if (StreetSuffix) {
          if (StreetDirSuffix) {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${StreetName} ${StreetSuffix} ${StreetDirSuffix}`
          } else {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${StreetName} ${StreetSuffix}`
          }
        } else {
          if (StreetDirSuffix) {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${StreetName} ${StreetDirSuffix}`
          } else {
            streetAddress = `${StreetNumber} ${UnitPrefix} ${StreetName}`
          }
        }
      }
    }
  } else {
    if (UnitNumber) {
      if (StreetDirPrefix) {
        if (StreetSuffix) {
          if (StreetDirSuffix) {
            streetAddress = `${UnitNumber} ${StreetNumber} ${StreetDirPrefix} ${StreetName} ${StreetSuffix} ${StreetDirSuffix}`
          } else {
            streetAddress = `${UnitNumber} ${StreetNumber} ${StreetDirPrefix} ${StreetName} ${StreetSuffix}`
          }
        } else {
          if (StreetDirSuffix) {
            streetAddress = `${UnitNumber} ${StreetNumber} ${StreetDirPrefix} ${StreetName} ${StreetDirSuffix}`
          } else {
            streetAddress = `${UnitNumber} ${StreetNumber} ${StreetDirPrefix} ${StreetName}`
          }
        }
      } else {
        if (StreetSuffix) {
          if (StreetDirSuffix) {
            streetAddress = `${UnitNumber} ${StreetNumber} ${StreetName} ${StreetSuffix} ${StreetDirSuffix}`
          } else {
            streetAddress = `${UnitNumber} ${StreetNumber} ${StreetName} ${StreetSuffix}`
          }
        } else {
          if (StreetDirSuffix) {
            streetAddress = `${UnitNumber} ${StreetNumber} ${StreetName} ${StreetDirSuffix}`
          } else {
            streetAddress = `${UnitNumber} ${StreetNumber} ${StreetName}`
          }
        }
      }
    } else {
      if (StreetDirPrefix) {
        if (StreetSuffix) {
          if (StreetDirSuffix) {
            streetAddress = `${StreetNumber} ${StreetDirPrefix} ${StreetName} ${StreetSuffix} ${StreetDirSuffix}`
          } else {
            streetAddress = `${StreetNumber} ${StreetDirPrefix} ${StreetName} ${StreetSuffix}`
          }
        } else {
          if (StreetDirSuffix) {
            streetAddress = `${StreetNumber} ${StreetDirPrefix} ${StreetName} ${StreetDirSuffix}`
          } else {
            streetAddress = `${StreetNumber} ${StreetDirPrefix} ${StreetName}`
          }
        }
      } else {
        if (StreetSuffix) {
          if (StreetDirSuffix) {
            streetAddress = `${StreetNumber} ${StreetName} ${StreetSuffix} ${StreetDirSuffix}`
          } else {
            streetAddress = `${StreetNumber} ${StreetName} ${StreetSuffix}`
          }
        } else {
          if (StreetDirSuffix) {
            streetAddress = `${StreetNumber} ${StreetName} ${StreetDirSuffix}`
          } else {
            streetAddress = `${StreetNumber} ${StreetName}`
          }
        }
      }
    }
  }

  return streetAddress 
}