const formatFields = async function (uploadType, StreetNumber, StreetDirPrefix, StreetName, StreetSuffix, StreetDirSuffix, UnitPrefix, UnitNumber, City, StateOrProvince, PostalCode, PostalCodePlus4, ParcelNumber, PropertyType, TaxLot, Owner1FullName, Owner2FullName, OwnerOccupied, Owner1IsCorporation, Owner2IsCorporation) {
  let isError = false
  let fields = {}
  let errors = [] 

  if (StreetNumber) {
    while (isNaN(StreetNumber[0])) {
      StreetNumber = StreetNumber.slice(1)
    }
    if (isNaN(StreetNumber)) {
      let streetNumberInt = StreetNumber.replace("-", "")
      if (isNaN(streetNumberInt)) {
        errors.push({
          description: 'Street Number is NaN: ' + StreetNumber,
        })
        isError = true
      }
    }
    if (StreetNumber.length === 0) {
      errors.push({
        description: 'Street Number is empty',
      })
      isError = true
    }
    fields.StreetNumber = StreetNumber
  }
  if (StreetDirPrefix) {
    StreetDirPrefix = StreetDirPrefix.trim().toUpperCase()
    fields.StreetDirPrefix = StreetDirPrefix
  }
  if (StreetName) {
    StreetName = StreetName.trim().toUpperCase()
    fields.StreetName = StreetName
  }
  if (StreetSuffix) {
    let format = await formatStreetSuffix(StreetSuffix, 'formatting')
    if (format.isError) {
      errors.push(...format.errors)
    } else {
      fields.StreetSuffix = format.StreetSuffix
    }
  }
  if (StreetDirSuffix) {
    StreetDirSuffix = StreetDirSuffix.trim().toUpperCase()
    if (!isNaN(StreetDirSuffix)) {
      errors.push({
        description: 'Street Dir Suffix is Number: ' + StreetDirSuffix,
      })
      isError = true
    }
    fields.StreetDirSuffix = StreetDirSuffix
  }
  if (UnitPrefix) {
    UnitPrefix = UnitPrefix.trim().toUpperCase()
    if (!isNaN(UnitPrefix)) {
      errors.push({
        description: 'Unit Prefix is Number: ' + UnitPrefix,
      })
      isError = true
    }
    fields.UnitPrefix = UnitPrefix
  }
  if (UnitNumber) {
    UnitNumber = UnitNumber.trimStart()
    fields.UnitNumber = UnitNumber
  }
  if (City) {
    City = City.trim().toUpperCase()
    if (!isNaN(City)) {
      errors.push({
        description: 'City is Number: ' + City,
      })
      isError = true
    }
    fields.City = City
  }
  if (StateOrProvince) {
    if (!isNaN(StateOrProvince)) {
      errors.push({
        description: 'State is Number: ' + StateOrProvince,
      })
      isError = true
    } else {
      StateOrProvince = StateOrProvince.trim().toUpperCase()
      if (StateOrProvince === 'ALABAMA' || StateOrProvince === 'AL') {
        StateOrProvince = 'AL'
      } else if (StateOrProvince === 'ALASKA' || StateOrProvince === 'AK') {
        StateOrProvince = 'AK'
      } else if (StateOrProvince === 'ARIZONA' || StateOrProvince === 'AZ') {
        StateOrProvince = 'AZ'
      } else if (StateOrProvince === 'ARKANSAS' || StateOrProvince === 'AR') {
        StateOrProvince = 'AK'
      } else if (StateOrProvince === 'AMERICAN SAMOA' || StateOrProvince === 'AS') {
        StateOrProvince = 'AS'
      } else if (StateOrProvince === 'CALIFORNIA' || StateOrProvince === 'CA') {
        StateOrProvince = 'CA'
      } else if (StateOrProvince === 'COLORADO' || StateOrProvince === 'CO') {
        StateOrProvince = 'CO'
      } else if (StateOrProvince === 'CONNECTICUT' || StateOrProvince === 'CT') {
        StateOrProvince = 'CT'
      } else if (StateOrProvince === 'DELAWARE' || StateOrProvince === 'DE') {
        StateOrProvince = 'DE'
      } else if (StateOrProvince === 'DISTRICT OF COLUMBIA' || StateOrProvince === 'DC') {
        StateOrProvince = 'DC'
      } else if (StateOrProvince === 'FLORIDA' || StateOrProvince === 'FL') {
        StateOrProvince = 'FL'
      } else if (StateOrProvince === 'GEORGIA' || StateOrProvince === 'GA') {
        StateOrProvince = 'GA'
      } else if (StateOrProvince === 'GUAM' || StateOrProvince === 'GU') {
        StateOrProvince = 'GU'
      } else if (StateOrProvince === 'HAWAII' || StateOrProvince === 'HI') {
        StateOrProvince = 'HI'
      } else if (StateOrProvince === 'IDAHO' || StateOrProvince === 'ID') {
        StateOrProvince = 'ID'
      } else if (StateOrProvince === 'ILLINOIS' || StateOrProvince === 'IL') {
        StateOrProvince = 'IL'
      } else if (StateOrProvince === 'INDIANA' || StateOrProvince === 'IN') {
        StateOrProvince = 'IN'
      } else if (StateOrProvince === 'IOWA' || StateOrProvince === 'IA') {
        StateOrProvince = 'IA'
      } else if (StateOrProvince === 'KANSAS' || StateOrProvince === 'KS') {
        StateOrProvince = 'KS'
      } else if (StateOrProvince === 'KENTUCKY' || StateOrProvince === 'KY') {
        StateOrProvince = 'KY'
      } else if (StateOrProvince === 'LOUSIANA' || StateOrProvince === 'LA') {
        StateOrProvince = 'LA'
      } else if (StateOrProvince === 'MAINE' || StateOrProvince === 'ME') {
        StateOrProvince = 'ME'
      } else if (StateOrProvince === 'MARYLAND' || StateOrProvince === 'MD') {
        StateOrProvince = 'MD'
      } else if (StateOrProvince === 'MASSACHUSETTS' || StateOrProvince === 'MA') {
        StateOrProvince = 'MA'
      } else if (StateOrProvince === 'MICHIGAN' || StateOrProvince === 'MI') {
        StateOrProvince = 'MI'
      } else if (StateOrProvince === 'MINNESOTA' || StateOrProvince === 'MN') {
        StateOrProvince = 'MN'
      } else if (StateOrProvince === 'MISSISSIPPI' || StateOrProvince === 'MS') {
        StateOrProvince = 'MS'
      } else if (StateOrProvince === 'MISSOURI' || StateOrProvince === 'MO') {
        StateOrProvince = 'MO'
      } else if (StateOrProvince === 'MONTANA' || StateOrProvince === 'MT') {
        StateOrProvince = 'MT'
      } else if (StateOrProvince === 'NEBRASKA' || StateOrProvince === 'NE') {
        StateOrProvince = 'NE'
      } else if (StateOrProvince === 'NEVADA' || StateOrProvince === 'NV') {
        StateOrProvince = 'NV'
      } else if (StateOrProvince === 'NEW HAMPSHIRE' || StateOrProvince === 'NH') {
        StateOrProvince = 'NH'
      } else if (StateOrProvince === 'NEW JERSEY' || StateOrProvince === 'NJ') {
        StateOrProvince = 'NJ'
      } else if (StateOrProvince === 'NEW MEXICO' || StateOrProvince === 'NM') {
        StateOrProvince = 'NN'
      } else if (StateOrProvince === 'NEW YORK' || StateOrProvince === 'NY') {
        StateOrProvince = 'NY'
      } else if (StateOrProvince === 'NORTH CAROLINA' || StateOrProvince === 'NC') {
        StateOrProvince = 'NC'
      } else if (StateOrProvince === 'NORTH DAKOTA' || StateOrProvince === 'ND') {
        StateOrProvince = 'ND'
      } else if (StateOrProvince === 'NORTHERN MARIANA ISLANDS' || StateOrProvince === 'MP') {
        StateOrProvince = 'MP'
      } else if (StateOrProvince === 'OHIO' || StateOrProvince === 'OH') {
        StateOrProvince = 'OH'
      } else if (StateOrProvince === 'OKLAHOMA' || StateOrProvince === 'OK') {
        StateOrProvince = 'OK'
      } else if (StateOrProvince === 'OREGON' || StateOrProvince === 'OR') {
        StateOrProvince = 'OR'
      } else if (StateOrProvince === 'PENNSYLVANIA' || StateOrProvince === 'PA') {
        StateOrProvince = 'PA'
      } else if (StateOrProvince === 'PUERTO RICO' || StateOrProvince === 'PR') {
        StateOrProvince = 'PR'
      } else if (StateOrProvince === 'RHODE ISLAND' || StateOrProvince === 'RI') {
        StateOrProvince = 'RI'
      } else if (StateOrProvince === 'SOUTH CAROLINA' || StateOrProvince === 'SC') {
        StateOrProvince = 'SC'
      } else if (StateOrProvince === 'SOUTH DAKOTA' || StateOrProvince === 'SD') {
        StateOrProvince = 'SD'
      } else if (StateOrProvince === 'TENNESSEE' || StateOrProvince === 'TN') {
        StateOrProvince = 'TN'
      } else if (StateOrProvince === 'TEXAS' || StateOrProvince === 'TX') {
        StateOrProvince = 'TX'
      } else if (StateOrProvince === 'TRUST TERRITORIES' || StateOrProvince === 'TT') {
        StateOrProvince = 'TT'
      } else if (StateOrProvince === 'UTAH' || StateOrProvince === 'UT') {
        StateOrProvince = 'UT'
      } else if (StateOrProvince === 'VERMONT' || StateOrProvince === 'VT') {
        StateOrProvince = 'VT'
      } else if (StateOrProvince === 'VIRGINIA' || StateOrProvince === 'VA') {
        StateOrProvince = 'VA'
      } else if (StateOrProvince === 'VIRGIN ISLANDS' || StateOrProvince === 'VI') {
        StateOrProvince = 'VI'
      } else if (StateOrProvince === 'WASHINGTON' || StateOrProvince === 'WA') {
        StateOrProvince = 'WA'
      } else if (StateOrProvince === 'WEST VIRGINIA' || StateOrProvince === 'WV') {
        StateOrProvince = 'WV'
      } else if (StateOrProvince === 'WISCONSIN' || StateOrProvince === 'WI') {
        StateOrProvince = 'WI'
      } else if (StateOrProvince === 'WYOMING' || StateOrProvince === 'WY') {
        StateOrProvince = 'WY'
      } else {
        errors.push({
          description: 'Unexpected State or Province: ' + StateOrProvince,
        })
        isError = true
      }
    }
    fields.StateOrProvince = StateOrProvince
  }
  if (PostalCode) {
    PostalCode = PostalCode.trimStart()
    if (PostalCode.length !== 5 || isNaN(PostalCode)) {
      if (PostalCode.length !== 5) {
        errors.push({
          description: 'Postal Code Length: ' + PostalCode,
        })
        isError = true
      } 
      if (isNaN(PostalCode)) {
        errors.push({
          description: 'Postal Code is NaN: ' + PostalCode,
        })
        isError = true
      }
    }
    fields.PostalCode = PostalCode
  }
  if (PostalCodePlus4) {
    PostalCodePlus4 = PostalCodePlus4.trimStart()
    if (PostalCodePlus4.length !== 4 || isNaN(PostalCodePlus4)) {
      if (PostalCodePlus4.length !== 4) {
        errors.push({
          description: 'Postal Code Plus 4 Length: ' + PostalCode,
        })
        isError = true
      } 
      if (isNaN(PostalCodePlus4)) {
        errors.push({
          description: 'Postal Code Plus 4 is NaN: ' + PostalCode,
        })
        isError = true
      }
    }
    fields.PostalCodePlus4 = PostalCodePlus4
  }

  if (ParcelNumber) {
    fields.ParcelNumber = ParcelNumber.trim().toUpperCase()
  }
  if (PropertyType) {
    fields.PropertyType = PropertyType.trim().toUpperCase()
  }
  if (TaxLot) {
    fields.TaxLot = TaxLot.trim()
  }
  if (Owner1FullName) {
    fields.Owner1FullName = Owner1FullName.trim().toUpperCase()
  }
  if (Owner2FullName) {
    fields.Owner2FullName = Owner2FullName.trim().toUpperCase()
  }
  if (OwnerOccupied) {
    fields.OwnerOccupied = OwnerOccupied.trim().toUpperCase()
  }
  if (Owner1IsCorporation) {
    fields.Owner1IsCorporation = Owner1IsCorporation.trim().toUpperCase()
  }
  if (Owner2IsCorporation) {
    fields.Owner2IsCorporation = Owner2IsCorporation.trim().toUpperCase()
  }

  let presentFields = 'Present: '
  if (uploadType === 'type1') {
    if (StreetNumber) {
      presentFields = presentFields + StreetNumber + ' '
    }
    if (StreetName) {
      presentFields = presentFields + StreetName + ' '
    }
  } else if (uploadType === 'type2') {
    if (StreetNumber) {
      presentFields = presentFields + StreetNumber + ' '
    }
    if (StreetName) {
      presentFields = presentFields + StreetName + ' '
    }
    if (StreetSuffix) {
      presentFields = presentFields + StreetSuffix + ' '
    }
  } else if (uploadType === 'type3') {
    if (StreetNumber) {
      presentFields = presentFields + StreetNumber + ' '
    }
    if (StreetDirPrefix) {
      presentFields = presentFields + StreetDirPrefix + ' '
    }
    if (StreetName) {
      presentFields = presentFields + StreetName + ' '
    }
  } else if (uploadType === 'type4') {
    if (StreetNumber) {
      presentFields = presentFields + StreetNumber + ' '
    }
    if (StreetDirPrefix) {
      presentFields = presentFields + StreetDirPrefix + ' '
    }
    if (StreetName) {
      presentFields = presentFields + StreetName + ' '
    }
    if (StreetSuffix) {
      presentFields = presentFields + StreetSuffix + ' '
    }
  } else if (uploadType === 'type5') {
    if (StreetNumber) {
      presentFields = presentFields + StreetNumber + ' '
    }
    if (StreetName) {
      presentFields = presentFields + StreetName + ' '
    }
    if (StreetDirSuffix) {
      presentFields = presentFields + StreetDirSuffix + ' '
    }
  } else if (uploadType === 'type6') {
    if (StreetNumber) {
      presentFields = presentFields + StreetNumber + ' '
    }
    if (StreetName) {
      presentFields = presentFields + StreetName + ' '
    }
    if (StreetDirSuffix) {
      presentFields = presentFields + StreetDirSuffix + ' '
    }
    if (StreetSuffix) {
      presentFields = presentFields + StreetSuffix + ' '
    }
  } else if (uploadType === 'type7') {
    if (StreetNumber) {
      presentFields = presentFields + StreetNumber + ' '
    }
    if (StreetName) {
      presentFields = presentFields + StreetName + ' '
    }
    if (UnitPrefix) {
      presentFields = presentFields + UnitPrefix + ' '
    }
    if (UnitNumber) {
      presentFields = presentFields + UnitNumber + ' '
    }
  } else if (uploadType === 'type8') {
    if (StreetNumber) {
      presentFields = presentFields + StreetNumber + ' '
    }
    if (StreetName) {
      presentFields = presentFields + StreetName + ' '
    }
    if (StreetSuffix) {
      presentFields = presentFields + StreetSuffix + ' '
    }
    if (UnitPrefix) {
      presentFields = presentFields + UnitPrefix + ' '
    }
    if (UnitNumber) {
      presentFields = presentFields + UnitNumber + ' '
    }
  } else if (uploadType === 'type9') {
    if (StreetNumber) {
      presentFields = presentFields + StreetNumber + ' '
    }
    if (StreetDirPrefix) {
      presentFields = presentFields + StreetDirPrefix + ' '
    }
    if (StreetName) {
      presentFields = presentFields + StreetName + ' '
    }
    if (UnitPrefix) {
      presentFields = presentFields + UnitPrefix + ' '
    }
    if (UnitNumber) {
      presentFields = presentFields + UnitNumber + ' '
    }
  } else if (uploadType === 'type10') {
    if (StreetNumber) {
      presentFields = presentFields + StreetNumber + ' '
    }
    if (StreetDirPrefix) {
      presentFields = presentFields + StreetDirPrefix + ' '
    }
    if (StreetName) {
      presentFields = presentFields + StreetName + ' '
    }
    if (StreetSuffix) {
      presentFields = presentFields + StreetSuffix + ' '
    }
    if (UnitPrefix) {
      presentFields = presentFields + UnitPrefix + ' '
    }
    if (UnitNumber) {
      presentFields = presentFields + UnitNumber + ' '
    }
  } else if (uploadType === 'type11') {
    if (StreetNumber) {
      presentFields = presentFields + StreetNumber + ' '
    }
    if (StreetName) {
      presentFields = presentFields + StreetName + ' '
    }
    if (StreetDirSuffix) {
      presentFields = presentFields + StreetDirSuffix + ' '
    }
    if (StreetSuffix) {
      presentFields = presentFields + StreetSuffix + ' '
    }
    if (UnitPrefix) {
      presentFields = presentFields + UnitPrefix + ' '
    }
    if (UnitNumber) {
      presentFields = presentFields + UnitNumber + ' '
    }
  }
  if (City) {
    presentFields = presentFields + City + ' '
  }
  if (StateOrProvince) {
    presentFields = presentFields + StateOrProvince + ' '
  }
  if (PostalCode) {
    presentFields = presentFields + PostalCode + ' '
  }

  return { fields, errors, isError, presentFields };
};

