const moment = require('moment')
const SweepParameterModel = require("../models/sweepParameter")
const { formatStreetSuffix } = require("./upload.utils")
const { attomDetailsObjBoth, attomDetailsObjAttomOnly } = require("./teamEnvironmentModels.utils")
const { mappingAttomT, mappingPropMixT, mappingPropMixTT, mappingMortgage } = require("./mapping.utils")

exports.vendorDataModeling = async function (propMixDataBool, attomDataBool, coreLogicCurrentMortgageDataBool, propMixData, attomData, coreLogicCurrentMortgageData, isInitialMatch) {
  let taxLotDetermined = false
  let taxLockSecondAttempt = false
  let storiesDetermined = false
  let legalSubdivisionNameDetermined = false
  let newPropertyType = ''
  let newParcelNumber = ''
  let formattingErrors = []
  let updatedSweepParameters = []
  let attomDetailsToParse = {}
  let mortgageOverview = {
    newOriginalLoanAmount: null,
    newOriginalInterestRate: null,
    newMortgageTerm: null,
    newOriginationDate: '',
    newOriginationDateLabel: '',
  }
  let mappedVendorObj =  {
    identifiers: {
      FIPS: { label: 'FIPS', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      AttomId: { label: 'Attom ID', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      PMXPropertyId: { label: 'Prop Mix ID', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      CoreLogicClip: { label: 'Core Logic Clip', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
    },
    lot: {
      County: { label: 'County', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Municipality: { label: 'Municipality', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      LegalSubdivisionName: { label: 'Legal Subdivision Name', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      ParcelNumber: { label: 'Parcel Number', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Latitude: { label: 'Latitude', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Longitude: { label: 'Longitude', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      LotSizeAcres: { label: 'Lot Size Acres', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      LotSizeSquareFeet: { label: 'Lot Size Square Feet', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Zoning: { label: 'Zoning', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      CountyLandUseCode: { label: 'County Land Use Code', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      BelowGradeTotalArea: { label: 'Below Grade Total Area', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      BelowGradeFinishedArea: { label: 'Below Grade Finished Area', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      LandUseCode: { label: 'Land Use Code', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      CountyUseCode: { label: 'County Use Code', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxLot: { label: 'Tax Lot', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxBlock: { label: 'Tax Block', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxCodeArea: { label: 'Tax Code Area', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      CensusTractId: { label: 'Census Tract ID', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
    },
    address: {
      StreetAddressOneLine: { label: 'Street Address One Line', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      StreetAddressLine1: { label: 'Street Address Line 1', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      StreetAddressLine2: { label: 'Street Address Line 2', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      StreetNumber: { label: 'Street Number', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      UnitPrefix: { label: 'Unit Prefix', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      UnitNumber: { label: 'Unit Number', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      StreetDirPrefix: { label: 'Street Direction Prefix', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      StreetName: { label: 'Street Name', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      StreetSuffix: { label: 'Street Suffix', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      StreetDirSuffix: { label: 'Street Direction Suffix', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      City: { label: 'City', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      StateOrProvince: { label: 'StateOrProvince', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      PostalCode: { label: 'Postal Code', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      PostalCodePlus4: { label: 'Postal Code Plus 4', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
    },
    summary: {
      WaterSource: { label: 'Water Source', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      SewerType: { label: 'Sewer Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      SchoolDistrict: { label: 'School District', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      PropertyType: { label: 'Property Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      PropertySubType: { label: 'Property Sub Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      QuitClaimFlag: { label: 'Quit Claim Flag', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      REOflag: { label: 'Foreclosure Flag', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      DistressYN: { label: 'Distress', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
    },
    sale: {
      LeaseholdOrFeeSimple: { label: 'Leasehold Or Fee Simple', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      LastSaleRecordingDate: { label: 'Last Sale Recording Date', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      LastSaleContractDate: { label: 'Last Sale Contract Date', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      LastSaleDate: { label: 'Last Sale Date', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      ClosePrice: { label: 'Close Price', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      ClosePriceDescription: { label: 'Close Price Description', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      LastSaleTransactionId: { label: 'Last Sale Transaction ID', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      LastSaleBuyerName: { label: 'Last Sale Buyer Name', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      SaleDocType: { label: 'Sale Document Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      LastSaleRecordingDocumentId: { label: 'Last Sale Recording Document ID', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      LastSaleSeller2FullName: { label: 'Last Sale Seller 2 Full Name', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      LastSaleSeller1FullName: { label: 'Last Sale Seller 1 Full Name', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
    },
    living: {
      BuildingAreaTotal: { label: 'Building Area Total', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      GrossArea: { label: 'Gross Area', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      LivingArea: { label: 'Living Area', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Stories: { label: 'Stories', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      RoomsTotal: { label: 'Rooms', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      BedroomsTotal: { label: 'Bedrooms', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      BathroomsFull: { label: 'Bathrooms Full', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      BathroomsTotalInteger: { label: 'Bathrooms Total', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      FireplacesTotal: { label: 'Fireplaces', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Heating: { label: 'Heating', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Cooling: { label: 'Cooling', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      PoolType: { label: 'Pool Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
    },
    building: {
      BuildingQualityScore: { label: 'Building Quality Score', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      BuildingCondition: { label: 'Building Condition', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      YearBuilt: { label: 'Year Built', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      YearBuiltEffective: { label: 'Year Built Effective', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      NumberOfBuildings: { label: 'Number Of Buildings', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      NumberOfUnitsTotal: { label: 'Number Of Units Total', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      ArchitecturalStyle: { label: 'Architectural Style', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      ConstructionType: { label: 'Construction Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      FrameType: { label: 'Frame Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      ExteriorWallsType: { label: 'Exterior Walls Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      InteriorWallsType: { label: 'Interior Walls Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      RoofType: { label: 'Roof Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      RoofCoverType: { label: 'Roof Cover Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      CarStorageType: { label: 'Car Storage Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      GarageSpaces: { label: 'Garage Spaces', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      GarageArea: { label: 'Garage Area', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      ParkingSpaces: { label: 'Parking Spaces', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
    },
    assessment: {
      AssessedYear: { label: 'Assessed Year', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      AssessedValue: { label: 'Assessed Value', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      AssessedLandValue: { label: 'Assessed Land Value', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      AssessedImprovementValue: { label: 'Assessed Improvement Value', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      // MarketValue: { label: 'Market Value', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      // MarketLandValue: { label: 'Market Land Value', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      // MarketImprovementValue: { label: 'Market Improvement Value', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      // LandValue: { label: 'Land Value', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      // ImprovementsValue: { label: 'Improvements Value', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      AssessorsMapReference: { label: 'Assessors Map Reference', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
    },
    tax: {
      TaxYear: { label: 'Tax Year', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxAnnualAmount: { label: 'Tax Annual Amount', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      OwnerOccupied: { label: 'Owner Occupied', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxExemptionHomestead: { label: 'Tax Exemption Homestead', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxExemptionVeteran: { label: 'Tax Exemption Veteran', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxExemptionDisabled: { label: 'Tax Exemption Disabled', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxExemptionWidow: { label: 'Tax Exemption Widow', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxExemptionSenior: { label: 'Tax Exemption Senior', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxExemptionSchoolCollege: { label: 'Tax Exemption School/College', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxExemptionReligious: { label: 'Tax Exemption Religious', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxExemptionWelfare: { label: 'Tax Exemption Welfare', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxExemptionPublicUtility: { label: 'Tax Exemption Public Utility', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxExemptionCemetery: { label: 'Tax Exemption Cemetery', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxExemptionHospital: { label: 'Tax Exemption Hospital', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxExemptionLibrary: { label: 'Tax Exemption Library', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TaxInitialDeliquencyYear: { label: 'Tax Initial Delinquency Year', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
    },
    owner1: {
      Owner1OwnershipRights: { label: 'Owner One Ownership Rights', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Owner1IsCorporation: { label: 'Owner One Is Corporation', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      CorporateIndicator: { label: 'Corporate Indicator', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Owner1FullName: { label: 'Owner One Full Name', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Owner1LastName: { label: 'Owner One Last Name', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Owner1FirstName: { label: 'Owner One First Name', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
    },
    owner2: {
      Owner2IsCorporation: { label: 'Owner Two Is Corporation', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Owner2FullName: { label: 'Owner Two Full Name', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Owner2LastName: { label: 'Owner Two Last Name', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      Owner2FirstName: { label: 'Owner Two First Name', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
    },
    primaryMortgage: {
      PrimaryMortgageAmount: { label: 'Primary Mortgage Amount', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      PrimaryMortgageInterestRate: { label: 'Primary Mortgage Interest Rate', publicRecordValue: '', discrepancy: false, backup: null},
      PrimaryLenderName: { label: 'Primary Lender Name', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      PrimaryMortgageStartDate: { label: 'Primary Mortgage Start Date', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      PrimaryLoanType: { label: 'Primary Loan Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      PrimaryMortgageTerm: { label: 'Primary Mortgage Term', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      PrimaryMortgageDueDate: { label: 'Primary Mortgage Due Date', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      TitleCompany: { label: 'Title Company', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      OwnershipRights: { label: 'Ownership Rights', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      BorrowerRelationship: { label: 'Borrower Relationship', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      MortgageTransactionDescription: { label: 'Mortgage Transaction Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      DeedCategoryDescriprion: { label: 'Deed Category', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
    },
    secondaryMortgage: {
      SecondaryMortgageAmount: { label: 'Secondary Mortgage Amount', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      SecondaryLenderName: { label: 'Secondary Lender Name', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      SecondaryMortgageRecordingDate: { label: 'Secondary Mortgage Recording Date', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      SecondaryLoanType: { label: 'Secondary Loan Type', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      SecondaryMortgageTerm: { label: 'Secondary Mortgage Term', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
      SecondaryMortgageDueDate: { label: 'Secondary Mortgage Due Date', publicRecordValue: '', discrepancy: false, backup: null, status: "inactive" },
    },
  }

  if (attomDataBool && propMixDataBool) {
    attomDetailsToParse = attomDetailsObjBoth
  } else if (attomDataBool) {
    attomDetailsToParse = attomDetailsObjAttomOnly
  }

  if (coreLogicCurrentMortgageDataBool) {
    if (!attomDataBool && coreLogicCurrentMortgageData.mortgageTitleDetail && coreLogicCurrentMortgageData.mortgageTitleDetail.titleCompanyName) {
      mappedVendorObj.primaryMortgage.TitleCompany.publicRecordValue = coreLogicCurrentMortgageData.mortgageTitleDetail.titleCompanyName
      let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'TitleCompany'}, {
        $inc: { 
          populated: 1,
          totalQueries: 1,
        },
      }, {new: true})
      updatedSweepParameters.push(sweepParameterToUpdate)
    }
    if (!attomDataBool && coreLogicCurrentMortgageData.lenderDetail) {
      let coreLogicPrimaryLender = ''
      if (coreLogicCurrentMortgageData.lenderDetail.lenderFullName && coreLogicCurrentMortgageData.lenderDetail.lenderFullName.length > 0) {
        coreLogicPrimaryLender = coreLogicCurrentMortgageData.lenderDetail.lenderFullName
      } else if (coreLogicCurrentMortgageData.lenderDetail.lenderCompanyName && coreLogicCurrentMortgageData.lenderDetail.lenderCompanyName.length > 0) {
        coreLogicPrimaryLender = coreLogicCurrentMortgageData.lenderDetail.lenderCompanyName
      } else if (coreLogicCurrentMortgageData.lenderDetail.lenderPostToName && coreLogicCurrentMortgageData.lenderDetail.lenderPostToName.length > 0) {
        coreLogicPrimaryLender = coreLogicCurrentMortgageData.lenderDetail.lenderPostToName
      }
      mappedVendorObj.primaryMortgage.PrimaryLenderName.publicRecordValue = coreLogicPrimaryLender
      let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'PrimaryLenderName'}, {
        $inc: { 
          populated: 1,
          totalQueries: 1,
        },
      }, {new: true})
      updatedSweepParameters.push(sweepParameterToUpdate)
    }
    if (!attomDataBool && coreLogicCurrentMortgageData.borrowerDetail) {
      if (coreLogicCurrentMortgageData.borrowerDetail.ownershipRightsCodeDescription) {
        mappedVendorObj.primaryMortgage.OwnershipRights.publicRecordValue = coreLogicCurrentMortgageData.borrowerDetail.ownershipRightsCodeDescription
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'OwnershipRights'}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
        if (!propMixDataBool && coreLogicCurrentMortgageData.principalDetail.principalFullName) {
          mappedVendorObj.owner1.Owner1FullName.publicRecordValue = coreLogicCurrentMortgageData.principalDetail.principalFirstName + " " + coreLogicCurrentMortgageData.principalDetail.principalLastName
          let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'Owner1FullName'}, {
            $inc: { 
              populated: 1,
              totalQueries: 1,
            },
          }, {new: true})
          updatedSweepParameters.push(sweepParameterToUpdate)
        }
      }
      if (coreLogicCurrentMortgageData.borrowerDetail.relationshipTypeCodeDescription) {
        mappedVendorObj.primaryMortgage.BorrowerRelationship.publicRecordValue = coreLogicCurrentMortgageData.borrowerDetail.relationshipTypeCodeDescription
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'BorrowerRelationship'}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      }
    }
    if (coreLogicCurrentMortgageData.mortgageTransactionDetail) {
      if (!attomDataBool && coreLogicCurrentMortgageData.mortgageTransactionDetail.dueDate > 0) {
        mappedVendorObj.primaryMortgage.PrimaryMortgageDueDate.publicRecordValue = moment(coreLogicCurrentMortgageData.mortgageTransactionDetail.dueDate, 'YYYYMMDD').toISOString()
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'PrimaryMortgageDueDate'}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      }
      if (!attomDataBool && coreLogicCurrentMortgageData.mortgageTransactionDetail.term > 0) {
        mappedVendorObj.primaryMortgage.PrimaryMortgageTerm.publicRecordValue = coreLogicCurrentMortgageData.mortgageTransactionDetail.term
        mortgageOverview.newMortgageTerm = coreLogicCurrentMortgageData.mortgageTransactionDetail.term
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'PrimaryMortgageTerm'}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      }
      if (!attomDataBool && coreLogicCurrentMortgageData.mortgageTransactionDetail.amount > 0) {
        mappedVendorObj.primaryMortgage.PrimaryMortgageAmount.publicRecordValue = coreLogicCurrentMortgageData.mortgageTransactionDetail.amount
        mortgageOverview.newOriginalLoanAmount = coreLogicCurrentMortgageData.mortgageTransactionDetail.amount
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'PrimaryMortgageAmount'}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      }
      if (!attomDataBool && coreLogicCurrentMortgageData.mortgageTransactionDetail.date > 0) {
        coreLogicValue = coreLogicCurrentMortgageData.mortgageTransactionDetail.date
        if (coreLogicValue && coreLogicValue > 0) {
          mappedVendorObj.primaryMortgage.PrimaryMortgageStartDate.publicRecordValue = moment(coreLogicValue, 'YYYYMMDD').toISOString()
          mortgageOverview.newOriginationDate = moment(coreLogicValue, 'YYYYMMDD').toISOString()
          mortgageOverview.newOriginationDateLabel = moment(coreLogicValue, 'YYYYMMDD').format("MMM Do, YYYY")
        } else if (mortgageOverview.newOriginationDate.length > 0) {
          mappedVendorObj.primaryMortgage.PrimaryMortgageStartDate.publicRecordValue = mortgageOverview.newOriginationDate
        } else {
          mappedVendorObj.primaryMortgage.PrimaryMortgageStartDate.publicRecordValue = ''
        }
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'PrimaryMortgageStartDate'}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      }
      if (!attomDataBool && coreLogicCurrentMortgageData.mortgageTransactionDetail.loanTypeCodeDescription) {
        mappedVendorObj.primaryMortgage.PrimaryLoanType.publicRecordValue = coreLogicCurrentMortgageData.mortgageTransactionDetail.loanTypeCodeDescription
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'PrimaryLoanType'}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      }
      if (coreLogicCurrentMortgageData.mortgageTransactionDetail.primaryCategoryCodeDescription) {
        mappedVendorObj.primaryMortgage.MortgageTransactionDescription.publicRecordValue = coreLogicCurrentMortgageData.mortgageTransactionDetail.primaryCategoryCodeDescription
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'MortgageTransactionDescription'}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      } else {
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'MortgageTransactionDescription'}, {
          $inc: { 
            empty: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      }
      if (coreLogicCurrentMortgageData.mortgageTransactionDetail.deedCategoryCodeDescription) {
        mappedVendorObj.primaryMortgage.DeedCategoryDescriprion.publicRecordValue = coreLogicCurrentMortgageData.mortgageTransactionDetail.deedCategoryCodeDescription
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'DeedCategoryDescriprion'}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      } else {
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'DeedCategoryDescriprion'}, {
          $inc: { 
            empty: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      }
      if (coreLogicCurrentMortgageData.mortgageTransactionDetail.interestRate) {
        mappedVendorObj.primaryMortgage.PrimaryMortgageInterestRate.publicRecordValue = coreLogicCurrentMortgageData.mortgageTransactionDetail.interestRate
        mortgageOverview.newOriginalInterestRate = coreLogicCurrentMortgageData.mortgageTransactionDetail.interestRate
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'PrimaryMortgageInterestRate'}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      } else {
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: 'PrimaryMortgageInterestRate'}, {
          $inc: { 
            empty: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      }
      mappedVendorObj.primaryMortgage.MortgageTransactionDescription.discrepancy = false
      mappedVendorObj.primaryMortgage.MortgageTransactionDescription.backup = null
      mappedVendorObj.primaryMortgage.DeedCategoryDescriprion.discrepancy = false
      mappedVendorObj.primaryMortgage.DeedCategoryDescriprion.backup = null
      mappedVendorObj.primaryMortgage.PrimaryMortgageInterestRate.discrepancy = false
      mappedVendorObj.primaryMortgage.PrimaryMortgageInterestRate.backup = null
    } else {
      coreLogicCurrentMortgageDataBool = false
    }
  }
  for (let j = 11; j < (Object.entries(attomDetailsToParse).length); j++) {
    for (let k = 0; k < Object.entries(Object.entries(attomDetailsToParse)[j][1]).length; k++) {
      let parameterAPIMapping = ''
      let dataPresent = false
      let dataAbsent = false
      let newObj = {empty:false,backup:'',discrepancy:'',publicRecordValue:''}
      if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'PrimaryMortgageAmount') {          
        let clCurrentMortgageBool = false
        parameterAPIMapping = 'PrimaryMortgageAmount'
        let attomBool = false
        let attomValue = 0
        let coreLogicValue = 0
        if (coreLogicCurrentMortgageDataBool && coreLogicCurrentMortgageData.mortgageTransactionDetail.amount > 0) {
          clCurrentMortgageBool = true
          coreLogicValue = coreLogicCurrentMortgageData.mortgageTransactionDetail.amount
        }
        if (attomData.assessment.mortgage.FirstConcurrent.amount) {
          if (attomData.assessment.mortgage.FirstConcurrent.amount > 0) {
            attomBool = true
            attomValue = attomData.assessment.mortgage.FirstConcurrent.amount
          }
        }
        newObj = await mappingMortgage(attomBool, clCurrentMortgageBool, attomValue, coreLogicValue)
        mappedVendorObj.primaryMortgage.PrimaryMortgageAmount.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.primaryMortgage.PrimaryMortgageAmount.publicRecordValue = newObj.newObj.value
        mappedVendorObj.primaryMortgage.PrimaryMortgageAmount.backup = newObj.newObj.backup
        mortgageOverview.newOriginalLoanAmount = newObj.newObj.value
        if (newObj.newObj.value > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'PrimaryLenderName') {     
        let clCurrentMortgageBool = false
        parameterAPIMapping = 'PrimaryLenderName'
        let attomBool = false
        let attomValue = ''
        let coreLogicValue = ''
        if (coreLogicCurrentMortgageDataBool) {
          if (coreLogicCurrentMortgageData.lenderDetail.lenderFullName && coreLogicCurrentMortgageData.lenderDetail.lenderFullName.length > 0) {
            clCurrentMortgageBool = true
            coreLogicValue = coreLogicCurrentMortgageData.lenderDetail.lenderFullName
          } else if (coreLogicCurrentMortgageData.lenderDetail.lenderCompanyName && coreLogicCurrentMortgageData.lenderDetail.lenderCompanyName.length > 0) {
            clCurrentMortgageBool = true
            coreLogicValue = coreLogicCurrentMortgageData.lenderDetail.lenderCompanyName
          } else if (coreLogicCurrentMortgageData.lenderDetail.lenderPostToName && coreLogicCurrentMortgageData.lenderDetail.lenderPostToName.length > 0) {
            clCurrentMortgageBool = true
            coreLogicValue = coreLogicCurrentMortgageData.lenderDetail.lenderPostToName
          }
        }
        if (attomData.assessment.mortgage.FirstConcurrent.lenderLastName) {
          if (attomData.assessment.mortgage.FirstConcurrent.lenderLastName.length > 0) {
            attomBool = true
            attomValue = attomData.assessment.mortgage.FirstConcurrent.lenderLastName
          }
        }
        newObj = await mappingMortgage(attomBool, clCurrentMortgageBool, attomValue, coreLogicValue)
        mappedVendorObj.primaryMortgage.PrimaryLenderName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.primaryMortgage.PrimaryLenderName.publicRecordValue = newObj.newObj.value
        mappedVendorObj.primaryMortgage.PrimaryLenderName.backup = newObj.newObj.backup
        if (newObj.newObj.value && newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'PrimaryMortgageStartDate') {      
        let clCurrentMortgageBool = false
        parameterAPIMapping = 'PrimaryMortgageStartDate'
        let attomBool = false
        let attomValue = ''
        let coreLogicValue = ''
        if (coreLogicCurrentMortgageDataBool && coreLogicCurrentMortgageData.mortgageTransactionDetail.date > 0) {
          clCurrentMortgageBool = true
          coreLogicValue = coreLogicCurrentMortgageData.mortgageTransactionDetail.date
        }
        if (attomData.assessment.mortgage.FirstConcurrent.date) {
          if (attomData.assessment.mortgage.FirstConcurrent.date.length > 0) {
            attomBool = true
            attomValue = attomData.assessment.mortgage.FirstConcurrent.date
          }
        }
        newObj = await mappingMortgage(attomBool, clCurrentMortgageBool, attomValue, coreLogicValue)
        mappedVendorObj.primaryMortgage.PrimaryMortgageStartDate.discrepancy = newObj.newObj.discrepancy
        if (newObj.newObj.value && newObj.newObj.value > 0) {
          mappedVendorObj.primaryMortgage.PrimaryMortgageStartDate.publicRecordValue = moment(newObj.newObj.value, 'YYYYMMDD').toISOString()
          mortgageOverview.newOriginationDate = moment(newObj.newObj.value, 'YYYYMMDD').toISOString()
          mortgageOverview.newOriginationDateLabel = moment(newObj.newObj.value, 'YYYYMMDD').format("MMM Do, YYYY")
        } else if (mortgageOverview.newOriginationDate.length > 0) {
          mappedVendorObj.primaryMortgage.PrimaryMortgageStartDate.publicRecordValue = mortgageOverview.newOriginationDate
        } else {
          mappedVendorObj.primaryMortgage.PrimaryMortgageStartDate.publicRecordValue = ''
        }
        if (newObj.newObj.backup && newObj.newObj.backup.length > 0) {
          mappedVendorObj.primaryMortgage.PrimaryMortgageStartDate.backup = moment(newObj.newObj.backup, 'YYYY-MM-DD').toISOString()
        } else {
          mappedVendorObj.primaryMortgage.PrimaryMortgageStartDate.backup = newObj.newObj.backup
        }
        if (newObj.newObj.value > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'PrimaryLoanType') {
        let clCurrentMortgageBool = false
        parameterAPIMapping = 'PrimaryLoanType'
        let attomBool = false
        let attomValue = ''
        let coreLogicValue = ''
        if (coreLogicCurrentMortgageDataBool && coreLogicCurrentMortgageData.mortgageTransactionDetail.loanTypeCodeDescription.length > 0) {
          clCurrentMortgageBool = true
          coreLogicValue = coreLogicCurrentMortgageData.mortgageTransactionDetail.loanTypeCodeDescription
        }
        if (attomData.assessment.mortgage.FirstConcurrent.loanTypeCode) {
          if (attomData.assessment.mortgage.FirstConcurrent.loanTypeCode === 'CNV') {
            attomValue = 'CONVENTIONAL'
          } else {
            attomValue = attomData.assessment.mortgage.FirstConcurrent.loanTypeCode
          }
          attomBool = true
        }
        newObj = await mappingMortgage(attomBool, clCurrentMortgageBool, attomValue, coreLogicValue)
        mappedVendorObj.primaryMortgage.PrimaryLoanType.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.primaryMortgage.PrimaryLoanType.publicRecordValue = newObj.newObj.value
        mappedVendorObj.primaryMortgage.PrimaryLoanType.backup = newObj.newObj.backup
        if (newObj.newObj.value && newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'PrimaryMortgageTerm') {          
        let clCurrentMortgageBool = false
        parameterAPIMapping = 'PrimaryMortgageTerm'
        let attomBool = false
        let attomValue = 0
        let coreLogicValue = 0
        if (coreLogicCurrentMortgageDataBool && coreLogicCurrentMortgageData.mortgageTransactionDetail.term > 0) {
          clCurrentMortgageBool = true
          coreLogicValue = coreLogicCurrentMortgageData.mortgageTransactionDetail.term
        }
        if (attomData.assessment.mortgage.FirstConcurrent.term) {
          if (attomData.assessment.mortgage.FirstConcurrent.term.length > 0) {
            attomValue = (parseInt(attomData.assessment.mortgage.FirstConcurrent.term)-1)/12
            attomBool = true
          }
        }
        newObj = await mappingMortgage(attomBool, clCurrentMortgageBool, attomValue, coreLogicValue)
        mappedVendorObj.primaryMortgage.PrimaryMortgageTerm.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.primaryMortgage.PrimaryMortgageTerm.publicRecordValue = newObj.newObj.value
        mappedVendorObj.primaryMortgage.PrimaryMortgageTerm.backup = newObj.newObj.backup
        mortgageOverview.newMortgageTerm = newObj.newObj.value
        if (newObj.newObj.value > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'PrimaryMortgageDueDate') {    
        let clCurrentMortgageBool = false
        parameterAPIMapping = 'PrimaryMortgageDueDate'
        let coreLogicValue = ''
        let attomValue = ''
        let attomBool = false
        if (coreLogicCurrentMortgageDataBool && coreLogicCurrentMortgageData.mortgageTransactionDetail.dueDate > 0) {
          clCurrentMortgageBool = true
          coreLogicValue = coreLogicCurrentMortgageData.mortgageTransactionDetail.dueDate
        }
        if (attomData.assessment.mortgage.FirstConcurrent.dueDate) {
          if (attomData.assessment.mortgage.FirstConcurrent.dueDate.length > 0) {
            attomBool = true
            attomValue = attomData.assessment.mortgage.FirstConcurrent.dueDate
          }
        }
        newObj = await mappingMortgage(attomBool, clCurrentMortgageBool, attomValue, coreLogicValue)
        mappedVendorObj.primaryMortgage.PrimaryMortgageDueDate.discrepancy = newObj.newObj.discrepancy
        if (newObj.newObj.value && newObj.newObj.value > 0) {
          mappedVendorObj.primaryMortgage.PrimaryMortgageDueDate.publicRecordValue = moment(newObj.newObj.value, 'YYYYMMDD').toISOString()
        } else {
          mappedVendorObj.primaryMortgage.PrimaryMortgageDueDate.publicRecordValue = newObj.newObj.value
        }
        if (newObj.newObj.backup && newObj.newObj.backup.length > 0) {
          mappedVendorObj.primaryMortgage.PrimaryMortgageDueDate.backup = moment(newObj.newObj.backup, 'YYYYMMDD').toISOString()
        } else {
          mappedVendorObj.primaryMortgage.PrimaryMortgageDueDate.backup = newObj.newObj.backup
        }
        if ((mappedVendorObj.primaryMortgage.PrimaryMortgageDueDate.publicRecordValue && mappedVendorObj.primaryMortgage.PrimaryMortgageDueDate.publicRecordValue.length > 0) || (mappedVendorObj.primaryMortgage.PrimaryMortgageDueDate.backup && mappedVendorObj.primaryMortgage.PrimaryMortgageDueDate.backup.length > 0)) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'TitleCompany') {     
        let clCurrentMortgageBool = false
        parameterAPIMapping = 'TitleCompany'
        let coreLogicValue = ''
        let attomValue = ''
        let attomBool = false
        if (coreLogicCurrentMortgageDataBool && coreLogicCurrentMortgageData.mortgageTitleDetail.titleCompanyName && coreLogicCurrentMortgageData.mortgageTitleDetail.titleCompanyName.length > 0) {
          coreLogicValue = coreLogicCurrentMortgageData.mortgageTitleDetail.titleCompanyName
          clCurrentMortgageBool = true
        }
        if (attomData.assessment.mortgage.title.companyName) {
          attomValue = attomData.assessment.mortgage.title.companyName
          attomBool = true
        }
        newObj = await mappingMortgage(attomBool, clCurrentMortgageBool, attomValue, coreLogicValue)
        mappedVendorObj.primaryMortgage.TitleCompany.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.primaryMortgage.TitleCompany.publicRecordValue = newObj.newObj.value
        mappedVendorObj.primaryMortgage.TitleCompany.backup = newObj.newObj.backup
        if (newObj.newObj.value && newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'OwnershipRights') {     
        let clCurrentMortgageBool = false
        parameterAPIMapping = 'OwnershipRights'
        let coreLogicValue = ''
        if (coreLogicCurrentMortgageDataBool && coreLogicCurrentMortgageData.borrowerDetail.ownershipRightsCodeDescription) {
          coreLogicValue = coreLogicCurrentMortgageData.borrowerDetail.ownershipRightsCodeDescription
          clCurrentMortgageBool = true
        }
        newObj = await mappingMortgage(false, clCurrentMortgageBool, null, coreLogicValue)
        mappedVendorObj.primaryMortgage.OwnershipRights.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.primaryMortgage.OwnershipRights.publicRecordValue = newObj.newObj.value
        mappedVendorObj.primaryMortgage.OwnershipRights.backup = newObj.newObj.backup
        if (newObj.newObj.value && newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'BorrowerRelationship') {     
        let clCurrentMortgageBool = false
        parameterAPIMapping = 'BorrowerRelationship'
        let coreLogicValue = ''
        if (coreLogicCurrentMortgageDataBool && coreLogicCurrentMortgageData.borrowerDetail.relationshipTypeCodeDescription) {
          coreLogicValue = coreLogicCurrentMortgageData.borrowerDetail.relationshipTypeCodeDescription
          clCurrentMortgageBool = true
        }
        newObj = await mappingMortgage(false, clCurrentMortgageBool, null, coreLogicValue)
        mappedVendorObj.primaryMortgage.BorrowerRelationship.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.primaryMortgage.BorrowerRelationship.publicRecordValue = newObj.newObj.value
        mappedVendorObj.primaryMortgage.BorrowerRelationship.backup = newObj.newObj.backup
        if (newObj.newObj.value && newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      }
      if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'SecondaryMortgageAmount') {        
        parameterAPIMapping = 'SecondaryMortgageAmount'
        let attomBool = false
        if (attomData.assessment.mortgage.SecondConcurrent.amount) {
          if (attomData.assessment.mortgage.SecondConcurrent.amount) {
            attomBool = true
          }
        }
        newObj = await mappingMortgage(attomBool, false, attomData.assessment.mortgage.SecondConcurrent.amount, null)
        mappedVendorObj.secondaryMortgage.SecondaryMortgageAmount.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.secondaryMortgage.SecondaryMortgageAmount.publicRecordValue = newObj.newObj.value
        mappedVendorObj.secondaryMortgage.SecondaryMortgageAmount.backup = newObj.newObj.backup
        if (newObj.newObj.value && newObj.newObj.value > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'SecondaryLenderName') {      
        parameterAPIMapping = 'SecondaryLenderName'
        let attomBool = false
        if (attomData.assessment.mortgage.SecondConcurrent.lenderLastName) {
          if (attomData.assessment.mortgage.SecondConcurrent.lenderLastName) {
            attomBool = true
          }
        }
        newObj = await mappingMortgage(attomBool, false, attomData.assessment.mortgage.SecondConcurrent.lenderLastName, null)
        mappedVendorObj.secondaryMortgage.SecondaryLenderName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.secondaryMortgage.SecondaryLenderName.publicRecordValue = newObj.newObj.value
        mappedVendorObj.secondaryMortgage.SecondaryLenderName.backup = newObj.newObj.backup
        if (newObj.newObj.value && newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'SecondaryMortgageRecordingDate') {      
        parameterAPIMapping = 'SecondaryMortgageRecordingDate'
        let attomBool = false
        if (attomData.assessment.mortgage.SecondConcurrent.date) {
          if (attomData.assessment.mortgage.SecondConcurrent.date.length > 0 && attomData.assessment.mortgage.SecondConcurrent.date !== "Invalid date") {
            attomBool = true
          }
        }
        newObj = await mappingMortgage(attomBool, false, attomData.assessment.mortgage.SecondConcurrent.date, null)
        if (newObj.newObj.value && newObj.newObj.value.length > 0) {
          mappedVendorObj.secondaryMortgage.SecondaryMortgageRecordingDate.publicRecordValue = moment(newObj.newObj.value, 'YYYYMMDD').toISOString()
        } else if (newObj.value !== "Invalid date") {
          mappedVendorObj.secondaryMortgage.SecondaryMortgageRecordingDate.publicRecordValue = newObj.newObj.value
        } else {
          mappedVendorObj.secondaryMortgage.SecondaryMortgageRecordingDate.publicRecordValue = null
        }
        if (newObj.newObj.backup && newObj.newObj.backup.length > 0) {
          mappedVendorObj.secondaryMortgage.SecondaryMortgageRecordingDate.backup = moment(newObj.newObj.backup, 'YYYYMMDD').toISOString()
        } else if (newObj.backup !== "Invalid date") {
          mappedVendorObj.secondaryMortgage.SecondaryMortgageRecordingDate.backup = newObj.newObj.backup
        } else {
          mappedVendorObj.secondaryMortgage.SecondaryMortgageRecordingDate.backup = null
        }
        mappedVendorObj.secondaryMortgage.SecondaryMortgageRecordingDate.discrepancy = newObj.newObj.discrepancy
        if (newObj.newObj.value && newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'SecondaryLoanType') {
        parameterAPIMapping = 'SecondaryLoanType'
        let attomBool = false
        let attomValue = ''
        if (attomData.assessment.mortgage.SecondConcurrent.loanTypeCode) {
          if (attomData.assessment.mortgage.SecondConcurrent.loanTypeCode === 'CNV') {
            attomValue = 'CONVENTIONAL'
          } else {
            attomValue = attomData.assessment.mortgage.SecondConcurrent.loanTypeCode
          }
          attomBool = true
        }
        newObj = await mappingMortgage(attomBool, false, attomValue, null)
        mappedVendorObj.secondaryMortgage.SecondaryLoanType.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.secondaryMortgage.SecondaryLoanType.publicRecordValue = newObj.newObj.value
        mappedVendorObj.secondaryMortgage.SecondaryLoanType.backup = newObj.newObj.backup
        if (newObj.newObj.value && newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'SecondaryMortgageTerm') {        
        parameterAPIMapping = 'SecondaryMortgageTerm'
        let attomBool = false
        let attomValue = 0
        if (attomData.assessment.mortgage.SecondConcurrent.term) {
          attomValue = (parseInt(attomData.assessment.mortgage.SecondConcurrent.term)-1)/12
          attomBool = true
        }
        newObj = await mappingMortgage(attomBool, false, attomValue, null)
        mappedVendorObj.secondaryMortgage.SecondaryMortgageTerm.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.secondaryMortgage.SecondaryMortgageTerm.publicRecordValue = newObj.newObj.value
        mappedVendorObj.secondaryMortgage.SecondaryMortgageTerm.backup = newObj.newObj.backup
        if (newObj.newObj.value > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'SecondaryMortgageDueDate') {    
        parameterAPIMapping = 'SecondaryMortgageDueDate'
        let attomBool = false
        if (attomData.assessment.mortgage.SecondConcurrent.dueDate) {
          if (attomData.assessment.mortgage.SecondConcurrent.dueDate.length > 0 && attomData.assessment.mortgage.SecondConcurrent.dueDate !== "Invalid date") {
            attomBool = true
          }
        }
        newObj = await mappingMortgage(attomBool, false, attomData.assessment.mortgage.SecondConcurrent.dueDate, null)
        mappedVendorObj.secondaryMortgage.SecondaryMortgageDueDate.discrepancy = newObj.newObj.discrepancy
        if (newObj.newObj.value && newObj.newObj.value.length > 0) {
          mappedVendorObj.secondaryMortgage.SecondaryMortgageDueDate.publicRecordValue = moment(newObj.newObj.value, 'YYYYMMDD').toISOString()
        } else if (newObj.newObj.value !== "Invalid date") {
          mappedVendorObj.secondaryMortgage.SecondaryMortgageDueDate.publicRecordValue = newObj.newObj.value
        } else {
          mappedVendorObj.secondaryMortgage.SecondaryMortgageDueDate.publicRecordValue = null
        }
        if (newObj.newObj.backup && newObj.newObj.backup.length > 0) {
          mappedVendorObj.secondaryMortgage.SecondaryMortgageDueDate.backup = moment(newObj.newObj.backup, 'YYYYMMDD').toISOString()
        } else if (newObj.newObj.backup !== "Invalid date") {
          mappedVendorObj.secondaryMortgage.SecondaryMortgageDueDate.backup = newObj.newObj.backup
        } else {
          mappedVendorObj.secondaryMortgage.SecondaryMortgageDueDate.backup = null
        }
        if (newObj.newObj.value && newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      }
      let empty = 0
      let backupOnly = 0
      let noBackup = 0
      if (newObj.empty) {
        empty = 1
      } else if (newObj.backupOnly) {
        backupOnly = 1
      } else if (newObj.noBackup) {
        noBackup = 1
      }
      if (dataPresent) {
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: parameterAPIMapping}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
            empty: empty,
            backupOnly: backupOnly,
            noBackup: noBackup,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      } else if (dataAbsent) {
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: parameterAPIMapping}, {
          $inc: { 
            empty: 1,
            totalQueries: 1,
            empty: empty,
            backupOnly: backupOnly,
            noBackup: noBackup,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      }
    }
  }

  for (let j = 0; j < (Object.entries(attomDetailsToParse).length - 2); j++) {
    for (let k = 0; k < Object.entries(Object.entries(attomDetailsToParse)[j][1]).length; k++) {
      let parameterAPIMapping = ''
      let dataPresent = false
      let dataAbsent = false
      let newObj = {empty:false,backup:'',discrepancy:'',publicRecordValue:''}
      if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'FIPS') {
        parameterAPIMapping = 'FIPS'
        if (attomData.identifier.fips) {
          if (attomData.identifier.fips.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.identifiers.FIPS.publicRecordValue = attomData.identifier.fips
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'AttomId') {          
        parameterAPIMapping = 'AttomId'
        if (attomData.identifier.attomId) {
          if (attomData.identifier.attomId.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.identifiers.AttomId.publicRecordValue = attomData.identifier.attomId.toString()
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'County') {          
        parameterAPIMapping = 'County'
        if (attomData.area.munName || attomData.area.countrySecSubd) {
          if (attomData.area.munName) {
            if (attomData.area.munName.length > 0) {
              mappedVendorObj.lot.County.publicRecordValue = attomData.area.munName
              dataPresent = true
            } else if (attomData.area.countrySecSubd) {
              if (attomData.area.countrySecSubd.length > 0) {
                mappedVendorObj.lot.County.publicRecordValue = attomData.area.countrySecSubd.toUpperCase()
                dataPresent = true
              } else {
                dataAbsent = true
                newObj.empty = true
              }
            } else {
              dataAbsent = true
              newObj.empty = true
            }
          } else if (attomData.area.countrySecSubd.length > 0) {
            mappedVendorObj.lot.County.publicRecordValue = attomData.area.countrySecSubd.toUpperCase()
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }
        } else {
          dataAbsent = true
          newObj.empty = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'LegalSubdivisionName') {   
        parameterAPIMapping = 'LegalSubdivisionName'
        if (!legalSubdivisionNameDetermined) {
          mappedVendorObj.lot.LegalSubdivisionName.publicRecordValue = attomData.area.subdName
          if (attomData.area.subdName) {
            if (attomData.area.subdName.length > 0) {
              dataPresent = true
            } else {
              dataAbsent = true
              newObj.empty = true
            }          
          } else {
            dataAbsent = true
            newObj.empty = true
          }
        }       
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'ParcelNumber') {          
        parameterAPIMapping = 'ParcelNumber'
        attomValue = attomData.identifier.apn
        if (attomValue) {
          if (attomValue.length > 0) {
            dataPresent = true
            //* Attom appends '-000'
            //* -> Remove to match PropMix
            if (attomValue.length > 11) {
              attomValue = attomValue.slice(0, -4)
            }
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        newParcelNumber = attomValue
        mappedVendorObj.lot.ParcelNumber.publicRecordValue = attomValue
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'Latitude') {          
        parameterAPIMapping = 'Latitude'
        if (attomData.location.latitude) {
          if (attomData.location.latitude.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.lot.Latitude.publicRecordValue = attomData.location.latitude
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'Longitude') {        
        parameterAPIMapping = 'Longitude'
        if (attomData.location.longitude) {
          if (attomData.location.longitude.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.lot.Longitude.publicRecordValue = attomData.location.longitude
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'LotSizeAcres') {     
        parameterAPIMapping = 'LotSizeAcres'
        if (attomData.lot.lotSize1) {
          if (attomData.lot.lotSize1 > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.lot.LotSizeAcres.publicRecordValue = attomData.lot.lotSize1
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'LotSizeSquareFeet') {   
        parameterAPIMapping = 'LotSizeSquareFeet'
        if (attomData.lot.lotSize2) {
          if (attomData.lot.lotSize2 > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.lot.LotSizeSquareFeet.publicRecordValue = attomData.lot.lotSize2
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'Zoning') {          
        parameterAPIMapping = 'Zoning'
        mappedVendorObj.lot.Zoning.publicRecordValue = ''
        if (attomData.lot.zoningType) {
          if (attomData.lot.zoningType.length > 0) {
            dataPresent = true
            mappedVendorObj.lot.Zoning.publicRecordValue = attomData.lot.zoningType.toUpperCase()
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'CountyUseCode') {          
        parameterAPIMapping = 'CountyUseCode'
        if (attomData.area.countyUse1) {
          if (attomData.area.countyUse1.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.lot.CountyUseCode.publicRecordValue = attomData.area.countyUse1.trim()
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'TaxLot') {    
        parameterAPIMapping = 'TaxLot'
        //TODO:
        if (!taxLotDetermined) {
          if (attomData.lot.lotNum) {
            if (attomData.lot.lotNum.toString().length > 0) {
              mappedVendorObj.lot.TaxLot.publicRecordValue = attomData.lot.lotNum.toString()
              dataPresent = true
              taxLotDetermined = true
            } else {
              mappedVendorObj.lot.TaxLot.publicRecordValue = attomData.lot.lotNum
              dataAbsent = true
            }          
          } else {
            mappedVendorObj.lot.TaxLot.publicRecordValue = attomData.lot.lotNum
            dataAbsent = true
          }
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'TaxCodeArea') {          
        parameterAPIMapping = 'TaxCodeArea'
        if (attomData.area.taxCodeArea) {
          if (attomData.area.taxCodeArea.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.lot.TaxCodeArea.publicRecordValue = attomData.area.taxCodeArea
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'CensusTractId') {          
        parameterAPIMapping = 'CensusTractId'
        if (attomData.area.censusTractIdent) {
          if (attomData.area.censusTractIdent.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.lot.CensusTractId.publicRecordValue = attomData.area.censusTractIdent
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'StreetAddressOneLine') {          
        parameterAPIMapping = 'StreetAddressOneLine'
        if (attomData.address.oneLine) {
          if (attomData.address.oneLine.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.address.StreetAddressOneLine.publicRecordValue = attomData.address.oneLine
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'StreetAddressLine1') {          
        parameterAPIMapping = 'StreetAddressLine1'
        if (attomData.address.line1) {
          if (attomData.address.line1.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.address.StreetAddressLine1.publicRecordValue = attomData.address.line1
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'StreetAddressLine2') {          
        parameterAPIMapping = 'StreetAddressLine2'
        if (attomData.address.line2) {
          if (attomData.address.line2.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.address.StreetAddressLine2.publicRecordValue = attomData.address.line2
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'StreetNumber') {          
        parameterAPIMapping = 'StreetNumber'
        if (attomData.address.situsHouseNumber) {
          if (attomData.address.situsHouseNumber.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.address.StreetNumber.publicRecordValue = attomData.address.situsHouseNumber
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'StreetName') {          
        parameterAPIMapping = 'StreetName'
        if (attomData.address.situsStreetName) {
          if (attomData.address.situsStreetName.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.address.StreetName.publicRecordValue = attomData.address.situsStreetName
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'City') {          
        parameterAPIMapping = 'City'
        if (attomData.address.locality) {
          if (attomData.address.locality.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.address.City.publicRecordValue = attomData.address.locality
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'StateOrProvince') {          
        parameterAPIMapping = 'StateOrProvince'
        if (attomData.address.countrySubd) {
          if (attomData.address.countrySubd.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.address.StateOrProvince.publicRecordValue = attomData.address.countrySubd
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'PostalCode') {          
        parameterAPIMapping = 'PostalCode'
        if (attomData.address.postal1) {
          if (attomData.address.postal1.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.address.PostalCode.publicRecordValue = attomData.address.postal1
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'PostalCodePlus4') {          
        parameterAPIMapping = 'PostalCodePlus4'
        if (attomData.address.postal2) {
          if (attomData.address.postal2.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.address.PostalCodePlus4.publicRecordValue = attomData.address.postal2
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'PropertyType') {  
        parameterAPIMapping = 'PropertyType'
        if (attomData.summary.propSubType) {
          if (attomData.summary.propSubType.length > 0) {
            dataPresent = true
            newPropertyType = attomData.summary.propSubType.toUpperCase()
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.summary.PropertyType.publicRecordValue = newPropertyType
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'PropertySubType') {          
        parameterAPIMapping = 'PropertySubType'
        let attomValue = attomData.summary.propType
        if (attomValue) {
          if (attomValue.length > 0) {
            dataPresent = true
            attomValue = attomValue.toUpperCase()
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.summary.PropertySubType.publicRecordValue = attomValue
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'QuitClaimFlag') {          
        parameterAPIMapping = 'QuitClaimFlag'
        let attomValue = attomData.summary.quitClaimFlag
        if (attomValue) {
          if (attomValue.length > 0) {
            dataPresent = true
            attomValue = attomValue.toUpperCase()
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.summary.QuitClaimFlag.publicRecordValue = attomValue
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'REOflag') {          
        parameterAPIMapping = 'REOflag'
        let attomValue = attomData.summary.REOflag
        if (attomValue) {
          if (attomValue.length > 0) {
            dataPresent = true
            attomValue = attomValue.toUpperCase()
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.summary.REOflag.publicRecordValue = attomValue
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'LastSaleRecordingDate') {          
        parameterAPIMapping = 'LastSaleRecordingDate'
        if (attomData.sale.saleRecDate || attomData.sale.saleSearchDate) {
          if (attomData.sale.saleRecDate) {
            if (attomData.sale.saleRecDate.length > 0) {
              mappedVendorObj.sale.LastSaleRecordingDate.publicRecordValue = attomData.sale.saleRecDate
              dataPresent = true
            } else if (attomData.sale.saleSearchDate) {
              if (attomData.sale.saleSearchDate.length > 0) {
                mappedVendorObj.sale.LastSaleRecordingDate.publicRecordValue = attomData.sale.saleSearchDate
                dataPresent = true
              } else {
                dataAbsent = true
                newObj.empty = true
              }      
            } else {
              dataAbsent = true
              newObj.empty = true
            }
          } else if (attomData.sale.saleSearchDate.length > 0) {
            mappedVendorObj.sale.LastSaleRecordingDate.publicRecordValue = attomData.sale.saleSearchDate
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }
        } else {
          dataAbsent = true
          newObj.empty = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'LastSaleContractDate') {          
        parameterAPIMapping = 'LastSaleContractDate'
        if (attomData.sale.saleSearchDate) {
          if (attomData.sale.saleSearchDate.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.sale.LastSaleContractDate.publicRecordValue = attomData.sale.saleSearchDate
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'LastSaleDate') {          
        parameterAPIMapping = 'LastSaleDate'
        if (attomData.sale.saleTransDate) {
          if (attomData.sale.saleTransDate.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.sale.LastSaleDate.publicRecordValue = attomData.sale.saleTransDate
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'ClosePrice') {          
        parameterAPIMapping = 'ClosePrice'
        if (attomData.sale.amount.saleAmt) {
          if (attomData.sale.amount.saleAmt > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.sale.ClosePrice.publicRecordValue = attomData.sale.amount.saleAmt
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'BuildingAreaTotal') {          
        parameterAPIMapping = 'BuildingAreaTotal'
        if (attomData.building.size.bldgSize) {
          if (attomData.building.size.bldgSize > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.living.BuildingAreaTotal.publicRecordValue = attomData.building.size.bldgSize
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'GrossArea') {          
        parameterAPIMapping = 'GrossArea'
        //TODO:
        if (attomData.building.size.grossSize || attomData.building.size.grossSizeAdjusted) {
          if (attomData.building.size.grossSize) {
            if (attomData.building.size.grossSize > 0) {
              dataPresent = true
              mappedVendorObj.living.GrossArea.publicRecordValue = attomData.building.size.grossSize
            } else if (attomData.building.size.grossSizeAdjusted) {
              if (attomData.building.size.grossSizeAdjusted > 0) {
                dataPresent = true
                mappedVendorObj.living.GrossArea.publicRecordValue = attomData.building.size.grossSizeAdjusted
              } else {
                dataAbsent = true
                newObj.empty = true
              }
            } else {
              dataAbsent = true
              newObj.empty = true
            }
          } else if (attomData.building.size.grossSizeAdjusted > 0) {
            dataPresent = true
            mappedVendorObj.living.GrossArea.publicRecordValue = attomData.building.size.grossSizeAdjusted
          } else {
            dataAbsent = true
            newObj.empty = true
          }
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'LivingArea') {          
        parameterAPIMapping = 'LivingArea'
        //TODO:
        if (attomData.building.size.livingSize) {
          if (attomData.building.size.livingSize.toString() && attomData.building.size.livingSize.toString().length > 0) {
            mappedVendorObj.living.LivingArea.publicRecordValue = attomData.building.size.livingSize.toString()
            dataPresent = true
          } else {
            mappedVendorObj.living.LivingArea.publicRecordValue = attomData.building.size.livingSize
            dataAbsent = true
          }          
        } else {
          mappedVendorObj.living.LivingArea.publicRecordValue = attomData.building.size.livingSize
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'RoomsTotal') {          
        parameterAPIMapping = 'RoomsTotal'
        if (attomData.building.rooms.roomsTotal) {
          if (attomData.building.rooms.roomsTotal > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.living.RoomsTotal.publicRecordValue = attomData.building.rooms.roomsTotal
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'BedroomsTotal') {          
        parameterAPIMapping = 'BedroomsTotal'
        if (attomData.building.rooms.beds) {
          if (attomData.building.rooms.beds > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.living.BedroomsTotal.publicRecordValue = attomData.building.rooms.beds
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'BathroomsFull') {          
        parameterAPIMapping = 'BathroomsFull'
        if (attomData.building.rooms.bathsFull) {
          if (attomData.building.rooms.bathsFull > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.living.BathroomsFull.publicRecordValue = attomData.building.rooms.bathsFull
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'BathroomsTotalInteger') {          
        parameterAPIMapping = 'BathroomsTotalInteger'
        if (attomData.building.rooms.bathsTotal) {
          if (attomData.building.rooms.bathsTotal > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.living.BathroomsTotalInteger.publicRecordValue = attomData.building.rooms.bathsTotal
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'Heating') {          
        parameterAPIMapping = 'Heating'
        let attomValue = attomData.utilities.heatingType
        if (attomValue) {
          if (attomValue.length > 0) {
            attomValue = attomValue.toUpperCase()
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.living.Heating.publicRecordValue = attomValue
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'YearBuilt') {          
        parameterAPIMapping = 'YearBuilt'
        if (attomData.summary.yearBuilt) {
          if (attomData.summary.yearBuilt > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.building.YearBuilt.publicRecordValue = attomData.summary.yearBuilt
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'YearBuiltEffective') {          
        parameterAPIMapping = 'YearBuiltEffective'
        if (attomData.building.construction.propertyStructureMajorImprovementsYear) {
          if (attomData.building.construction.propertyStructureMajorImprovementsYear.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.building.YearBuiltEffective.publicRecordValue = attomData.building.construction.propertyStructureMajorImprovementsYear
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'ArchitecturalStyle') {          
        parameterAPIMapping = 'ArchitecturalStyle'
        let attomValue = attomData.summary.archStyle
        if (attomValue) {
          if (attomValue.length > 0) {
            dataPresent = true
            attomValue = attomValue.toUpperCase()
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.building.ArchitecturalStyle.publicRecordValue = attomValue
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'ConstructionType') {          
        parameterAPIMapping = 'ConstructionType'
        if (attomData.building.construction.constructionType) {
          if (attomData.building.construction.constructionType.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.building.ConstructionType.publicRecordValue = attomData.building.construction.constructionType
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'FrameType') {          
        parameterAPIMapping = 'FrameType'
        mappedVendorObj.building.FrameType.publicRecordValue = ''
        if (attomData.building.construction.frameType) {
          if (attomData.building.construction.frameType.length > 0) {
            dataPresent = true
            mappedVendorObj.building.FrameType.publicRecordValue = attomData.building.construction.frameType.toUpperCase()
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'ExteriorWallsType') {          
        parameterAPIMapping = 'ExteriorWallsType'
        if (attomData.building.construction.wallType) {
          if (attomData.building.construction.wallType.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.building.ExteriorWallsType.publicRecordValue = attomData.building.construction.wallType
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'GarageSpaces') {          
        parameterAPIMapping = 'GarageSpaces'
        if (attomData.building.parking.prkgSpaces) {
          if (attomData.building.parking.prkgSpaces.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.building.GarageSpaces.publicRecordValue = attomData.building.parking.prkgSpaces
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'GarageArea') {      
        parameterAPIMapping = 'GarageArea'
        if (attomData.building.parking.prkgSize) {
          if (attomData.building.parking.prkgSize > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.building.GarageArea.publicRecordValue = attomData.building.parking.prkgSize
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'ParkingSpaces') {          
        parameterAPIMapping = 'ParkingSpaces'
        if (attomData.building.parking.prkgSpaces) {
          if (attomData.building.parking.prkgSpaces.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.building.ParkingSpaces.publicRecordValue = attomData.building.parking.prkgSpaces
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'AssessedValue') {          
        parameterAPIMapping = 'AssessedValue'
        if (attomData.assessment.assessed.assdTtlValue) {
          if (attomData.assessment.assessed.assdTtlValue > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.assessment.AssessedValue.publicRecordValue = attomData.assessment.assessed.assdTtlValue
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'AssessedLandValue') {          
        parameterAPIMapping = 'AssessedLandValue'
        if (attomData.assessment.assessed.assdLandValue) {
          if (attomData.assessment.assessed.assdLandValue > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.assessment.AssessedLandValue.publicRecordValue = attomData.assessment.assessed.assdLandValue
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'AssessedImprovementValue') {          
        parameterAPIMapping = 'AssessedImprovementValue'
        //TODO: bring in newObj.empty
        if (attomData.assessment.assessed.assdImprValue) {
          if (attomData.assessment.assessed.assdImprValue.toString() && attomData.assessment.assessed.assdImprValue.toString().length > 0) {
            dataPresent = true
            mappedVendorObj.assessment.AssessedImprovementValue.publicRecordValue = attomData.assessment.assessed.assdImprValue.toString()
          } else {
            dataAbsent = true
            mappedVendorObj.assessment.AssessedImprovementValue.publicRecordValue = attomData.assessment.assessed.assdImprValue
          }          
        } else {
          mappedVendorObj.assessment.AssessedImprovementValue.publicRecordValue = attomData.assessment.assessed.assdImprValue
          dataAbsent = true
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'TaxYear') {          
        parameterAPIMapping = 'TaxYear'
        if (attomData.assessment.tax.taxYear) {
          if (attomData.assessment.tax.taxYear > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.tax.TaxYear.publicRecordValue = attomData.assessment.tax.taxYear
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'TaxAnnualAmount') {          
        parameterAPIMapping = 'TaxAnnualAmount'
        let newString = attomData.assessment.tax.taxAmt.toString()
        if (attomData.assessment.tax.taxAmt) {
          if (attomData.assessment.tax.taxAmt > 0 || attomData.assessment.tax.taxAmt.length > 0) {
            if (newString.charAt(0) === '$') {
              newString = newString.slice(1)              
            }
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.tax.TaxAnnualAmount.publicRecordValue = newString
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'OwnerOccupied') {          
        parameterAPIMapping = 'OwnerOccupied'
        if (attomData.summary.absenteeInd) {
          if (attomData.summary.absenteeInd.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.tax.OwnerOccupied.publicRecordValue = attomData.summary.absenteeInd
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'CorporateIndicator') {          
        parameterAPIMapping = 'CorporateIndicator'
        if (attomData.assessment.owner.corporateIndicator) {
          if (attomData.assessment.owner.corporateIndicator.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.owner1.CorporateIndicator.publicRecordValue = attomData.assessment.owner.corporateIndicator
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'Owner1FullName') {          
        parameterAPIMapping = 'Owner1FullName'
        if (attomData.assessment.owner.owner1.fullName) {
          if (attomData.assessment.owner.owner1.fullName.length > 0) {
            dataPresent = true
            mappedVendorObj.owner1.Owner1FullName.publicRecordValue = attomData.assessment.owner.owner1.fullName
          } else {
            dataAbsent = true
            newObj.empty = true
            mappedVendorObj.owner1.Owner1FullName.publicRecordValue = ''
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
          mappedVendorObj.owner1.Owner1FullName.publicRecordValue = ''
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'Owner1LastName') {          
        parameterAPIMapping = 'Owner1LastName'
        if (attomData.assessment.owner.owner1.lastName) {
          if (attomData.assessment.owner.owner1.lastName.length > 0) {
            mappedVendorObj.owner1.Owner1LastName.publicRecordValue = attomData.assessment.owner.owner1.lastName
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
            mappedVendorObj.owner1.Owner1LastName.publicRecordValue = ''
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
          mappedVendorObj.owner1.Owner1LastName.publicRecordValue = ''
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'Owner1FirstName') {          
        parameterAPIMapping = 'Owner1FirstName'
        if (attomData.assessment.owner.owner1.firstNameAndMi) {
          if (attomData.assessment.owner.owner1.firstNameAndMi.length > 0) {
            mappedVendorObj.owner1.Owner1FirstName.publicRecordValue = attomData.assessment.owner.owner1.firstNameAndMi
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
            mappedVendorObj.owner1.Owner1FirstName.publicRecordValue = ''
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
          mappedVendorObj.owner1.Owner1FirstName.publicRecordValue = ''
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'Owner2FullName') {          
        parameterAPIMapping = 'Owner2FullName'
        if (attomData.assessment.owner.owner3.fullName) {
          if (attomData.assessment.owner.owner3.fullName.length > 0) {
            mappedVendorObj.owner2.Owner2FullName.publicRecordValue = attomData.assessment.owner.owner3.fullName
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
            mappedVendorObj.owner2.Owner2FullName.publicRecordValue = ''
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
          mappedVendorObj.owner2.Owner2FullName.publicRecordValue = ''
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'Owner2LastName') {          
        parameterAPIMapping = 'Owner2LastName'
        if (attomData.assessment.owner.owner3.lastName) {
          if (attomData.assessment.owner.owner3.lastName.length > 0) {
            mappedVendorObj.owner2.Owner2LastName.publicRecordValue = attomData.assessment.owner.owner3.lastName
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
            mappedVendorObj.owner2.Owner2LastName.publicRecordValue = ''
          }          
        } else {
          dataAbsent = true
          newObj.empty = true
          mappedVendorObj.owner2.Owner2LastName.publicRecordValue = ''
        }
      } else if (Object.entries(Object.entries(attomDetailsToParse)[j][1])[k][0] === 'Owner2FirstName') {          
        parameterAPIMapping = 'Owner2FirstName'
        if (attomData.assessment.owner.owner3.firstNameAndMi) {
          if (attomData.assessment.owner.owner3.firstNameAndMi.length > 0) {
            mappedVendorObj.owner2.Owner2FirstName.publicRecordValue = attomData.assessment.owner.owner3.firstNameAndMi
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
            mappedVendorObj.owner2.Owner2FirstName.publicRecordValue = ''
          }   
        } else {
          dataAbsent = true
          newObj.empty = true
          mappedVendorObj.owner2.Owner2FirstName.publicRecordValue = ''
        }
      }
      let empty = 0
      let backupOnly = 0
      let noBackup = 0
      if (newObj.empty) {
        empty = 1
      } else if (newObj.backupOnly) {
        backupOnly = 1
      } else if (newObj.noBackup) {
        noBackup = 1
      }
      if (dataPresent) {
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: parameterAPIMapping}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      } else if (dataAbsent) {
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: parameterAPIMapping}, {
          $inc: { 
            empty: 1,
            totalQueries: 1,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      }
    }
  }

  if (propMixDataBool && attomDataBool) {
    for (let i = 0; i < Object.entries(propMixData).length; i++) {
      let parameterAPIMapping = ''
      let newObj = {empty:false,backup:'',discrepancy:'',publicRecordValue:''}
      let dataPresent = false
      let dataAbsent = false
      if (Object.entries(propMixData)[i][0] === 'FIPS') {
        parameterAPIMapping = 'FIPS'
        newObj = await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], attomData.identifier.fips)
        mappedVendorObj.identifiers.FIPS.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.identifiers.FIPS.publicRecordValue = newObj.newObj.value
        mappedVendorObj.identifiers.FIPS.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'PMXPropertyId') {
        parameterAPIMapping = 'PMXPropertyId'
        mappedVendorObj.identifiers.PMXPropertyId.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }                
      } else if (Object.entries(propMixData)[i][0] === 'Municipality') {
        parameterAPIMapping = 'Municipality'
        mappedVendorObj.lot.Municipality.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'LegalSubdivisionName') {
        parameterAPIMapping = 'LegalSubdivisionName'
        if (!legalSubdivisionNameDetermined) {
          newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.area.subdName)
          mappedVendorObj.lot.LegalSubdivisionName.discrepancy = newObj.newObj.discrepancy
          mappedVendorObj.lot.LegalSubdivisionName.publicRecordValue = newObj.newObj.value
          mappedVendorObj.lot.LegalSubdivisionName.backup = newObj.newObj.backup

          if (newObj.newObj.value.length > 0) {
            dataPresent = true
            legalSubdivisionNameDetermined = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }
        }
      } else if (Object.entries(propMixData)[i][0] === 'ParcelNumber') {
        parameterAPIMapping = 'ParcelNumber'
        //* Attom appends '-000'
        //* -> Remove to match PropMix
        let attomValue = attomData.identifier.apn
        if (attomValue.length > 11) {
          attomValue = attomValue.slice(0, -4)
        }
        newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], attomValue, true)
        newParcelNumber = newObj.newObj.value
        mappedVendorObj.lot.ParcelNumber.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.lot.ParcelNumber.publicRecordValue = newObj.newObj.value
        mappedVendorObj.lot.ParcelNumber.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(propMixData)[i][0] === 'Latitude') {
        parameterAPIMapping = 'Latitude'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.lot.longitude)
        mappedVendorObj.lot.Latitude.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.lot.Latitude.publicRecordValue = newObj.newObj.value
        mappedVendorObj.lot.Latitude.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'Longitude') {
        parameterAPIMapping = 'Longitude'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.lot.longitude)
        mappedVendorObj.lot.Longitude.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.lot.Longitude.publicRecordValue = newObj.newObj.value
        mappedVendorObj.lot.Longitude.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'LotSizeAcres') {
        parameterAPIMapping = 'LotSizeAcres'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.lot.lotSize1)
        mappedVendorObj.lot.LotSizeAcres.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.lot.LotSizeAcres.publicRecordValue = newObj.newObj.value
        mappedVendorObj.lot.LotSizeAcres.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'LotSizeSquareFeet') {
        parameterAPIMapping = 'LotSizeSquareFeet'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.lot.lotSize2)
        mappedVendorObj.lot.LotSizeSquareFeet.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.lot.LotSizeSquareFeet.publicRecordValue = newObj.newObj.value
        mappedVendorObj.lot.LotSizeSquareFeet.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }       
      } else if (Object.entries(propMixData)[i][0] === 'Zoning') {          
        parameterAPIMapping = 'Zoning'
        newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], attomData.lot.zoningType)
        mappedVendorObj.lot.Zoning.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.lot.Zoning.publicRecordValue = newObj.newObj.value
        mappedVendorObj.lot.Zoning.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }              
      } else if (Object.entries(propMixData)[i][0] === 'CountyLandUseCode') {
        parameterAPIMapping = 'CountyLandUseCode'
        mappedVendorObj.lot.CountyLandUseCode.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }                 
      } else if (Object.entries(propMixData)[i][0] === 'BelowGradeTotalArea') {
        parameterAPIMapping = 'BelowGradeTotalArea'
        mappedVendorObj.lot.BelowGradeTotalArea.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'BelowGradeFinishedArea') {
        parameterAPIMapping = 'BelowGradeFinishedArea'
        mappedVendorObj.lot.BelowGradeFinishedArea.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }                 
      } else if (Object.entries(propMixData)[i][0] === 'LandUseCode') {
        parameterAPIMapping = 'LandUseCode'
        mappedVendorObj.lot.LandUseCode.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxLot' || Object.entries(propMixData)[i][0] === 'TaxLotList') {
        parameterAPIMapping = 'TaxLot'
        if (!taxLotDetermined) {
          newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], attomData.lot.lotNum)
          if (newObj.newObj.value && newObj.newObj.value.toString().length > 0) {
            dataPresent = true
            taxLotDetermined = true
            mappedVendorObj.lot.TaxLot.discrepancy = newObj.newObj.discrepancy
            if (typeof newObj.newObj.value === 'string') {
              mappedVendorObj.lot.TaxLot.publicRecordValue = newObj.newObj.value.toString()
            } else {
              mappedVendorObj.lot.TaxLot.publicRecordValue = newObj.newObj.value
            }
            if (typeof newObj.newObj.backup === 'string') {
              mappedVendorObj.lot.TaxLot.backup = newObj.newObj.backup.toString()
            } else {
              mappedVendorObj.lot.TaxLot.backup = newObj.newObj.backup
            }
          } else {
            if (taxLockSecondAttempt) {
              newObj.empty = true
              dataAbsent = true
            }
            taxLockSecondAttempt = true
          }
        }
      } else if (Object.entries(propMixData)[i][0] === 'TaxBlock') {
        parameterAPIMapping = 'TaxBlock'
        mappedVendorObj.lot.TaxBlock.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }                        
      } else if (Object.entries(propMixData)[i][0] === 'CensusTractId') {
        parameterAPIMapping = 'CensusTractId'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.area.censusTractIdent)
        mappedVendorObj.lot.CensusTractId.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.lot.CensusTractId.publicRecordValue = newObj.newObj.value
        mappedVendorObj.lot.CensusTractId.backup = newObj.newObj.backup
        if (newObj.newObj.value) {
          if (newObj.newObj.value.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
          }          
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(propMixData)[i][0] === 'StreetAddress') {
        parameterAPIMapping = 'StreetAddressLine1'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.address.line1)
        mappedVendorObj.address.StreetAddressLine1.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.StreetAddressLine1.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.StreetAddressLine1.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'StreetNumber') {
        parameterAPIMapping = 'StreetNumber'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.address.situsHouseNumber)
        mappedVendorObj.address.StreetNumber.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.StreetNumber.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.StreetNumber.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'UnitPrefix') {
        parameterAPIMapping = 'UnitPrefix'
        mappedVendorObj.address.UnitPrefix.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'UnitNumber') {
        parameterAPIMapping = 'UnitNumber'
        mappedVendorObj.address.UnitNumber.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'StreetDirPrefix') {
        parameterAPIMapping = 'StreetDirPrefix'
        mappedVendorObj.address.StreetDirPrefix.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'StreetName') {
        parameterAPIMapping = 'StreetName'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.address.situsStreetName)
        mappedVendorObj.address.StreetName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.StreetName.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.StreetName.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'StreetSuffix') {
        parameterAPIMapping = 'StreetSuffix'
        let format = await formatStreetSuffix(Object.entries(propMixData)[i][1], 'query')
        if (format.isError) {
          formattingErrors.push(...format.errors)
        } else {
          mappedVendorObj.address.StreetSuffix.publicRecordValue = Object.entries(propMixData)[i][1]
          if (Object.entries(propMixData)[i][1].length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }
        }
      } else if (Object.entries(propMixData)[i][0] === 'StreetDirSuffix') {
        parameterAPIMapping = 'StreetDirSuffix'
        mappedVendorObj.address.StreetDirSuffix.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'City') {
        parameterAPIMapping = 'City'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.address.locality)
        mappedVendorObj.address.City.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.City.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.City.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'StateOrProvince') {
        parameterAPIMapping = 'StateOrProvince'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.address.countrySubd)
        mappedVendorObj.address.StateOrProvince.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.StateOrProvince.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.StateOrProvince.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'PostalCode') {
        parameterAPIMapping = 'PostalCode'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.address.postal1)
        mappedVendorObj.address.PostalCode.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.PostalCode.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.PostalCode.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'PostalCodePlus4') {
        parameterAPIMapping = 'PostalCodePlus4'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.address.postal2)
        mappedVendorObj.address.PostalCodePlus4.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.PostalCodePlus4.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.PostalCodePlus4.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'WaterSource') {
        parameterAPIMapping = 'WaterSource'
        mappedVendorObj.summary.WaterSource.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'SewerType') {
        parameterAPIMapping = 'SewerType'
        mappedVendorObj.summary.SewerType.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'SchoolDistrict') {
        parameterAPIMapping = 'SchoolDistrict'
        mappedVendorObj.summary.SchoolDistrict.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'PropertyType') {    
        parameterAPIMapping = 'PropertyType'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.summary.propSubType)
        newPropertyType = newObj.newObj.value.toUpperCase()
        mappedVendorObj.summary.PropertyType.discrepancy = newObj.newObj.discrepancy
        if (typeof newObj.newObj.value === 'string') {
          mappedVendorObj.summary.PropertyType.publicRecordValue = newObj.newObj.value.toUpperCase()
        } else {
          mappedVendorObj.summary.PropertyType.publicRecordValue = newPropertyType
        }
        if (typeof newObj.newObj.backup === 'string') {
          mappedVendorObj.summary.PropertyType.backup = newObj.newObj.backup.toUpperCase()
        } else {
          mappedVendorObj.summary.PropertyType.backup = newPropertyType
        }
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'PropertySubType') {
        parameterAPIMapping = 'PropertySubType'
        let propMixValue = Object.entries(propMixData)[i][1]
        if (propMixValue) {
          propMixValue = propMixValue.toUpperCase()
        }
        let attomValue = attomData.summary.propType
        if (attomValue) {
          attomValue = attomValue.toUpperCase()
        }
        newObj =  await mappingPropMixT(attomDataBool, propMixValue, attomValue)
        mappedVendorObj.summary.PropertySubType.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.summary.PropertySubType.publicRecordValue = newObj.newObj.value
        mappedVendorObj.summary.PropertySubType.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'DistressYN') {
        parameterAPIMapping = 'DistressYN'
        mappedVendorObj.summary.DistressYN.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'LeaseholdOrFeeSimple') {
        parameterAPIMapping = 'LeaseholdOrFeeSimple'
        let propMixValue = Object.entries(propMixData)[i][1]
        if (propMixValue.length > 0) {
          dataPresent = true
          propMixValue = propMixValue.toUpperCase()
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.sale.LeaseholdOrFeeSimple.publicRecordValue = propMixValue
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleRecordingDate') {
        let saleRecDate = ''
        let saleSearchDate = ''
        if (attomData.sale.saleRecDate) {
          saleRecDate = attomData.sale.saleRecDate
        }
        if (attomData.sale.saleSearchDate) {
          saleSearchDate = attomData.sale.saleSearchDate
        }
        parameterAPIMapping = 'LastSaleRecordingDate'
        newObj =  await mappingPropMixTT(attomDataBool, Object.entries(propMixData)[i][1], saleRecDate, saleSearchDate)
        mappedVendorObj.sale.LastSaleRecordingDate.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.sale.LastSaleRecordingDate.publicRecordValue = newObj.newObj.value
        mappedVendorObj.sale.LastSaleRecordingDate.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleContractDate') {
        parameterAPIMapping = 'LastSaleContractDate'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.sale.saleTransDate)
        mappedVendorObj.sale.LastSaleContractDate.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.sale.LastSaleContractDate.publicRecordValue = newObj.newObj.value
        mappedVendorObj.sale.LastSaleContractDate.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleDate') {
        parameterAPIMapping = 'LastSaleDate'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.sale.saleTransDate)
        mappedVendorObj.sale.LastSaleDate.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.sale.LastSaleDate.publicRecordValue = newObj.newObj.value
        mappedVendorObj.sale.LastSaleDate.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'ClosePrice') {
        parameterAPIMapping = 'ClosePrice'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.sale.amount.saleAmt)
        mappedVendorObj.sale.ClosePrice.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.sale.ClosePrice.publicRecordValue = newObj.newObj.value
        mappedVendorObj.sale.ClosePrice.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(propMixData)[i][0] === 'ClosePriceDescription') {
        parameterAPIMapping = 'ClosePriceDescription'
        if (Object.entries(propMixData)[i][1] && Object.entries(propMixData)[i][1].length > 0) {
          mappedVendorObj.sale.ClosePriceDescription.publicRecordValue = Object.entries(propMixData)[i][1].trim()
        } else {
          mappedVendorObj.sale.ClosePriceDescription.publicRecordValue = ''
        }
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }                 
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleTransactionId') {
        parameterAPIMapping = 'LastSaleTransactionId'
        mappedVendorObj.sale.LastSaleTransactionId.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleBuyerName') {
        parameterAPIMapping = 'LastSaleBuyerName'
        if (Object.entries(propMixData)[i][1] && Object.entries(propMixData)[i][1].length > 0) {
          mappedVendorObj.sale.LastSaleBuyerName.publicRecordValue = Object.entries(propMixData)[i][1].trim()
        } else {
          mappedVendorObj.sale.LastSaleBuyerName.publicRecordValue = ''
        }
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'SaleDocType') {
        parameterAPIMapping = 'SaleDocType'
        mappedVendorObj.sale.SaleDocType.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleRecordingDocumentId') {
        parameterAPIMapping = 'LastSaleRecordingDocumentId'
        mappedVendorObj.sale.LastSaleRecordingDocumentId.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }                 
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleSeller2FullName') {
        parameterAPIMapping = 'LastSaleSeller2FullName'
        mappedVendorObj.sale.LastSaleSeller2FullName.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleSeller1FullName') {
        parameterAPIMapping = 'LastSaleSeller1FullName'
        mappedVendorObj.sale.LastSaleSeller1FullName.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'BuildingAreaTotal') {
        parameterAPIMapping = 'BuildingAreaTotal'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.building.size.bldgSize)
        mappedVendorObj.living.BuildingAreaTotal.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.BuildingAreaTotal.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.BuildingAreaTotal.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'GrossArea') {
        let grossSize = ''
        let grossSizeAdjusted = ''
        if (attomData.sale.grossSize) {
          grossSize = attomData.sale.grossSize
        }
        if (attomData.sale.grossSizeAdjusted) {
          grossSizeAdjusted = attomData.sale.grossSizeAdjusted
        }
        parameterAPIMapping = 'GrossArea'
        newObj =  await mappingPropMixTT(attomDataBool, Object.entries(propMixData)[i][1], grossSize, grossSizeAdjusted)
        mappedVendorObj.living.GrossArea.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.GrossArea.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.GrossArea.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'LivingArea') {
        parameterAPIMapping = 'LivingArea'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.building.size.livingSize)
        mappedVendorObj.living.LivingArea.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.LivingArea.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.LivingArea.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }         
      } else if (Object.entries(propMixData)[i][0] === 'StoriesTotal' || Object.entries(propMixData)[i][0] === 'StoriesDescription') {
        parameterAPIMapping = 'Stories'
        if (!storiesDetermined) {
          if (Object.entries(propMixData)[i][1].length > 0) {
            dataPresent = true
            storiesDetermined = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }    
        }
        mappedVendorObj.living.Stories.publicRecordValue = Object.entries(propMixData)[i][1]
      } else if (Object.entries(propMixData)[i][0] === 'RoomsTotal') {
        parameterAPIMapping = 'RoomsTotal'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.building.rooms.roomsTotal)
        mappedVendorObj.living.RoomsTotal.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.RoomsTotal.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.RoomsTotal.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'BedroomsTotal') {
        parameterAPIMapping = 'BedroomsTotal'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.building.rooms.beds)
        mappedVendorObj.living.BedroomsTotal.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.BedroomsTotal.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.BedroomsTotal.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'BathroomsFull') {
        parameterAPIMapping = 'BathroomsFull'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.building.rooms.bathsFull)
        mappedVendorObj.living.BathroomsFull.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.BathroomsFull.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.BathroomsFull.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'BathroomsTotalInteger') {
        parameterAPIMapping = 'BathroomsTotalInteger'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.building.rooms.bathsTotal)
        mappedVendorObj.living.BathroomsTotalInteger.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.BathroomsTotalInteger.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.BathroomsTotalInteger.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'FireplacesTotal') {
        parameterAPIMapping = 'FireplacesTotal'
        mappedVendorObj.living.FireplacesTotal.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }
      } else if (Object.entries(propMixData)[i][0] === 'Heating') {
        parameterAPIMapping = 'Heating'
        let propMixValue = Object.entries(propMixData)[i][1]
        if (propMixValue) {
          propMixValue = propMixValue.toUpperCase()
        }
        let attomValue = attomData.utilities.heatingType
        if (attomValue) {
          attomValue = attomValue.toUpperCase()
        }
        newObj =  await mappingPropMixT(attomDataBool, propMixValue, attomValue)
        mappedVendorObj.living.Heating.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.Heating.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.Heating.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'Cooling') {
        parameterAPIMapping = 'Cooling'
        mappedVendorObj.living.Cooling.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'PoolType') {
        parameterAPIMapping = 'PoolType'
        newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], attomData.lot.poolType)
        mappedVendorObj.living.PoolType.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.PoolType.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.PoolType.backup = newObj.newObj.backup   
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'BuildingQualityScore') {
        parameterAPIMapping = 'BuildingQualityScore'
        mappedVendorObj.building.BuildingQualityScore.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'BuildingCondition') {
        parameterAPIMapping = 'BuildingCondition'
        mappedVendorObj.building.BuildingCondition.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'YearBuilt') {
        parameterAPIMapping = 'YearBuilt'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.summary.yearBuilt)
        mappedVendorObj.building.YearBuilt.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.YearBuilt.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.YearBuilt.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'YearBuiltEffective') {
        parameterAPIMapping = 'YearBuiltEffective'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.building.construction.propertyStructureMajorImprovementsYear)
        mappedVendorObj.building.YearBuiltEffective.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.YearBuiltEffective.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.YearBuiltEffective.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'NumberOfBuildings') {
        parameterAPIMapping = 'NumberOfBuildings'
        mappedVendorObj.building.NumberOfBuildings.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'NumberOfUnitsTotal') {
        parameterAPIMapping = 'NumberOfUnitsTotal'
        mappedVendorObj.building.NumberOfUnitsTotal.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'ArchitecturalStyle') {
        parameterAPIMapping = 'ArchitecturalStyle'
        let propMixValue = Object.entries(propMixData)[i][1]
        if (propMixValue) {
          propMixValue = propMixValue.toUpperCase()
        }
        let attomValue = attomData.summary.archStyle
        if (attomValue) {
          attomValue = attomValue.toUpperCase()
        }
        newObj =  await mappingPropMixT(attomDataBool, propMixValue, attomValue)
        mappedVendorObj.building.ArchitecturalStyle.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.ArchitecturalStyle.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.ArchitecturalStyle.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'ConstructionType') {
        parameterAPIMapping = 'ConstructionType'
        let propMixDetail = Object.entries(propMixData)[i][1]
        let attomDetail = attomData.building.construction.constructionType
        if (propMixDetail) {
          propMixDetail = propMixDetail.toUpperCase()
        }          
        if (attomDetail) {
          attomDetail = attomDetail.toUpperCase()
        }
        newObj =  await mappingAttomT(attomDataBool, propMixDetail, attomDetail)
        mappedVendorObj.building.ConstructionType.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.ConstructionType.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.ConstructionType.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'ExteriorWallsType') {
        parameterAPIMapping = 'ExteriorWallsType'
        let propMixDetail = Object.entries(propMixData)[i][1]
        let attomDetail = attomData.building.construction.wallType
        if (propMixDetail) {
          propMixDetail = propMixDetail.toUpperCase()
        }          
        if (attomDetail) {
          attomDetail = attomDetail.toUpperCase()
        }
        newObj =  await mappingPropMixT(attomDataBool, propMixDetail, attomDetail)
        mappedVendorObj.building.ExteriorWallsType.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.ExteriorWallsType.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.ExteriorWallsType.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'InteriorWallsType') {
        parameterAPIMapping = 'InteriorWallsType'
        mappedVendorObj.building.InteriorWallsType.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'RoofType') {
        parameterAPIMapping = 'RoofType'
        mappedVendorObj.building.RoofType.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'RoofCoverType') {
        parameterAPIMapping = 'RoofCoverType'
        mappedVendorObj.building.RoofCoverType.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'CarStorageType') {
        parameterAPIMapping = 'CarStorageType'
        mappedVendorObj.building.CarStorageType.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'GarageSpaces') {
        parameterAPIMapping = 'GarageSpaces'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.building.parking.prkgSpaces)
        mappedVendorObj.building.GarageSpaces.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.GarageSpaces.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.GarageSpaces.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'GarageArea') {
        parameterAPIMapping = 'GarageArea'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.building.parking.prkgSize)
        mappedVendorObj.building.GarageArea.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.GarageArea.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.GarageArea.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'ParkingSpaces') {
        parameterAPIMapping = 'ParkingSpaces'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.building.parking.prkgSpaces)
        mappedVendorObj.building.ParkingSpaces.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.ParkingSpaces.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.ParkingSpaces.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'AssessedYear') {
        parameterAPIMapping = 'AssessedYear'
        mappedVendorObj.assessment.AssessedYear.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }
      } else if (Object.entries(propMixData)[i][0] === 'AssessedValue') {
        parameterAPIMapping = 'AssessedValue'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.assessment.assessed.assdTtlValue)
        mappedVendorObj.assessment.AssessedValue.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.assessment.AssessedValue.publicRecordValue = newObj.newObj.value
        mappedVendorObj.assessment.AssessedValue.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'AssessedLandValue') {
        parameterAPIMapping = 'AssessedLandValue'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.assessment.assessed.assdLandValue)
        mappedVendorObj.assessment.AssessedLandValue.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.assessment.AssessedLandValue.publicRecordValue = newObj.newObj.value
        mappedVendorObj.assessment.AssessedLandValue.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'AssessedImprovementValue') {
        parameterAPIMapping = 'AssessedImprovementValue'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.assessment.assessed.assdImprValue)
        mappedVendorObj.assessment.AssessedImprovementValue.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.assessment.AssessedImprovementValue.publicRecordValue = newObj.newObj.value
        mappedVendorObj.assessment.AssessedImprovementValue.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      // } else if (Object.entries(propMixData)[i][0] === 'MarketValue') {
      //   parameterAPIMapping = 'MarketValue'
      //   mappedVendorObj.assessment.MarketValue.publicRecordValue = Object.entries(propMixData)[i][1]
      //   if (Object.entries(propMixData)[i][1].length > 0) {
      //     dataPresent = true
      //   } else {
      //     dataAbsent = true
      //   }          
      // } else if (Object.entries(propMixData)[i][0] === 'MarketLandValue') {
      //   parameterAPIMapping = 'MarketLandValue'
      //   mappedVendorObj.assessment.MarketLandValue.publicRecordValue = Object.entries(propMixData)[i][1]
      //   if (Object.entries(propMixData)[i][1].length > 0) {
      //     dataPresent = true
      //   } else {
      //     dataAbsent = true
      //   }          
      // } else if (Object.entries(propMixData)[i][0] === 'MarketImprovementValue') {
      //   parameterAPIMapping = 'MarketImprovementValue'
      //   mappedVendorObj.assessment.MarketImprovementValue.publicRecordValue = Object.entries(propMixData)[i][1]
      //   if (Object.entries(propMixData)[i][1].length > 0) {
      //     dataPresent = true
      //   } else {
      //     dataAbsent = true
      //   }          
      // } else if (Object.entries(propMixData)[i][0] === 'LandValue') {
      //   parameterAPIMapping = 'LandValue'
      //   mappedVendorObj.assessment.LandValue.publicRecordValue = Object.entries(propMixData)[i][1]
      //   if (Object.entries(propMixData)[i][1].length > 0) {
      //     dataPresent = true
      //   } else {
      //     dataAbsent = true
      //   }          
      // } else if (Object.entries(propMixData)[i][0] === 'ImprovementsValue') {
      //   parameterAPIMapping = 'ImprovementsValue'
      //   mappedVendorObj.assessment.ImprovementsValue.publicRecordValue = Object.entries(propMixData)[i][1]
      //   if (Object.entries(propMixData)[i][1].length > 0) {
      //     dataPresent = true
      //   } else {
      //     dataAbsent = true
      //   }          
      } else if (Object.entries(propMixData)[i][0] === 'AssessorsMapReference') {
        parameterAPIMapping = 'AssessorsMapReference'
        mappedVendorObj.assessment.AssessorsMapReference.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxYear') {
        parameterAPIMapping = 'TaxYear'
        newObj = await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.assessment.tax.taxYear)
        mappedVendorObj.tax.TaxYear.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.tax.TaxYear.publicRecordValue = newObj.newObj.value
        mappedVendorObj.tax.TaxYear.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'TaxAnnualAmount') {
        parameterAPIMapping = 'TaxAnnualAmount'
        newObj = await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], attomData.assessment.tax.taxAmt)
        let newString = newObj.newObj.value
        if (newString.charAt(0) === '$') {
          newString = newString.slice(1)
        }
        newObj.newObj.publicRecordValue = (newObj.newObj.value.slice(1))
        mappedVendorObj.tax.TaxAnnualAmount.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.tax.TaxAnnualAmount.publicRecordValue = newString
        mappedVendorObj.tax.TaxAnnualAmount.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'OwnerOccupied') {
        parameterAPIMapping = 'OwnerOccupied'
        if (attomData.summary.absenteeInd === 'OWNER OCCUPIED') {
          newObj = await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], 'Y')
        } else {
          newObj = await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.summary.absenteeInd)
        }
        mappedVendorObj.tax.OwnerOccupied.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.tax.OwnerOccupied.publicRecordValue = newObj.newObj.value
        mappedVendorObj.tax.OwnerOccupied.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionHomestead') {
        parameterAPIMapping = 'TaxExemptionHomestead'
        mappedVendorObj.tax.TaxExemptionHomestead.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionVeteran') {
        parameterAPIMapping = 'TaxExemptionVeteran'
        mappedVendorObj.tax.TaxExemptionVeteran.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionDisabled') {
        parameterAPIMapping = 'TaxExemptionDisabled'
        mappedVendorObj.tax.TaxExemptionDisabled.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionWidow') {
        parameterAPIMapping = 'TaxExemptionWidow'
        mappedVendorObj.tax.TaxExemptionWidow.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionSenior') {
        parameterAPIMapping = 'TaxExemptionSenior'
        mappedVendorObj.tax.TaxExemptionSenior.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionSchoolCollege') {
        parameterAPIMapping = 'TaxExemptionSchoolCollege'
        mappedVendorObj.tax.TaxExemptionSchoolCollege.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionReligious') {
        parameterAPIMapping = 'TaxExemptionReligious'
        mappedVendorObj.tax.TaxExemptionReligious.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionWelfare') {
        parameterAPIMapping = 'TaxExemptionWelfare'
        mappedVendorObj.tax.TaxExemptionWelfare.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionPublicUtility') {
        parameterAPIMapping = 'TaxExemptionPublicUtility'
        mappedVendorObj.tax.TaxExemptionPublicUtility.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionCemetery') {
        parameterAPIMapping = 'TaxExemptionCemetery'
        mappedVendorObj.tax.TaxExemptionCemetery.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionHospital') {
        parameterAPIMapping = 'TaxExemptionHospital'
        mappedVendorObj.tax.TaxExemptionHospital.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionLibrary') {
        parameterAPIMapping = 'TaxExemptionLibrary'
        mappedVendorObj.tax.TaxExemptionLibrary.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxInitialDeliquencyYear') {
        parameterAPIMapping = 'TaxInitialDeliquencyYear'
        mappedVendorObj.tax.TaxInitialDeliquencyYear.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'Owner1OwnershipRights') {
        if (!coreLogicCurrentMortgageDataBool) {
          parameterAPIMapping = 'Owner1OwnershipRights'
          if (Object.entries(propMixData)[i][1] && Object.entries(propMixData)[i][1].length > 0) {
            mappedVendorObj.owner1.Owner1OwnershipRights.publicRecordValue = Object.entries(propMixData)[i][1].toUpperCase()
          } else {
            mappedVendorObj.owner1.Owner1OwnershipRights.publicRecordValue = ''
          }
          if (Object.entries(propMixData)[i][1].length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        }
      } else if (Object.entries(propMixData)[i][0] === 'Owner1IsCorporation') {
        parameterAPIMapping = 'Owner1IsCorporation'
        mappedVendorObj.owner1.Owner1IsCorporation.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'Owner1FullName') {
        parameterAPIMapping = 'Owner1FullName'
        newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], null)
        if (newObj.discrepancy) {
          if ((`${propMixData.Owner1FirstName} ${propMixData.Owner1LastName}`) === newObj.newObj.backup) {
            newObj.discrepancy = false
            newObj.publicRecordValue = `${propMixData.Owner1FirstName} ${propMixData.Owner1LastName}`
          }
        }
        mappedVendorObj.owner1.Owner1FullName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.owner1.Owner1FullName.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
          if (propMixData.Owner1FirstName.length > 0 && propMixData.Owner1MiddleName.length > 0 && propMixData.Owner1LastName.length > 0) {
            mappedVendorObj.owner1.Owner1FullName.publicRecordValue = `${propMixData.Owner1FirstName} ${propMixData.Owner1MiddleName} ${propMixData.Owner1LastName}`
          } else if (propMixData.Owner1FirstName.length > 0 && propMixData.Owner1LastName.length > 0) {
            mappedVendorObj.owner1.Owner1FullName.publicRecordValue = `${propMixData.Owner1FirstName} ${propMixData.Owner1LastName}`
          } else {
            mappedVendorObj.owner1.Owner1FullName.publicRecordValue = newObj.newObj.value 
          }
        } else {
          dataAbsent = true
          mappedVendorObj.owner1.Owner1FullName.publicRecordValue = ''
        }  
      } else if (Object.entries(propMixData)[i][0] === 'Owner1LastName') {
        parameterAPIMapping = 'Owner1LastName'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.assessment.owner.owner1.lastName)
        mappedVendorObj.owner1.Owner1LastName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.owner1.Owner1LastName.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
          mappedVendorObj.owner1.Owner1LastName.publicRecordValue = newObj.newObj.value.trim()
        } else {
          dataAbsent = true
          mappedVendorObj.owner1.Owner1LastName.publicRecordValue = ''
        }  
      } else if (Object.entries(propMixData)[i][0] === 'Owner1FirstName') {
        parameterAPIMapping = 'Owner1FirstName'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.assessment.owner.owner1.firstNameAndMi)
        mappedVendorObj.owner1.Owner1FirstName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.owner1.Owner1FirstName.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
          mappedVendorObj.owner1.Owner1FirstName.publicRecordValue = newObj.newObj.value
        } else {
          dataAbsent = true
          mappedVendorObj.owner1.Owner1FirstName.publicRecordValue = ''
        }  
      } else if (Object.entries(propMixData)[i][0] === 'Owner2IsCorporation') {
        parameterAPIMapping = 'Owner2IsCorporation'
        mappedVendorObj.owner2.Owner2IsCorporation.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'Owner2FullName') {
        parameterAPIMapping = 'Owner2FullName'
        newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], attomData.assessment.owner.owner3.fullName)
        if (newObj.discrepancy) {
          if ((`${propMixData.Owner2FirstName} ${propMixData.Owner2LastName}`) === newObj.newObj.backup) {
            newObj.discrepancy = false
            newObj.publicRecordValue = `${propMixData.Owner2FirstName} ${propMixData.Owner2LastName}`
          }
        }
        mappedVendorObj.owner2.Owner2FullName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.owner2.Owner2FullName.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
          if (propMixData.Owner2FirstName.length > 0 && propMixData.Owner2MiddleName.length > 0 && propMixData.Owner2LastName.length > 0) {
            mappedVendorObj.owner2.Owner2FullName.publicRecordValue = `${propMixData.Owner2FirstName} ${propMixData.Owner2MiddleName} ${propMixData.Owner2LastName}`
          } else if (propMixData.Owner2FirstName.length > 0 && propMixData.Owner2LastName.length > 0) {
            mappedVendorObj.owner2.Owner2FullName.publicRecordValue = `${propMixData.Owner2FirstName} ${propMixData.Owner2LastName}`
          } else {
            mappedVendorObj.owner2.Owner2FullName.publicRecordValue = newObj.newObj.value 
          }
        } else {
          dataAbsent = true
          mappedVendorObj.owner2.Owner2FullName.publicRecordValue = ''
        }
      } else if (Object.entries(propMixData)[i][0] === 'Owner2LastName') {
        parameterAPIMapping = 'Owner2LastName'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.assessment.owner.owner3.lastName)
        mappedVendorObj.owner2.Owner2LastName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.owner2.Owner2LastName.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
          mappedVendorObj.owner2.Owner2LastName.publicRecordValue = newObj.newObj.value
        } else {
          dataAbsent = true
          mappedVendorObj.owner2.Owner2LastName.publicRecordValue = ''
        }  
      } else if (Object.entries(propMixData)[i][0] === 'Owner2FirstName') {
        parameterAPIMapping = 'Owner2FirstName'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], attomData.assessment.owner.owner3.firstNameAndMi)
        mappedVendorObj.owner2.Owner2FirstName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.owner2.Owner2FirstName.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
          mappedVendorObj.owner2.Owner2FirstName.publicRecordValue = newObj.newObj.value
        } else {
          dataAbsent = true
          mappedVendorObj.owner2.Owner2FirstName.publicRecordValue = ''
        }  
      }
      let empty = 0
      let backupOnly = 0
      let noBackup = 0
      if (newObj.empty) {
        empty = 1
      } else if (newObj.backupOnly) {
        backupOnly = 1
      } else if (newObj.noBackup) {
        noBackup = 1
      }
      if (dataPresent) {
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: parameterAPIMapping}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
            empty: empty,
            backupOnly: backupOnly,
            noBackup: noBackup,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      } else if (dataAbsent) {
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: parameterAPIMapping}, {
          $inc: { 
            empty: 1,
            totalQueries: 1,
            empty: empty,
            backupOnly: backupOnly,
            noBackup: noBackup,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      }
    }
  } else if (propMixDataBool) {
    for (let i = 0; i < Object.entries(propMixData).length; i++) {
      let parameterAPIMapping = ''
      let newObj = {empty:false,backup:'',discrepancy:'',publicRecordValue:''}
      let dataPresent = false
      let dataAbsent = false
      if (Object.entries(propMixData)[i][0] === 'FIPS') {
        parameterAPIMapping = 'FIPS'
        newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.identifiers.FIPS.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.identifiers.FIPS.publicRecordValue = newObj.newObj.value
        mappedVendorObj.identifiers.FIPS.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'PMXPropertyId') {
        parameterAPIMapping = 'PMXPropertyId'
        mappedVendorObj.identifiers.PMXPropertyId.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }                 
      } else if (Object.entries(propMixData)[i][0] === 'Municipality') {
        parameterAPIMapping = 'Municipality'
        mappedVendorObj.lot.Municipality.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'LegalSubdivisionName') {
        parameterAPIMapping = 'LegalSubdivisionName'
        if (!legalSubdivisionNameDetermined) {
          newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
          mappedVendorObj.lot.LegalSubdivisionName.discrepancy = newObj.newObj.discrepancy
          mappedVendorObj.lot.LegalSubdivisionName.publicRecordValue = newObj.newObj.value
          mappedVendorObj.lot.LegalSubdivisionName.backup = newObj.newObj.backup
          if (newObj.newObj.value.length > 0) {
            dataPresent = true
            legalSubdivisionNameDetermined = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }
        }
      } else if (Object.entries(propMixData)[i][0] === 'ParcelNumber') {
        parameterAPIMapping = 'ParcelNumber'
        newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], null, true)
        newParcelNumber = newObj.newObj.value
        mappedVendorObj.lot.ParcelNumber.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.lot.ParcelNumber.publicRecordValue = newObj.newObj.value
        mappedVendorObj.lot.ParcelNumber.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'Latitude') {
        parameterAPIMapping = 'Latitude'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.lot.Latitude.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.lot.Latitude.publicRecordValue = newObj.newObj.value
        mappedVendorObj.lot.Latitude.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'Longitude') {
        parameterAPIMapping = 'Longitude'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.lot.Longitude.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.lot.Longitude.publicRecordValue = newObj.newObj.value
        mappedVendorObj.lot.Longitude.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'LotSizeAcres') {
        parameterAPIMapping = 'LotSizeAcres'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.lot.LotSizeAcres.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.lot.LotSizeAcres.publicRecordValue = newObj.newObj.value
        mappedVendorObj.lot.LotSizeAcres.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'LotSizeSquareFeet') {
        parameterAPIMapping = 'LotSizeSquareFeet'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.lot.LotSizeSquareFeet.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.lot.LotSizeSquareFeet.publicRecordValue = newObj.newObj.value
        mappedVendorObj.lot.LotSizeSquareFeet.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }         
      } else if (Object.entries(propMixData)[i][0] === 'Zoning') {
        parameterAPIMapping = 'Zoning'
        //* We only want to use the PropMix value if this is an initial match (PropMix only option)
        if (isInitialMatch === 'true') {
          newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], null)
          mappedVendorObj.lot.Zoning.discrepancy = newObj.newObj.discrepancy
          mappedVendorObj.lot.Zoning.publicRecordValue = newObj.newObj.value
          mappedVendorObj.lot.Zoning.backup = newObj.newObj.backup
          if (newObj.newObj.value.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
          }
        }          
      } else if (Object.entries(propMixData)[i][0] === 'CountyLandUseCode') {
        parameterAPIMapping = 'CountyLandUseCode'
        mappedVendorObj.lot.CountyLandUseCode.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }                  
      } else if (Object.entries(propMixData)[i][0] === 'BelowGradeTotalArea') {
        parameterAPIMapping = 'BelowGradeTotalArea'
        mappedVendorObj.lot.BelowGradeTotalArea.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'BelowGradeFinishedArea') {
        parameterAPIMapping = 'BelowGradeFinishedArea'
        mappedVendorObj.lot.BelowGradeFinishedArea.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }                 
      } else if (Object.entries(propMixData)[i][0] === 'LandUseCode') {
        parameterAPIMapping = 'LandUseCode'
        mappedVendorObj.lot.LandUseCode.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxLot' || Object.entries(propMixData)[i][0] === 'TaxLotList') {
        parameterAPIMapping = 'TaxLot'
        if (!taxLotDetermined) {
          newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], null)
          if (newObj.newObj.value && newObj.newObj.value.toString().length > 0) {
            dataPresent = true
            taxLotDetermined = true
            mappedVendorObj.lot.TaxLot.discrepancy = newObj.newObj.discrepancy
            if (typeof newObj.newObj.value === 'string') {
              mappedVendorObj.lot.TaxLot.publicRecordValue = newObj.newObj.value.toString()
            } else {
              mappedVendorObj.lot.TaxLot.publicRecordValue = newObj.newObj.value
            }
            if (typeof newObj.newObj.backup === 'string') {
              mappedVendorObj.lot.TaxLot.backup = newObj.newObj.backup.toString()
            } else {
              mappedVendorObj.lot.TaxLot.backup = newObj.newObj.backup
            }
          } else {
            if (taxLockSecondAttempt) {
              newObj.empty = true
              dataAbsent = true
            }
            taxLockSecondAttempt = true
          }
        }
      } else if (Object.entries(propMixData)[i][0] === 'TaxBlock') {
        parameterAPIMapping = 'TaxBlock'
        mappedVendorObj.lot.TaxBlock.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }                     
      } else if (Object.entries(propMixData)[i][0] === 'CensusTractId') {
        parameterAPIMapping = 'CensusTractId'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.lot.CensusTractId.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.lot.CensusTractId.publicRecordValue = newObj.newObj.value
        mappedVendorObj.lot.CensusTractId.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'StreetAddress') {
        parameterAPIMapping = 'StreetAddressLine1'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.address.StreetAddressLine1.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.StreetAddressLine1.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.StreetAddressLine1.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'StreetNumber') {
        parameterAPIMapping = 'StreetNumber'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.address.StreetNumber.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.StreetNumber.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.StreetNumber.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'UnitPrefix') {
        parameterAPIMapping = 'UnitPrefix'
        mappedVendorObj.address.UnitPrefix.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'UnitNumber') {
        parameterAPIMapping = 'UnitNumber'
        mappedVendorObj.address.UnitNumber.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'StreetDirPrefix') {
        parameterAPIMapping = 'StreetDirPrefix'
        mappedVendorObj.address.StreetDirPrefix.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'StreetName') {
        parameterAPIMapping = 'StreetName'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.address.StreetName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.StreetName.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.StreetName.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'StreetSuffix') {
        parameterAPIMapping = 'StreetSuffix'
        let format = await formatStreetSuffix(Object.entries(propMixData)[i][1], 'query')
        if (format.isError) {
          formattingErrors.push(...format.errors)
        } else {
          mappedVendorObj.address.StreetSuffix.publicRecordValue = Object.entries(propMixData)[i][1]
          if (Object.entries(propMixData)[i][1].length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }
        }
      } else if (Object.entries(propMixData)[i][0] === 'StreetDirSuffix') {
        parameterAPIMapping = 'StreetDirSuffix'
        mappedVendorObj.address.StreetDirSuffix.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'City') {
        parameterAPIMapping = 'City'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.address.City.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.City.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.City.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'StateOrProvince') {
        parameterAPIMapping = 'StateOrProvince'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.address.StateOrProvince.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.StateOrProvince.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.StateOrProvince.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'PostalCode') {
        parameterAPIMapping = 'PostalCode'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.address.PostalCode.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.PostalCode.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.PostalCode.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'PostalCodePlus4') {
        parameterAPIMapping = 'PostalCodePlus4'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.address.PostalCodePlus4.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.address.PostalCodePlus4.publicRecordValue = newObj.newObj.value
        mappedVendorObj.address.PostalCodePlus4.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'WaterSource') {
        parameterAPIMapping = 'WaterSource'
        mappedVendorObj.summary.WaterSource.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'SewerType') {
        parameterAPIMapping = 'SewerType'
        mappedVendorObj.summary.SewerType.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'SchoolDistrict') {
        parameterAPIMapping = 'SchoolDistrict'
        mappedVendorObj.summary.SchoolDistrict.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'PropertyType') {   
        parameterAPIMapping = 'PropertyType'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.summary.PropertyType.discrepancy = newObj.newObj.discrepancy
        if (typeof newObj.newObj.value === 'string') {
          mappedVendorObj.summary.PropertyType.publicRecordValue = newObj.newObj.value.toUpperCase()
        } else {
          mappedVendorObj.summary.PropertyType.publicRecordValue = newObj.newObj.value.toUpperCase()
        }
        if (typeof newObj.newObj.backup === 'string') {
          mappedVendorObj.summary.PropertyType.backup = newObj.newObj.backup.toUpperCase()
        } else {
          mappedVendorObj.summary.PropertyType.backup = newObj.newObj.backup.toUpperCase()
        }
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
        newPropertyType = newObj.newObj.value.toUpperCase()
      } else if (Object.entries(propMixData)[i][0] === 'PropertySubType') {
        parameterAPIMapping = 'PropertySubType'
        let propMixValue = Object.entries(propMixData)[i][1]
        if (propMixValue) {
          propMixValue = propMixValue.toUpperCase()
        }
        newObj =  await mappingPropMixT(attomDataBool, propMixValue, null)
        mappedVendorObj.summary.PropertySubType.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.summary.PropertySubType.publicRecordValue = newObj.newObj.value
        mappedVendorObj.summary.PropertySubType.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'DistressYN') {
        parameterAPIMapping = 'DistressYN'
        mappedVendorObj.summary.DistressYN.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'LeaseholdOrFeeSimple') {
        parameterAPIMapping = 'LeaseholdOrFeeSimple'
        let propMixValue = Object.entries(propMixData)[i][1]
        if (propMixValue.length > 0) {
          dataPresent = true
          propMixValue = propMixValue.toUpperCase()
        } else {
          dataAbsent = true
          newObj.empty = true
        }
        mappedVendorObj.sale.LeaseholdOrFeeSimple.publicRecordValue = propMixValue

      } else if (Object.entries(propMixData)[i][0] === 'LastSaleRecordingDate') {
        parameterAPIMapping = 'LastSaleRecordingDate'
        newObj =  await mappingPropMixTT(attomDataBool, Object.entries(propMixData)[i][1], null, null)
        mappedVendorObj.sale.LastSaleRecordingDate.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.sale.LastSaleRecordingDate.publicRecordValue = newObj.newObj.value
        mappedVendorObj.sale.LastSaleRecordingDate.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleContractDate') {
        parameterAPIMapping = 'LastSaleContractDate'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.sale.LastSaleContractDate.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.sale.LastSaleContractDate.publicRecordValue = newObj.newObj.value
        mappedVendorObj.sale.LastSaleContractDate.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleDate') {
        parameterAPIMapping = 'LastSaleDate'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.sale.LastSaleDate.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.sale.LastSaleDate.publicRecordValue = newObj.newObj.value
        mappedVendorObj.sale.LastSaleDate.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'ClosePrice') {
        parameterAPIMapping = 'ClosePrice'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1],null)
        mappedVendorObj.sale.ClosePrice.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.sale.ClosePrice.publicRecordValue = newObj.newObj.value
        mappedVendorObj.sale.ClosePrice.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }
      } else if (Object.entries(propMixData)[i][0] === 'ClosePriceDescription') {
        parameterAPIMapping = 'ClosePriceDescription'
        if (Object.entries(propMixData)[i][1] && Object.entries(propMixData)[i][1].length > 0) {
          if (Object.entries(propMixData)[i][1].trim() === 'Full amount computed from Transfer Tax or Excise Tax.') {
            mappedVendorObj.sale.ClosePriceDescription.publicRecordValue = 'Computed from Transfer or Excise Tax'
          } else {
            mappedVendorObj.sale.ClosePriceDescription.publicRecordValue = Object.entries(propMixData)[i][1].trim()
          }
        } else {
          mappedVendorObj.sale.ClosePriceDescription.publicRecordValue = ''
        }
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }                
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleTransactionId') {
        parameterAPIMapping = 'LastSaleTransactionId'
        mappedVendorObj.sale.LastSaleTransactionId.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleBuyerName') {
        parameterAPIMapping = 'LastSaleBuyerName'
        if (Object.entries(propMixData)[i][1] && Object.entries(propMixData)[i][1].length > 0) {
          mappedVendorObj.sale.LastSaleBuyerName.publicRecordValue = Object.entries(propMixData)[i][1].trim()
        } else {
          mappedVendorObj.sale.LastSaleBuyerName.publicRecordValue = ''
        }
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'SaleDocType') {
        parameterAPIMapping = 'SaleDocType'
        mappedVendorObj.sale.SaleDocType.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleRecordingDocumentId') {
        parameterAPIMapping = 'LastSaleRecordingDocumentId'
        mappedVendorObj.sale.LastSaleRecordingDocumentId.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }                 
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleSeller2FullName') {
        parameterAPIMapping = 'LastSaleSeller2FullName'
        mappedVendorObj.sale.LastSaleSeller2FullName.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'LastSaleSeller1FullName') {
        parameterAPIMapping = 'LastSaleSeller1FullName'
        mappedVendorObj.sale.LastSaleSeller1FullName.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'BuildingAreaTotal') {
        parameterAPIMapping = 'BuildingAreaTotal'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.living.BuildingAreaTotal.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.BuildingAreaTotal.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.BuildingAreaTotal.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'GrossArea') {
        parameterAPIMapping = 'GrossArea'
        newObj =  await mappingPropMixTT(attomDataBool, Object.entries(propMixData)[i][1], null, null)
        mappedVendorObj.living.GrossArea.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.GrossArea.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.GrossArea.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'LivingArea') {
        parameterAPIMapping = 'LivingArea'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.living.LivingArea.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.LivingArea.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.LivingArea.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }      
      } else if (Object.entries(propMixData)[i][0] === 'StoriesTotal' || Object.entries(propMixData)[i][0] === 'StoriesDescription') { 
        parameterAPIMapping = 'Stories'
        if (!storiesDetermined) {
          if (Object.entries(propMixData)[i][1].length > 0) {
            dataPresent = true
            storiesDetermined = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }    
        }
        mappedVendorObj.living.Stories.publicRecordValue = Object.entries(propMixData)[i][1]
      } else if (Object.entries(propMixData)[i][0] === 'RoomsTotal') {
        parameterAPIMapping = 'RoomsTotal'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.living.RoomsTotal.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.RoomsTotal.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.RoomsTotal.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'BedroomsTotal') {
        parameterAPIMapping = 'BedroomsTotal'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.living.BedroomsTotal.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.BedroomsTotal.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.BedroomsTotal.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'BathroomsFull') {
        parameterAPIMapping = 'BathroomsFull'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.living.BathroomsFull.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.BathroomsFull.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.BathroomsFull.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'BathroomsTotalInteger') {
        parameterAPIMapping = 'BathroomsTotalInteger'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.living.BathroomsTotalInteger.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.BathroomsTotalInteger.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.BathroomsTotalInteger.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'FireplacesTotal') {
        parameterAPIMapping = 'FireplacesTotal'
        mappedVendorObj.living.FireplacesTotal.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }
      } else if (Object.entries(propMixData)[i][0] === 'Heating') {
        parameterAPIMapping = 'Heating'
        let propMixValue = Object.entries(propMixData)[i][1]
        if (propMixValue) {
          propMixValue = propMixValue.toUpperCase()
        }
        newObj =  await mappingPropMixT(attomDataBool, propMixValue, null)
        mappedVendorObj.living.Heating.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.Heating.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.Heating.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'Cooling') {
        parameterAPIMapping = 'Cooling'
        mappedVendorObj.living.Cooling.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'PoolType') {
        parameterAPIMapping = 'PoolType'
        newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.living.PoolType.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.living.PoolType.publicRecordValue = newObj.newObj.value
        mappedVendorObj.living.PoolType.backup = newObj.newObj.backup          
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'BuildingQualityScore') {
        parameterAPIMapping = 'BuildingQualityScore'
        mappedVendorObj.building.BuildingQualityScore.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'BuildingCondition') {
        parameterAPIMapping = 'BuildingCondition'
        mappedVendorObj.building.BuildingCondition.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'YearBuilt') {
        parameterAPIMapping = 'YearBuilt'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.building.YearBuilt.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.YearBuilt.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.YearBuilt.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'YearBuiltEffective') {
        parameterAPIMapping = 'YearBuiltEffective'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.building.YearBuiltEffective.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.YearBuiltEffective.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.YearBuiltEffective.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'NumberOfBuildings') {
        parameterAPIMapping = 'NumberOfBuildings'
        mappedVendorObj.building.NumberOfBuildings.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'NumberOfUnitsTotal') {
        parameterAPIMapping = 'NumberOfUnitsTotal'
        mappedVendorObj.building.NumberOfUnitsTotal.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'ArchitecturalStyle') {
        parameterAPIMapping = 'ArchitecturalStyle'
        let propMixValue = Object.entries(propMixData)[i][1]
        if (propMixValue) {
          propMixValue = propMixValue.toUpperCase()
        }
        newObj =  await mappingPropMixT(attomDataBool, propMixValue, null)
        mappedVendorObj.building.ArchitecturalStyle.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.ArchitecturalStyle.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.ArchitecturalStyle.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'ConstructionType') {
        parameterAPIMapping = 'ConstructionType'
        if (isInitialMatch === 'true') {
          let propMixDetail = Object.entries(propMixData)[i][1]
          if (propMixDetail) {
            propMixDetail = propMixDetail.toUpperCase()
          }          
          newObj =  await mappingAttomT(attomDataBool, propMixDetail, null)
          mappedVendorObj.building.ConstructionType.discrepancy = newObj.newObj.discrepancy
          mappedVendorObj.building.ConstructionType.publicRecordValue = newObj.newObj.value
          mappedVendorObj.building.ConstructionType.backup = newObj.newObj.backup
          if (newObj.newObj.value.length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
          }  
        }
      } else if (Object.entries(propMixData)[i][0] === 'ExteriorWallsType') {
        parameterAPIMapping = 'ExteriorWallsType'
        let propMixDetail = Object.entries(propMixData)[i][1]
        if (propMixDetail) {
          propMixDetail = propMixDetail.toUpperCase()
        }          
        newObj =  await mappingPropMixT(attomDataBool, propMixDetail, null)
        mappedVendorObj.building.ExteriorWallsType.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.ExteriorWallsType.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.ExteriorWallsType.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'InteriorWallsType') {
        parameterAPIMapping = 'InteriorWallsType'
        mappedVendorObj.building.InteriorWallsType.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'RoofType') {
        parameterAPIMapping = 'RoofType'
        mappedVendorObj.building.RoofType.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'RoofCoverType') {
        parameterAPIMapping = 'RoofCoverType'
        mappedVendorObj.building.RoofCoverType.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'CarStorageType') {
        parameterAPIMapping = 'CarStorageType'
        mappedVendorObj.building.CarStorageType.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'GarageSpaces') {
        parameterAPIMapping = 'GarageSpaces'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.building.GarageSpaces.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.GarageSpaces.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.GarageSpaces.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'GarageArea') {
        parameterAPIMapping = 'GarageArea'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.building.GarageArea.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.GarageArea.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.GarageArea.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'ParkingSpaces') {
        parameterAPIMapping = 'ParkingSpaces'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1],null)
        mappedVendorObj.building.ParkingSpaces.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.building.ParkingSpaces.publicRecordValue = newObj.newObj.value
        mappedVendorObj.building.ParkingSpaces.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'AssessedYear') {
        parameterAPIMapping = 'AssessedYear'
        mappedVendorObj.assessment.AssessedYear.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }
      } else if (Object.entries(propMixData)[i][0] === 'AssessedValue') {
        parameterAPIMapping = 'AssessedValue'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.assessment.AssessedValue.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.assessment.AssessedValue.publicRecordValue = newObj.newObj.value
        mappedVendorObj.assessment.AssessedValue.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'AssessedLandValue') {
        parameterAPIMapping = 'AssessedLandValue'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.assessment.AssessedLandValue.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.assessment.AssessedLandValue.publicRecordValue = newObj.newObj.value
        mappedVendorObj.assessment.AssessedLandValue.backup = newObj.newObj.backup
        if (newObj.newObj.value > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'AssessedImprovementValue') {
        parameterAPIMapping = 'AssessedImprovementValue'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.assessment.AssessedImprovementValue.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.assessment.AssessedImprovementValue.publicRecordValue = newObj.newObj.value
        mappedVendorObj.assessment.AssessedImprovementValue.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      // } else if (Object.entries(propMixData)[i][0] === 'MarketValue') {
      //   parameterAPIMapping = 'MarketValue'
      //   mappedVendorObj.assessment.MarketValue.publicRecordValue = Object.entries(propMixData)[i][1]
      //   if (Object.entries(propMixData)[i][1].length > 0) {
      //     dataPresent = true
      //   } else {
      //     dataAbsent = true
      //   }          
      // } else if (Object.entries(propMixData)[i][0] === 'MarketLandValue') {
      //   parameterAPIMapping = 'MarketLandValue'
      //   mappedVendorObj.assessment.MarketLandValue.publicRecordValue = Object.entries(propMixData)[i][1]
      //   if (Object.entries(propMixData)[i][1].length > 0) {
      //     dataPresent = true
      //   } else {
      //     dataAbsent = true
      //   }          
      // } else if (Object.entries(propMixData)[i][0] === 'MarketImprovementValue') {
      //   parameterAPIMapping = 'MarketImprovementValue'
      //   mappedVendorObj.assessment.MarketImprovementValue.publicRecordValue = Object.entries(propMixData)[i][1]
      //   if (Object.entries(propMixData)[i][1].length > 0) {
      //     dataPresent = true
      //   } else {
      //     dataAbsent = true
      //   }          
      // } else if (Object.entries(propMixData)[i][0] === 'LandValue') {
      //   parameterAPIMapping = 'LandValue'
      //   mappedVendorObj.assessment.LandValue.publicRecordValue = Object.entries(propMixData)[i][1]
      //   if (Object.entries(propMixData)[i][1].length > 0) {
      //     dataPresent = true
      //   } else {
      //     dataAbsent = true
      //   }          
      // } else if (Object.entries(propMixData)[i][0] === 'ImprovementsValue') {
      //   parameterAPIMapping = 'ImprovementsValue'
      //   mappedVendorObj.assessment.ImprovementsValue.publicRecordValue = Object.entries(propMixData)[i][1]
      //   if (Object.entries(propMixData)[i][1].length > 0) {
      //     dataPresent = true
      //   } else {
      //     dataAbsent = true
      //   }          
      } else if (Object.entries(propMixData)[i][0] === 'AssessorsMapReference') {
        parameterAPIMapping = 'AssessorsMapReference'
        mappedVendorObj.assessment.AssessorsMapReference.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxYear') {
        parameterAPIMapping = 'TaxYear'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.tax.TaxYear.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.tax.TaxYear.publicRecordValue = newObj.newObj.value
        mappedVendorObj.tax.TaxYear.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'TaxAnnualAmount') {
        parameterAPIMapping = 'TaxAnnualAmount'
        newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], null)
        let newString = newObj.newObj.value
        if (newString.charAt(0) === '$') {
          newString = newString.slice(1)
        }
        mappedVendorObj.tax.TaxAnnualAmount.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.tax.TaxAnnualAmount.publicRecordValue = newString
        mappedVendorObj.tax.TaxAnnualAmount.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'OwnerOccupied') {
        parameterAPIMapping = 'OwnerOccupied'
        newObj = await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.tax.OwnerOccupied.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.tax.OwnerOccupied.publicRecordValue = newObj.newObj.value
        mappedVendorObj.tax.OwnerOccupied.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }  
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionHomestead') {
        parameterAPIMapping = 'TaxExemptionHomestead'
        mappedVendorObj.tax.TaxExemptionHomestead.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionVeteran') {
        parameterAPIMapping = 'TaxExemptionVeteran'
        mappedVendorObj.tax.TaxExemptionVeteran.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionDisabled') {
        parameterAPIMapping = 'TaxExemptionDisabled'
        mappedVendorObj.tax.TaxExemptionDisabled.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionWidow') {
        parameterAPIMapping = 'TaxExemptionWidow'
        mappedVendorObj.tax.TaxExemptionWidow.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionSenior') {
        parameterAPIMapping = 'TaxExemptionSenior'
        mappedVendorObj.tax.TaxExemptionSenior.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionSchoolCollege') {
        parameterAPIMapping = 'TaxExemptionSchoolCollege'
        mappedVendorObj.tax.TaxExemptionSchoolCollege.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionReligious') {
        parameterAPIMapping = 'TaxExemptionReligious'
        mappedVendorObj.tax.TaxExemptionReligious.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionWelfare') {
        parameterAPIMapping = 'TaxExemptionWelfare'
        mappedVendorObj.tax.TaxExemptionWelfare.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionPublicUtility') {
        parameterAPIMapping = 'TaxExemptionPublicUtility'
        mappedVendorObj.tax.TaxExemptionPublicUtility.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionCemetery') {
        parameterAPIMapping = 'TaxExemptionCemetery'
        mappedVendorObj.tax.TaxExemptionCemetery.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionHospital') {
        parameterAPIMapping = 'TaxExemptionHospital'
        mappedVendorObj.tax.TaxExemptionHospital.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxExemptionLibrary') {
        parameterAPIMapping = 'TaxExemptionLibrary'
        mappedVendorObj.tax.TaxExemptionLibrary.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'TaxInitialDeliquencyYear') {
        parameterAPIMapping = 'TaxInitialDeliquencyYear'
        mappedVendorObj.tax.TaxInitialDeliquencyYear.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'Owner1OwnershipRights') {
        if (!coreLogicCurrentMortgageDataBool) {
          parameterAPIMapping = 'Owner1OwnershipRights'
          if (Object.entries(propMixData)[i][1] && Object.entries(propMixData)[i][1].length > 0) {
            mappedVendorObj.owner1.Owner1OwnershipRights.publicRecordValue = Object.entries(propMixData)[i][1].toUpperCase()
          } else {
            mappedVendorObj.owner1.Owner1OwnershipRights.publicRecordValue = ''
          }
          if (Object.entries(propMixData)[i][1].length > 0) {
            dataPresent = true
          } else {
            dataAbsent = true
            newObj.empty = true
          }          
        }
      } else if (Object.entries(propMixData)[i][0] === 'Owner1IsCorporation') {
        parameterAPIMapping = 'Owner1IsCorporation'
        mappedVendorObj.owner1.Owner1IsCorporation.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
          newObj.empty = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'Owner1FullName') {
        parameterAPIMapping = 'Owner1FullName'
        //* We only want to use the PropMix value if this is an initial match (PropMix only option)
        if (isInitialMatch === 'true') {
          newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], null)
          if (newObj.discrepancy) {
            if ((`${propMixData.Owner1FirstName} ${propMixData.Owner1LastName}`) === newObj.newObj.backup) {
              newObj.discrepancy = false
              newObj.publicRecordValue = `${propMixData.Owner1FirstName} ${propMixData.Owner1LastName}`
            }
          }
          mappedVendorObj.owner1.Owner1FullName.discrepancy = newObj.newObj.discrepancy
          mappedVendorObj.owner1.Owner1FullName.backup = newObj.newObj.backup
          if (newObj.newObj.value.length > 0) {
            dataPresent = true
            if (propMixData.Owner1FirstName.length > 0 && propMixData.Owner1MiddleName.length > 0 && propMixData.Owner1LastName.length > 0) {
              mappedVendorObj.owner1.Owner1FullName.publicRecordValue = `${propMixData.Owner1FirstName} ${propMixData.Owner1MiddleName} ${propMixData.Owner1LastName}`
            } else if (propMixData.Owner1FirstName.length > 0 && propMixData.Owner1LastName.length > 0) {
              mappedVendorObj.owner1.Owner1FullName.publicRecordValue = `${propMixData.Owner1FirstName} ${propMixData.Owner1LastName}`
            } else {
              mappedVendorObj.owner1.Owner1FullName.publicRecordValue = newObj.newObj.value 
            }
          } else {
            dataAbsent = true
            mappedVendorObj.owner1.Owner1FullName.publicRecordValue = ''
          }  
        }
      } else if (Object.entries(propMixData)[i][0] === 'Owner1LastName') {
        parameterAPIMapping = 'Owner1LastName'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.owner1.Owner1LastName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.owner1.Owner1LastName.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
          mappedVendorObj.owner1.Owner1LastName.publicRecordValue = newObj.newObj.value.trim()
        } else {
          dataAbsent = true
          mappedVendorObj.owner1.Owner1LastName.publicRecordValue = ''
        }  
      } else if (Object.entries(propMixData)[i][0] === 'Owner1FirstName') {
        parameterAPIMapping = 'Owner1FirstName'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.owner1.Owner1FirstName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.owner1.Owner1FirstName.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
          mappedVendorObj.owner1.Owner1FirstName.publicRecordValue = newObj.newObj.value
        } else {
          dataAbsent = true
          mappedVendorObj.owner1.Owner1FirstName.publicRecordValue = ''
        }  
      } else if (Object.entries(propMixData)[i][0] === 'Owner2IsCorporation') {
        parameterAPIMapping = 'Owner2IsCorporation'
        mappedVendorObj.owner2.Owner2IsCorporation.publicRecordValue = Object.entries(propMixData)[i][1]
        if (Object.entries(propMixData)[i][1].length > 0) {
          dataPresent = true
        } else {
          dataAbsent = true
        }          
      } else if (Object.entries(propMixData)[i][0] === 'Owner2FullName') {
        parameterAPIMapping = 'Owner2FullName'
        //* We only want to use the PropMix value if this is an initial match (PropMix only option)
        if (isInitialMatch === 'true') {
          newObj =  await mappingAttomT(attomDataBool, Object.entries(propMixData)[i][1], null)
          if (newObj.discrepancy) {
            if ((`${propMixData.Owner2FirstName} ${propMixData.Owner2LastName}`) === newObj.newObj.backup) {
              newObj.discrepancy = false
              newObj.publicRecordValue = `${propMixData.Owner2FirstName} ${propMixData.Owner2LastName}`
            }
          }
          mappedVendorObj.owner2.Owner2FullName.discrepancy = newObj.newObj.discrepancy
          mappedVendorObj.owner2.Owner2FullName.backup = newObj.newObj.backup
          if (newObj.newObj.value.length > 0) {
            dataPresent = true
            if (propMixData.Owner2FirstName.length > 0 && propMixData.Owner2MiddleName.length > 0 && propMixData.Owner2LastName.length > 0) {
              mappedVendorObj.owner2.Owner2FullName.publicRecordValue = `${propMixData.Owner2FirstName} ${propMixData.Owner2MiddleName} ${propMixData.Owner2LastName}`
            } else if (propMixData.Owner2FirstName.length > 0 && propMixData.Owner2LastName.length > 0) {
              mappedVendorObj.owner2.Owner2FullName.publicRecordValue = `${propMixData.Owner2FirstName} ${propMixData.Owner2LastName}`
            } else {
              mappedVendorObj.owner2.Owner2FullName.publicRecordValue = newObj.newObj.value 
            }
          } else {
            dataAbsent = true
            mappedVendorObj.owner2.Owner2FullName.publicRecordValue = ''
          }
        }
      } else if (Object.entries(propMixData)[i][0] === 'Owner2LastName') {
        parameterAPIMapping = 'Owner2LastName'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.owner2.Owner2LastName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.owner2.Owner2LastName.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
          mappedVendorObj.owner2.Owner2LastName.publicRecordValue = newObj.newObj.value
        } else {
          dataAbsent = true
          mappedVendorObj.owner2.Owner2LastName.publicRecordValue = ''
        }  
      } else if (Object.entries(propMixData)[i][0] === 'Owner2FirstName') {
        parameterAPIMapping = 'Owner2FirstName'
        newObj =  await mappingPropMixT(attomDataBool, Object.entries(propMixData)[i][1], null)
        mappedVendorObj.owner2.Owner2FirstName.discrepancy = newObj.newObj.discrepancy
        mappedVendorObj.owner2.Owner2FirstName.backup = newObj.newObj.backup
        if (newObj.newObj.value.length > 0) {
          dataPresent = true
          mappedVendorObj.owner2.Owner2FirstName.publicRecordValue = newObj.newObj.value
        } else {
          dataAbsent = true
          mappedVendorObj.owner2.Owner2FirstName.publicRecordValue = ''
        }    
      }
      let empty = 0
      let backupOnly = 0
      let noBackup = 0
      if (newObj.empty) {
        empty = 1
      } else if (newObj.backupOnly) {
        backupOnly = 1
      } else if (newObj.noBackup) {
        noBackup = 1
      }
      if (dataPresent) {
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: parameterAPIMapping}, {
          $inc: { 
            populated: 1,
            totalQueries: 1,
            empty: empty,
            backupOnly: backupOnly,
            noBackup: noBackup,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      } else if (dataAbsent) {
        let sweepParameterToUpdate = await SweepParameterModel.findOneAndUpdate({apiMapping: parameterAPIMapping}, {
          $inc: { 
            empty: 1,
            totalQueries: 1,
            empty: empty,
            backupOnly: backupOnly,
            noBackup: noBackup,
          },
        }, {new: true})
        updatedSweepParameters.push(sweepParameterToUpdate)
      }
    }
  }

  return {mappedVendorObj, formattingErrors, updatedSweepParameters, newPropertyType, newParcelNumber, mortgageOverview}
}