const formatStreetSuffix = async function ( StreetSuffix, origin ) {
  let errors = []
  let isError = false
  if (typeof StreetSuffix !== 'string') {
    errors.push({
      description: 'Street Suffix is Number: ' + StreetSuffix,
    })
    isError = true
  } else {
    StreetSuffix = StreetSuffix.trim().toUpperCase()
    if (StreetSuffix === 'ALLEY' || StreetSuffix === 'ALLEE' || StreetSuffix === 'ALLY' || StreetSuffix === 'ALY') {
      StreetSuffix = 'ALLEY'
    } else if (StreetSuffix === 'ANNEX' || StreetSuffix === 'ANEX' || StreetSuffix === 'ANNX' || StreetSuffix === 'ANX') {
      StreetSuffix = 'ANNEX'
    } else if (StreetSuffix === 'ARCADE' || StreetSuffix === 'ARC') {
      StreetSuffix = 'ARCADE'
    } else if (StreetSuffix === 'AVENUE' || StreetSuffix === 'AV' || StreetSuffix === 'AVE' || StreetSuffix === 'AVEN' || StreetSuffix === 'AVENU' || StreetSuffix === 'AVN' || StreetSuffix === 'AVNUE') {
      StreetSuffix = 'AVENUE'
    } else if (StreetSuffix === 'BAYOU' || StreetSuffix === 'BAYOO' || StreetSuffix === 'BYU') {
      StreetSuffix = 'BAYOU'
    } else if (StreetSuffix === 'BEACH' || StreetSuffix === 'BCH') {
      StreetSuffix = 'BEACH'
    } else if (StreetSuffix === 'BEND' || StreetSuffix === 'BND') {
      StreetSuffix = 'BEND'
    } else if (StreetSuffix === 'BLUFF' || StreetSuffix === 'BLUF' || StreetSuffix === 'BLF') {
      StreetSuffix = 'BLUFF'
    } else if (StreetSuffix === 'BLUFFS' || StreetSuffix === 'BLFS') {
      StreetSuffix = 'BLUFFS'
    } else if (StreetSuffix === 'BOTTOM' || StreetSuffix === 'BOT' || StreetSuffix === 'BOTTM' || StreetSuffix === 'BTM') {
      StreetSuffix = 'BOTTOM'
    } else if (StreetSuffix === 'BOULEVARD' || StreetSuffix === 'BOUL' || StreetSuffix === 'BOULV' || StreetSuffix === 'BLVD') {
      StreetSuffix = 'BOULEVARD'
    } else if (StreetSuffix === 'BRANCH' || StreetSuffix === 'BRNCH' || StreetSuffix === 'BR') {
      StreetSuffix = 'BRANCH'
    } else if (StreetSuffix === 'BRIDGE' || StreetSuffix === 'BRDGE' || StreetSuffix === 'BRG') {
      StreetSuffix = 'BRIDGE'
    } else if (StreetSuffix === 'BROOK' || StreetSuffix === 'BRK') {
      StreetSuffix = 'BROOK'
    } else if (StreetSuffix === 'BROOKS' || StreetSuffix === 'BRKS') {
      StreetSuffix = 'BROOKS'
    } else if (StreetSuffix === 'BURG' || StreetSuffix === 'BG') {
      StreetSuffix = 'BURG'
    } else if (StreetSuffix === 'BURGS' || StreetSuffix === 'BGS') {
      StreetSuffix = 'BURGS'
    } else if (StreetSuffix === 'BYPASS' || StreetSuffix === 'BYPA' || StreetSuffix === 'BYPAS' || StreetSuffix === 'BYPS' || StreetSuffix === 'BYP') {
      StreetSuffix = 'BYPASS'
    } else if (StreetSuffix === 'CAMP' || StreetSuffix === 'CMP' || StreetSuffix === 'CP') {
      StreetSuffix = 'CAMP'
    } else if (StreetSuffix === 'CANYON' || StreetSuffix === 'CANYN' || StreetSuffix === 'CNYN' || StreetSuffix === 'CYN') {
      StreetSuffix = 'CANYON'
    } else if (StreetSuffix === 'CAPE' || StreetSuffix === 'CPE') {
      StreetSuffix = 'CAPE'
    } else if (StreetSuffix === 'CAUSEWAY' || StreetSuffix === 'CAUSWA' || StreetSuffix === 'CSWY') {
      StreetSuffix = 'CAUSEWAY'
    } else if (StreetSuffix === 'CENTER' || StreetSuffix === 'CEN ' || StreetSuffix === 'CENT' || StreetSuffix === 'CENTR' || StreetSuffix === 'CENTRE' || StreetSuffix === 'CNTER' || StreetSuffix === 'CNTR' || StreetSuffix === 'CTR') {
      StreetSuffix = 'CENTER'
    } else if (StreetSuffix === 'CENTERS' || StreetSuffix === 'CTRS') {
      StreetSuffix = 'CENTERS'
    } else if (StreetSuffix === 'CIRCLE' || StreetSuffix === 'CIRC' || StreetSuffix === 'CIRCL' || StreetSuffix === 'CRCL' || StreetSuffix === 'CRCLE' || StreetSuffix === 'CIR') {
      StreetSuffix = 'CIRCLE'
    } else if (StreetSuffix === 'CIRCLES' || StreetSuffix === 'CIRS') {
      StreetSuffix = 'CIRCLES'
    } else if (StreetSuffix === 'CLIFF' || StreetSuffix === 'CLF') {
      StreetSuffix = 'CLIFF'
    } else if (StreetSuffix === 'CLUB' || StreetSuffix === 'CLB') {
      StreetSuffix = 'CLUB'
    } else if (StreetSuffix === 'COMMON' || StreetSuffix === 'CMN') {
      StreetSuffix = 'COMMON'
    } else if (StreetSuffix === 'COMMONS' || StreetSuffix === 'CMNS') {
      StreetSuffix = 'COMMONS'
    } else if (StreetSuffix === 'CORNER' || StreetSuffix === 'COR') {
      StreetSuffix = 'CORNER'
    } else if (StreetSuffix === 'CORNERS' || StreetSuffix === 'CORS') {
      StreetSuffix = 'CORNERS'
    } else if (StreetSuffix === 'COURSE' || StreetSuffix === 'CRSE') {
      StreetSuffix = 'COURSE'
    } else if (StreetSuffix === 'COURT' || StreetSuffix === 'CT') {
      StreetSuffix = 'COURT'
    } else if (StreetSuffix === 'COURTS' || StreetSuffix === 'CTS') {
      StreetSuffix = 'COURTS'
    } else if (StreetSuffix === 'COVE' || StreetSuffix === 'CV') {
      StreetSuffix = 'COVE'
    } else if (StreetSuffix === 'COVES' || StreetSuffix === 'CVS') {
      StreetSuffix = 'COVES'
    } else if (StreetSuffix === 'CREEK' || StreetSuffix === 'CRK') {
      StreetSuffix = 'CREEK'
    } else if (StreetSuffix === 'CRESCENT' || StreetSuffix === 'CRSENT' || StreetSuffix === 'CRSNT' || StreetSuffix === 'CRES') {
      StreetSuffix = 'CRESCENT'
    } else if (StreetSuffix === 'CREST' || StreetSuffix === 'CRST') {
      StreetSuffix = 'CREST'
    } else if (StreetSuffix === 'CROSSING' || StreetSuffix === 'CRSSNG' || StreetSuffix === 'XING') {
      StreetSuffix = 'CROSSING'
    } else if (StreetSuffix === 'CROSSROAD' || StreetSuffix === 'XRD') {
      StreetSuffix = 'CROSSROAD'
    } else if (StreetSuffix === 'CURVE' || StreetSuffix === 'CURV') {
      StreetSuffix = 'CURVE'
    } else if (StreetSuffix === 'DALE' || StreetSuffix === 'DL') {
      StreetSuffix = 'DALE'
    } else if (StreetSuffix === 'DAM' || StreetSuffix === 'DM') {
      StreetSuffix = 'DAM'
    } else if (StreetSuffix === 'DIVIDE' || StreetSuffix === 'DIV' || StreetSuffix === 'DVD' || StreetSuffix === 'DV') {
      StreetSuffix = 'DIVIDE'
    } else if (StreetSuffix === 'DRIVE' || StreetSuffix === 'DRIV' || StreetSuffix === 'DRV' || StreetSuffix === 'DR') {
      StreetSuffix = 'DRIVE'
    } else if (StreetSuffix === 'DRIVES' || StreetSuffix === 'DRS') {
      StreetSuffix = 'DRIVES'
    } else if (StreetSuffix === 'ESTATE' || StreetSuffix === 'EST') {
      StreetSuffix = 'ESTATE'
    } else if (StreetSuffix === 'ESTATES' || StreetSuffix === 'ESTS') {
      StreetSuffix = 'ESTATES'
    } else if (StreetSuffix === 'EXPRESSWAY' || StreetSuffix === 'EXP' || StreetSuffix === 'EXPR' || StreetSuffix === 'EXPRESS' || StreetSuffix === 'EXPW' || StreetSuffix === 'EXPWY' || StreetSuffix === 'EXPY') {
      StreetSuffix = 'EXPRESSWAY'
    } else if (StreetSuffix === 'EXTENSION' || StreetSuffix === 'EXTN' || StreetSuffix === 'EXTNSN' || StreetSuffix === 'EXT') {
      StreetSuffix = 'EXTENSION'
    } else if (StreetSuffix === 'EXTENSIONS' || StreetSuffix === 'EXTS') {
      StreetSuffix = 'EXTENSIONS'
    } else if (StreetSuffix === 'FALL') {
      StreetSuffix = 'FALL'
    } else if (StreetSuffix === 'FALLS' || StreetSuffix === 'FLS') {
      StreetSuffix = 'FALLS'
    } else if (StreetSuffix === 'FERRY' || StreetSuffix === 'FRRY' || StreetSuffix === 'FRY') {
      StreetSuffix = 'FERRY'
    } else if (StreetSuffix === 'FIELD' || StreetSuffix === 'FLD') {
      StreetSuffix = 'FIELD'
    } else if (StreetSuffix === 'FIELDS' || StreetSuffix === 'FLDS') {
      StreetSuffix = 'FIELDS'
    } else if (StreetSuffix === 'FLAT' || StreetSuffix === 'FLT') {
      StreetSuffix = 'FLAT'
    } else if (StreetSuffix === 'FLATS' || StreetSuffix === 'FLTS') {
      StreetSuffix = 'FLATS'
    } else if (StreetSuffix === 'FORD' || StreetSuffix === 'FRD') {
      StreetSuffix = 'FORD'
    } else if (StreetSuffix === 'FORDS' || StreetSuffix === 'FRDS') {
      StreetSuffix = 'FORDS'
    } else if (StreetSuffix === 'FOREST' || StreetSuffix === 'FRST') {
      StreetSuffix = 'FOREST'
    } else if (StreetSuffix === 'FORGE' || StreetSuffix === 'FORG' || StreetSuffix === 'FRG') {
      StreetSuffix = 'FORGE'
    } else if (StreetSuffix === 'FORGES' || StreetSuffix === 'FRGS') {
      StreetSuffix = 'FORGES'
    } else if (StreetSuffix === 'FORK' || StreetSuffix === 'FRK') {
      StreetSuffix = 'FORK'
    } else if (StreetSuffix === 'FORKS' || StreetSuffix === 'FRKS') {
      StreetSuffix = 'FORKS'
    } else if (StreetSuffix === 'FORT' || StreetSuffix === 'FRT' || StreetSuffix === 'FT') {
      StreetSuffix = 'FORT'
    } else if (StreetSuffix === 'FREEWAY' || StreetSuffix === 'FREEWY' || StreetSuffix === 'FRWAY' || StreetSuffix === 'FRWY' || StreetSuffix === 'FWY') {
      StreetSuffix = 'FREEWAY'
    } else if (StreetSuffix === 'GARDEN' || StreetSuffix === 'GARDN' || StreetSuffix === 'GRDEN' || StreetSuffix === 'GRDN' || StreetSuffix === 'GDN') {
      StreetSuffix = 'GARDEN'
    } else if (StreetSuffix === 'GARDENS' || StreetSuffix === 'GDNS') {
      StreetSuffix = 'GARDENS'
    } else if (StreetSuffix === 'GATEWAY' || StreetSuffix === 'GATEWY' || StreetSuffix === 'GATWAY' || StreetSuffix === 'GTWAY' || StreetSuffix === 'GTWY') {
      StreetSuffix = 'GATEWAY'
    } else if (StreetSuffix === 'GLEN' || StreetSuffix === 'GLN') {
      StreetSuffix = 'GLEN'
    } else if (StreetSuffix === 'GLENS' || StreetSuffix === 'GLNS') {
      StreetSuffix = 'GLENS'
    } else if (StreetSuffix === 'GREEN' || StreetSuffix === 'GRN') {
      StreetSuffix = 'GREEN'
    } else if (StreetSuffix === 'GREENS' || StreetSuffix === 'GRNS') {
      StreetSuffix = 'GREENS'
    } else if (StreetSuffix === 'GROVE' || StreetSuffix === 'GROV' || StreetSuffix === 'GRV') {
      StreetSuffix = 'GROVE'
    } else if (StreetSuffix === 'GROVES' || StreetSuffix === 'GRVS') {
      StreetSuffix = 'GROVES'
    } else if (StreetSuffix === 'HARBOR' || StreetSuffix === 'HARB' || StreetSuffix === 'HARBR' || StreetSuffix === 'HRBOR' || StreetSuffix === 'HBR') {
      StreetSuffix = 'HARBOR'
    } else if (StreetSuffix === 'HARBORS' || StreetSuffix === 'HBRS') {
      StreetSuffix = 'HARBORS'
    } else if (StreetSuffix === 'HAVEN' || StreetSuffix === 'HVN') {
      StreetSuffix = 'HAVEN'
    } else if (StreetSuffix === 'HEIGHTS' || StreetSuffix === 'HTS') {
      StreetSuffix = 'HEIGHTS'
    } else if (StreetSuffix === 'HIGHWAY' || StreetSuffix === 'HIGHWY' || StreetSuffix === 'HIWAY' || StreetSuffix === 'HIWY' || StreetSuffix === 'HWAY' || StreetSuffix === 'HWY') {
      StreetSuffix = 'HIGHWAY'
    } else if (StreetSuffix === 'HILL' || StreetSuffix === 'HL') {
      StreetSuffix = 'HILL'
    } else if (StreetSuffix === 'HILLS' || StreetSuffix === 'HLS') {
      StreetSuffix = 'HILLS'
    } else if (StreetSuffix === 'HOLLOW' || StreetSuffix === 'HLLW' || StreetSuffix === 'HOLW' || StreetSuffix === 'HOLWS') {
      StreetSuffix = 'HOLLOW'
    } else if (StreetSuffix === 'INLET' || StreetSuffix === 'INLT') {
      StreetSuffix = 'INLET'
    } else if (StreetSuffix === 'ISLAND' || StreetSuffix === 'IS') {
      StreetSuffix = 'ISLAND'
    } else if (StreetSuffix === 'ISLANDS' || StreetSuffix === 'ISS') {
      StreetSuffix = 'ISLANDS'
    } else if (StreetSuffix === 'ISLE') {
      StreetSuffix = 'ISLE'
    } else if (StreetSuffix === 'JUNCTION' || StreetSuffix === 'JCTION' || StreetSuffix === 'JCTN' || StreetSuffix === 'JUNCTN' || StreetSuffix === 'JUNCTON' || StreetSuffix === 'JCT') {
      StreetSuffix = 'JUNCTION'
    } else if (StreetSuffix === 'JUNCTIONS' || StreetSuffix === 'JCTS') {
      StreetSuffix = 'JUNCTIONS'
    } else if (StreetSuffix === 'KEY' || StreetSuffix === 'KY') {
      StreetSuffix = 'KEY'
    } else if (StreetSuffix === 'KEYS' || StreetSuffix === 'KYS') {
      StreetSuffix = 'KEYS'
    } else if (StreetSuffix === 'KNOLL' || StreetSuffix === 'KNOL' || StreetSuffix === 'KNL') {
      StreetSuffix = 'KNOLL'
    } else if (StreetSuffix === 'KNOLLS' || StreetSuffix === 'KNLS') {
      StreetSuffix = 'KNOLLS'
    } else if (StreetSuffix === 'LAKE' || StreetSuffix === 'LK') {
      StreetSuffix = 'LAKE'
    } else if (StreetSuffix === 'LAKES' || StreetSuffix === 'LKS') {
      StreetSuffix = 'LAKES'
    } else if (StreetSuffix === 'LAND') {
      StreetSuffix = 'LAND'
    } else if (StreetSuffix === 'LANDING' || StreetSuffix === 'LNDNG' || StreetSuffix === 'LNDG') {
      StreetSuffix = 'LANDING'
    } else if (StreetSuffix === 'LANE' || StreetSuffix === 'LA' || StreetSuffix === 'LN') {
      StreetSuffix = 'LANE'
    } else if (StreetSuffix === 'LIGHT' || StreetSuffix === 'LGT') {
      StreetSuffix = 'LIGHT'
    } else if (StreetSuffix === 'LIGHTS' || StreetSuffix === 'LGTS') {
      StreetSuffix = 'LIGHTS'
    } else if (StreetSuffix === 'LOAF' || StreetSuffix === 'LF') {
      StreetSuffix = 'LOAF'
    } else if (StreetSuffix === 'LOCK' || StreetSuffix === 'LCK') {
      StreetSuffix = 'LOCK'
    } else if (StreetSuffix === 'LOCKS' || StreetSuffix === 'LCKS') {
      StreetSuffix = 'LOCKS'
    } else if (StreetSuffix === 'LODGE' || StreetSuffix === 'LDGE' || StreetSuffix === 'LODG' || StreetSuffix === 'LDG') {
      StreetSuffix = 'LODGE'
    } else if (StreetSuffix === 'LOOP' || StreetSuffix === 'LP') {
      StreetSuffix = 'LOOP'
    } else if (StreetSuffix === 'MALL') {
      StreetSuffix = 'MALL'
    } else if (StreetSuffix === 'MANOR' || StreetSuffix === 'MNR') {
      StreetSuffix = 'MANOR'
    } else if (StreetSuffix === 'MANORS' || StreetSuffix === 'MNRS') {
      StreetSuffix = 'MANORS'
    } else if (StreetSuffix === 'MEADOW' || StreetSuffix === 'MDW') {
      StreetSuffix = 'MEADOW'
    } else if (StreetSuffix === 'MEADOWS' || StreetSuffix === 'MEDOWS' || StreetSuffix === 'MDWS') {
      StreetSuffix = 'MEADOWS'
    } else if (StreetSuffix === 'MEWS') {
      StreetSuffix = 'MEWS'
    } else if (StreetSuffix === 'MILL' || StreetSuffix === 'ML') {
      StreetSuffix = 'MILL'
    } else if (StreetSuffix === 'MILLS' || StreetSuffix === 'MLS') {
      StreetSuffix = 'MILLS'
    } else if (StreetSuffix === 'MISSION' || StreetSuffix === 'MSN') {
      StreetSuffix = 'MISSION'
    } else if (StreetSuffix === 'MOTORWAY' || StreetSuffix === 'MTWY') {
      StreetSuffix = 'MOTORWAY'
    } else if (StreetSuffix === 'MOUNT' || StreetSuffix === 'MT') {
      StreetSuffix = 'MOUNT'
    } else if (StreetSuffix === 'MOUNTAIN' || StreetSuffix === 'MTN') {
      StreetSuffix = 'MOUNTAIN'
    } else if (StreetSuffix === 'MOUNTAINS' || StreetSuffix === 'MTNS') {
      StreetSuffix = 'MOUNTAINS'
    } else if (StreetSuffix === 'NECK' || StreetSuffix === 'NCK') {
      StreetSuffix = 'NECK'
    } else if (StreetSuffix === 'ORCHARD' || StreetSuffix === 'ORCHRD' || StreetSuffix === 'ORCH') {
      StreetSuffix = 'ORCHARD'
    } else if (StreetSuffix === 'OVAL' || StreetSuffix === 'OVL') {
      StreetSuffix = 'OVAL'
    } else if (StreetSuffix === 'OVERPASS' || StreetSuffix === 'OPAS') {
      StreetSuffix = 'OVERPASS'
    } else if (StreetSuffix === 'PARK' || StreetSuffix === 'PRK') {
      StreetSuffix = 'PARK'
    } else if (StreetSuffix === 'PARKS' || StreetSuffix === 'PRKS') {
      StreetSuffix = 'PARKS'
    } else if (StreetSuffix === 'PARKWAY' || StreetSuffix === 'PARKWY' || StreetSuffix === 'PKWAY' || StreetSuffix === 'PKY' || StreetSuffix === 'PKWY') {
      StreetSuffix = 'PARKWAY'
    } else if (StreetSuffix === 'PARKWAYS' || StreetSuffix === 'PKWYS') {
      StreetSuffix = 'PARKWAYS'
    } else if (StreetSuffix === 'PASS') {
      StreetSuffix = 'PASS'
    } else if (StreetSuffix === 'PASSAGE' || StreetSuffix === 'PSGE') {
      StreetSuffix = 'PASSAGE'
    } else if (StreetSuffix === 'PATH') {
      StreetSuffix = 'PATH'
    } else if (StreetSuffix === 'PIKE' || StreetSuffix === 'PK') {
      StreetSuffix = 'PIKE'
    } else if (StreetSuffix === 'PINE' || StreetSuffix === 'PNE') {
      StreetSuffix = 'PINE'
    } else if (StreetSuffix === 'PINES' || StreetSuffix === 'PNES') {
      StreetSuffix = 'PINES'
    } else if (StreetSuffix === 'PLACE' || StreetSuffix === 'PL') {
      StreetSuffix = 'PLACE'
    } else if (StreetSuffix === 'PLAIN' || StreetSuffix === 'PLN') {
      StreetSuffix = 'PLAIN'
    } else if (StreetSuffix === 'PLAINS' || StreetSuffix === 'PLNS') {
      StreetSuffix = 'PLAINS'
    } else if (StreetSuffix === 'PLAZA' || StreetSuffix === 'PLZA' || StreetSuffix === 'PLZ') {
      StreetSuffix = 'PLAZA'
    } else if (StreetSuffix === 'POINT' || StreetSuffix === 'PT') {
      StreetSuffix = 'POINT'
    } else if (StreetSuffix === 'POINTS' || StreetSuffix === 'PTS') {
      StreetSuffix = 'POINTS'
    } else if (StreetSuffix === 'PORT' || StreetSuffix === 'PRT') {
      StreetSuffix = 'PORT'
    } else if (StreetSuffix === 'PORTS' || StreetSuffix === 'PRTS') {
      StreetSuffix = 'PORTS'
    } else if (StreetSuffix === 'PRAIRIE' || StreetSuffix === 'PRR' || StreetSuffix === 'PR') {
      StreetSuffix = 'PRAIRIE'
    } else if (StreetSuffix === 'RADIAL' || StreetSuffix === 'RAD' || StreetSuffix === 'RADIEL' || StreetSuffix === 'RADL') {
      StreetSuffix = 'RADIAL'
    } else if (StreetSuffix === 'RAMP') {
      StreetSuffix = 'RAMP'
    } else if (StreetSuffix === 'RANCH' || StreetSuffix === 'RNCH' || StreetSuffix === 'RNCHS') {
      StreetSuffix = 'RANCH'
    } else if (StreetSuffix === 'RAPID' || StreetSuffix === 'RPD') {
      StreetSuffix = 'RAPID'
    } else if (StreetSuffix === 'RAPIDS' || StreetSuffix === 'RPDS') {
      StreetSuffix = 'RAPIDS'
    } else if (StreetSuffix === 'REST' || StreetSuffix === 'RST') {
      StreetSuffix = 'REST'
    } else if (StreetSuffix === 'RIDGE' || StreetSuffix === 'RDGE' || StreetSuffix === 'RDG') {
      StreetSuffix = 'RIDGE'
    } else if (StreetSuffix === 'RIDGES' || StreetSuffix === 'RDGS') {
      StreetSuffix = 'RIDGES'
    } else if (StreetSuffix === 'RIVER' || StreetSuffix === 'RVR' || StreetSuffix === 'RIVR' || StreetSuffix === 'RIV') {
      StreetSuffix = 'RIVER'
    } else if (StreetSuffix === 'ROAD' || StreetSuffix === 'RD') {
      StreetSuffix = 'ROAD'
    } else if (StreetSuffix === 'ROADS' || StreetSuffix === 'RDS') {
      StreetSuffix = 'ROADS'
    } else if (StreetSuffix === 'ROUTE' || StreetSuffix === 'RTE') {
      StreetSuffix = 'ROUTE'
    } else if (StreetSuffix === 'ROW') {
      StreetSuffix = 'ROW'
    } else if (StreetSuffix === 'RUE') {
      StreetSuffix = 'RUE'
    } else if (StreetSuffix === 'RUN') {
      StreetSuffix = 'RUN'
    } else if (StreetSuffix === 'SHOAL' || StreetSuffix === 'SHL') {
      StreetSuffix = 'SHOAL'
    } else if (StreetSuffix === 'SHOALS' || StreetSuffix === 'SHLS') {
      StreetSuffix = 'SHOALS'
    } else if (StreetSuffix === 'SHORE' || StreetSuffix === 'SHR') {
      StreetSuffix = 'SHORE'
    } else if (StreetSuffix === 'SHORES' || StreetSuffix === 'SHRS') {
      StreetSuffix = 'SHORES'
    } else if (StreetSuffix === 'SKYWAY' || StreetSuffix === 'SKWY') {
      StreetSuffix = 'SKYWAY'
    } else if (StreetSuffix === 'SPRING' || StreetSuffix === 'SPNG' || StreetSuffix === 'SPRNG' || StreetSuffix === 'SPG') {
      StreetSuffix = 'SPRING'
    } else if (StreetSuffix === 'SPRINGS' || StreetSuffix === 'SPGS') {
      StreetSuffix = 'SPRINGS'
    } else if (StreetSuffix === 'SPUR') {
      StreetSuffix = 'SPUR'
    } else if (StreetSuffix === 'SQUARE' || StreetSuffix === 'SQR' || StreetSuffix === 'SQRE' || StreetSuffix === 'SQU' || StreetSuffix === 'SQ') {
      StreetSuffix = 'SQUARE'
    } else if (StreetSuffix === 'SQUARES' || StreetSuffix === 'SQS') {
      StreetSuffix = 'SQUARES'
    } else if (StreetSuffix === 'STATION' || StreetSuffix === 'STATN' || StreetSuffix === 'STN' || StreetSuffix === 'STA') {
      StreetSuffix = 'STATION'
    } else if (StreetSuffix === 'STRASSE') {
      StreetSuffix = 'STRASSE'
    } else if (StreetSuffix === 'STRAVENUE' || StreetSuffix === 'STRAV' || StreetSuffix === 'STRAVEN' || StreetSuffix === 'STRAVN' || StreetSuffix === 'STRVN' || StreetSuffix === 'STRVNUE' || StreetSuffix === 'STRA') {
      StreetSuffix = 'STRAVENUE'
    } else if (StreetSuffix === 'STREAM' || StreetSuffix === 'STREME' || StreetSuffix === 'STRM') {
      StreetSuffix = 'STREAM'
    } else if (StreetSuffix === 'STREET' || StreetSuffix === 'STR' || StreetSuffix === 'STRT' || StreetSuffix === 'ST') {
      StreetSuffix = 'STREET'
    } else if (StreetSuffix === 'STREETS' || StreetSuffix === 'STS') {
      StreetSuffix = 'STREETS'
    } else if (StreetSuffix === 'SUMMIT' || StreetSuffix === 'SUMIT' || StreetSuffix === 'SUMITT' || StreetSuffix === 'SMT') {
      StreetSuffix = 'SUMMIT'
    } else if (StreetSuffix === 'TERRACE' || StreetSuffix === 'TERR' || StreetSuffix === 'TER') {
      StreetSuffix = 'TERRACE'
    } else if (StreetSuffix === 'THROUGHWAY' || StreetSuffix === 'TRWY') {
      StreetSuffix = 'THROUGHWAY'
    } else if (StreetSuffix === 'TRACE' || StreetSuffix === 'TRCE') {
      StreetSuffix = 'TRACE'
    } else if (StreetSuffix === 'TRACK' || StreetSuffix === 'TRAK' || StreetSuffix === 'TRK' || StreetSuffix === 'TRKS') {
      StreetSuffix = 'TRACK'
    } else if (StreetSuffix === 'TRAFFICWAY' || StreetSuffix === 'TRFY') {
      StreetSuffix = 'TRAFFICWAY'
    } else if (StreetSuffix === 'TRAIL' || StreetSuffix === 'TRL') {
      StreetSuffix = 'TRAIL'
    } else if (StreetSuffix === 'TRAILER' || StreetSuffix === 'TRLR') {
      StreetSuffix = 'TRAILER'
    } else if (StreetSuffix === 'TUNNEL' || StreetSuffix === 'TUNL') {
      StreetSuffix = 'TUNNEL'
    } else if (StreetSuffix === 'TURNPIKE' || StreetSuffix === 'TRNPK' || StreetSuffix === 'TURNPK' || StreetSuffix === 'TPKE') {
      StreetSuffix = 'TURNPIKE'
    } else if (StreetSuffix === 'UNDERPASS' || StreetSuffix === 'UPAS') {
      StreetSuffix = 'UNDERPASS'
    } else if (StreetSuffix === 'UNION' || StreetSuffix === 'UN') {
      StreetSuffix = 'UNION'
    } else if (StreetSuffix === 'UNIONS' || StreetSuffix === 'UNS') {
      StreetSuffix = 'UNIONS'
    } else if (StreetSuffix === 'VALLEY' || StreetSuffix === 'VALLY' || StreetSuffix === 'VLLY' || StreetSuffix === 'VLY') {
      StreetSuffix = 'VALLEY'
    } else if (StreetSuffix === 'VALLEYS' || StreetSuffix === 'VLYS') {
      StreetSuffix = 'VALLEYS'
    } else if (StreetSuffix === 'VIA') {
      StreetSuffix = 'VIA'
    } else if (StreetSuffix === 'VIADUCT' || StreetSuffix === 'VDCT' || StreetSuffix === 'VIADCT' || StreetSuffix === 'VIA') {
      StreetSuffix = 'VIADUCT'
    } else if (StreetSuffix === 'VIEW' || StreetSuffix === 'VW') {
      StreetSuffix = 'VIEW'
    } else if (StreetSuffix === 'VIEWS' || StreetSuffix === 'VWS') {
      StreetSuffix = 'VIEWS'
    } else if (StreetSuffix === 'VILLAGE' || StreetSuffix === 'VILL' || StreetSuffix === 'VILLAG' || StreetSuffix === 'VILLG' || StreetSuffix === 'VLG') {
      StreetSuffix = 'VILLAGE'
    } else if (StreetSuffix === 'VILLAGES' || StreetSuffix === 'VLGS') {
      StreetSuffix = 'VILLAGES'
    } else if (StreetSuffix === 'VILLE' || StreetSuffix === 'VL') {
      StreetSuffix = 'VILLE'
    } else if (StreetSuffix === 'VISTA' || StreetSuffix === 'VIST' || StreetSuffix === 'VST' || StreetSuffix === 'VSTA' || StreetSuffix === 'VIS') {
      StreetSuffix = 'VISTA'
    } else if (StreetSuffix === 'WALK') {
      StreetSuffix = 'WALK'
    } else if (StreetSuffix === 'WALL') {
      StreetSuffix = 'WALL'
    } else if (StreetSuffix === 'WAY' || StreetSuffix === 'WY') {
      StreetSuffix = 'WAY'
    } else if (StreetSuffix === 'WELL' || StreetSuffix === 'WL') {
      StreetSuffix = 'WELL'
    } else if (StreetSuffix === 'WELLS' || StreetSuffix === 'WLS') {
      StreetSuffix = 'WELLS'
    } else {
      if (StreetSuffix.length !== 0) {
        if (origin === 'query') {
          errors.push({
            description: 'Public Record Contained Unexpected Street Suffix: ' + StreetSuffix,
          })
          isError = true
        } else {
          errors.push({
            description: 'Unexpected Street Suffix: ' + StreetSuffix,
          })
          isError = true
        }
      }
    }
  }

  return {StreetSuffix, errors, isError}
}

module.exports = { formatStreetSuffix, formatFields }