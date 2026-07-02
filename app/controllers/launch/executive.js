const moment = require('moment');
const UserModel = require('../../models/user')
const TeamModel = require('../../models/team')
const LeadTagModel = require('../../models/leadTag');
const MortgageTagModel = require('../../models/mortgageTag');
const SweepParameterModel = require('../../models/sweepParameter');
const PaymentScheduleModel = require('../../models/paymentSchedules');
const { handleRequestLog } = require('../../utils/logHandling.utils');
const { mortgageDataModel } = require('../../utils/teamEnvironmentModels.utils');
const ActionsPermissionsModel = require('../../models/actionsPermissions');
const { sendApiErrorResponse, sendApiSuccessResponse } = require('../../utils/response.utils');

async function launchExecutiveTeam(req, res) {
  try {
    console.info('-----------------------------------')
    console.info('-----------------------------------')
    console.info('*** Commencing Executive app launch...')
    let proceedToken = true
    if (req.body.registrationToken !== process.env.REGISTRATION) {
      let time = moment(new Date())
      let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
      await handleRequestLog('Invalid', errorTime, 'Incorrect Registration Token', 'Launch Team', [{}], '', false, null)
      sendApiSuccessResponse(res, null, 'Invalid registration token.')
      console.info('*** Invalid registration token. Rejected launch attempt.')
      console.info('')
      proceedToken = false
    }
    if (proceedToken) {
      let proceedTeam = true
      let existingTeam = await TeamModel.findOne()
      if (existingTeam) {
        let time = moment(new Date())
        let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
        await handleRequestLog('Error', errorTime, 'Team Already Launched', 'Launch Team', [{}], '', false, null)
        sendApiSuccessResponse(res, null, 'Team already launched')
        console.info('*** Hmmmm, it appears the app is already launched. Strange request...')
        console.info('')
        proceedTeam = false
      }   
      if (proceedTeam) {
        let todaysDate = moment(new Date())
        let todaysDateLabel = todaysDate.format("MMM Do, YYYY") 
        
        //* Create Lead Tags
        let leadTagIds = []
        let leadTag1 = new LeadTagModel ({
          label: 'Potential Subdivision',
          apiMapping: 'subdivision',
          origin: 'default',
          discrepancyFields: ['PostalCodePlus4', 'PostalCode', 'StateOrProvince', 'Municipality', 'City', 'StreetAddressOneLine', 'StreetAddressLine2', 'StreetAddressLine1', 'UnitNumber', 'UnitPrefix', 'StreetSuffix', 'StreetDirSuffix', 'StreetDirPrefix', 'StreetName', 'StreetNumber', 'BelowGradeFinishedArea', 'BelowGradeTotalArea', 'Longitude', 'Latitude', 'AssessorsMapReference', 'TaxBlock', 'TaxCodeArea', 'LegalSubdivisionName', 'LotSizeSquareFeet', 'LotSizeAcres', 'TaxLot', 'ParcelNumber'],
        })
        await leadTag1.save()
        leadTagIds.push(leadTag1._id)
        let leadTag2 = new LeadTagModel ({
          label: 'Recent Rezoning',
          apiMapping: 'rezoning',
          origin: 'default',
          discrepancyFields: ['AssessorsMapReference', 'PropertyType', 'TaxBlock', 'TaxCodeArea', 'CountyUseCode', 'LandUseCode', 'MunName', 'CountrySecSubd', 'CountyLandUseCode', 'Zoning', 'TaxLot'],
        })
        await leadTag2.save()
        leadTagIds.push(leadTag2._id)
        let leadTag3 = new LeadTagModel ({
          label: 'Recent Improvements',
          apiMapping: 'improvements',
          origin: 'default',
          discrepancyFields: ['GarageArea', 'GarageSpaces', 'ParkingSpaces', 'CarStorageType', 'InteriorWallsType', 'RoofType', 'RoofCoverType', 'YearBuiltEffective', 'ExteriorWallsType', 'ConstructionType', 'YearBuilt', 'ArchitecturalStyle', 'NumberOfBuildings', 'NumberOfUnitsTotal', 'LivingArea', 'GrossArea', 'BuildingAreaTotal', 'BathroomsFull', 'BathroomsTotalInteger', 'RoomsTotal', 'BedroomsTotal', 'FireplacesTotal', 'Heating', 'Cooling', 'Stories', 'PoolType', 'BuildingQualityScore', 'PropertySubType', 'PropertySubTypeDescription', 'SewerType', 'WaterSource', 'Longitude', 'CountyUseCode', 'LandUseCode', 'Latitude'],
          currentAssignments: 1,
          activeLeads: 1,
        })
        await leadTag3.save()
        leadTagIds.push(leadTag3._id)
        let leadTag4 = new LeadTagModel ({
          label: 'Recent Transfer',
          apiMapping: 'transfer',
          origin: 'default',
          discrepancyFields: ['Owner2FirstName', 'Owner2LastName', 'Owner2FullName', 'Owner2IsCorporation', 'Owner1FirstName', 'Owner1LastName', 'Owner1FullName', 'Owner1IsCorporation', 'Owner1OwnershipRights', 'CorporateIndicator', 'LastSaleSellerName', 'LastSaleSeller1FullName', 'LastSaleSeller2FullName', 'LastSaleRecordingDocumentId', 'SaleDocType', 'LastSaleBuyerName', 'LastSaleTransactionId', 'ClosePriceDescription', 'ClosePrice', 'LastSaleDate', 'LastSaleContractDate', 'LastSaleRecordingDate', 'AttomSellerName', 'LeaseholdOrFeeSimple', 'REOflag', 'QuitClaimFlag'],
          currentAssignments: 3,
          activeLeads: 3,
        })
        await leadTag4.save()
        leadTagIds.push(leadTag4._id)
        let leadTag5 = new LeadTagModel ({
          label: 'Add/Sub Units',
          apiMapping: 'addSubUnits',
          origin: 'default',
          discrepancyFields: ['YearBuiltEffective', 'ExteriorWallsType', 'FrameType', 'ConstructionType', 'YearBuilt', 'NumberOfBuildings', 'NumberOfUnitsTotal', 'LivingArea', 'GrossArea', 'BuildingAreaTotal', 'BathroomsFull', 'BathroomsTotalInteger', 'RoomsTotal', 'BedroomsTotal', 'Stories', 'PropertySubType', 'PropertySubTypeDescription', 'Longitude', 'Latitude'],
        })
        await leadTag5.save()
        leadTagIds.push(leadTag5._id)
        let leadTag6 = new LeadTagModel ({
          label: 'Tax Exemption Status Changed',
          apiMapping: 'taxExemptionStatus',
          origin: 'default',
          discrepancyFields: ['TaxExemptionLibrary', 'TaxExemptionHospital', 'TaxExemptionCemetery', 'TaxExemptionPublicUtility', 'TaxExemptionWelfare', 'TaxExemptionReligious', 'TaxExemptionSchoolCollege', 'TaxExemptionSenior', 'TaxExemptionWidow', 'TaxExemptionDisabled', 'TaxExemptionVeteran', 'TaxExemptionHomestead', 'OwnerOccupied'],
        })
        await leadTag6.save()
        leadTagIds.push(leadTag6._id)
        let leadTag7 = new LeadTagModel ({
          label: 'Recent Distress',
          apiMapping: 'distress',
          origin: 'default',
          discrepancyFields: ['DistressYN', 'REOflag', 'TaxInitialDeliquencyYear'],
        })
        await leadTag7.save()
        leadTagIds.push(leadTag7._id)
        let leadTag9 = new LeadTagModel ({
          label: 'New Mortgage',
          apiMapping: 'newMortgage',
          origin: 'default',
          discrepancyFields: ['PrimaryMortgageAmount', 'PrimaryMortgageInterestRate', 'PrimaryLenderName', 'PrimaryMortgageStartDate', 'PrimaryLoanType', 'PrimaryMortgageTerm', 'PrimaryMortgageDueDate', 'MortgageTransactionDescription', 'SecondaryMortgageAmount', 'SecondaryLenderName', 'SecondaryMortgageRecordingDate', 'SecondaryLoanType', 'SecondaryMortgageTerm', 'SecondaryMortgageDueDate'],
        })
        await leadTag9.save()
        leadTagIds.push(leadTag9._id)
        let leadTag10 = new LeadTagModel({
          label: 'New Owner is LLC',
          apiMapping: 'newOwnerIsLLC',
          origin: 'default',
          discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
        })
        await leadTag10.save()
        leadTagIds.push(leadTag10._id)
        let leadTag11 = new LeadTagModel({
          label: 'New Owner is LLP',
          apiMapping: 'newOwnerIsLLP',
          origin: 'default',
          discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
        })
        await leadTag11.save()
        leadTagIds.push(leadTag11._id)
        let leadTag12 = new LeadTagModel({
          label: 'New Owner is FLLP',
          apiMapping: 'newOwnerIsFLLP',
          origin: 'default',
          discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
        })
        await leadTag12.save()
        leadTagIds.push(leadTag12._id)
        let leadTag13 = new LeadTagModel({
          label: 'New Owner is Incorporated',
          apiMapping: 'newOwnerIsCorporation',
          origin: 'default',
          discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
        })
        await leadTag13.save()
        leadTagIds.push(leadTag13._id)
        let leadTag14 = new LeadTagModel({
          label: 'New Owner is Trust',
          apiMapping: 'newOwnerIsTrust',
          origin: 'default',
          discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
        })
        await leadTag14.save()
        leadTagIds.push(leadTag14._id)
        let leadTag15 = new LeadTagModel({
          label: 'New Owner is Revocable Trust',
          apiMapping: 'newOwnerIsRevocableTrust',
          origin: 'default',
          discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
        })
        await leadTag15.save()
        leadTagIds.push(leadTag15._id)
        let leadTag16 = new LeadTagModel({
          label: 'New Owner is Living Trust',
          apiMapping: 'newOwnerIsLivingTrust',
          origin: 'default',
          discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
        })
        await leadTag16.save()
        leadTagIds.push(leadTag16._id)
        let leadTag17 = new LeadTagModel({
          label: 'New Owner is Association',
          apiMapping: 'newOwnerIsAssociation',
          origin: 'default',
          discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
        })
        await leadTag17.save()
        leadTagIds.push(leadTag17._id)
        let leadTag18 = new LeadTagModel({
          label: 'Entity New Owner Type',
          apiMapping: 'miscEntityNewOwnerType',
          origin: 'default',
          discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator'],
        })
        await leadTag18.save()
        leadTagIds.push(leadTag18._id)

        let guestPermissions = new ActionsPermissionsModel({
          belongsToRole: 'guest',
        })
        await guestPermissions.save()
        let userPermissions = new ActionsPermissionsModel({
          belongsToRole: 'user',
          assignMortgageTag: true,
          addMortgagePayment: true,
          searchForProperty: true,
          runMortgageScan: true,
          saveFromSearch: true,
          assignLeadTag: true,
          setInvestigationClosing: true,
          setInvestigationFinalized: true,
          dismissLead: true,
          validateLeadAwaitingUpdate: true,
          saveTargetRefinanceChanges: true,
          addMortgageNote: true,
          resolveAllMortgageDiscrepancies: true,
          editLeadTargetOutcome: true,
          addAssignees: true,
          openLeadInvestigation: true,
        })
        await userPermissions.save()
        let adminPermissions = new ActionsPermissionsModel({
          belongsToRole: 'admin',
          csvMortgageUpload: true,
          searchMortgageUpload: true,
          runSingleScan: true,
          addMortgageType: true,
          editParameterStatus: true,
          editDefaultTargets: true,
          editDefaultTargetType: true,
          editSecuritySettings: true,
          assignMortgageTag: true,
          addMortgagePayment: true,
          searchForProperty: true,
          runMortgageScan: true,
          saveFromSearch: true,
          assignLeadTag: true,
          setInvestigationClosing: true,
          setInvestigationFinalized: true,
          dismissLead: true,
          validateLeadAwaitingUpdate: true,
          saveTargetRefinanceChanges: true,
          addMortgageNote: true,
          resolveAllMortgageDiscrepancies: true,
          editLeadTargetOutcome: true,
          addAssignees: true,
          openLeadInvestigation: true,
          editMortgageRecordDetails: true,
        })
        await adminPermissions.save()
        let superPermissions = new ActionsPermissionsModel({
          belongsToRole: 'super',
          csvMortgageUpload: true,
          searchMortgageUpload: true,
          checkMortgageDuplicates: true,
          runSingleScan: true,
          deleteMortgage: true,
          clearMortgageCurrentPublicRecordValues: true,
          clearMortgageCurrentRecordValues: true,
          runRecordSweep: true,
          deleteActionLog: true,
          dropAllFromDatabase: true,
          addMortgageType: true,
          editParameterStatus: true,
          editDefaultTargets: true,
          editDefaultTargetType: true,
          editSecuritySettings: true,
          assignMortgageTag: true,
          addMortgagePayment: true,
          searchForProperty: true,
          runMortgageScan: true,
          saveFromSearch: true,
          assignLeadTag: true,
          setInvestigationClosing: true,
          setInvestigationFinalized: true,
          dismissLead: true,
          validateLeadAwaitingUpdate: true,
          saveTargetRefinanceChanges: true,
          addMortgageNote: true,
          resolveAllMortgageDiscrepancies: true,
          editLeadTargetOutcome: true,
          addAssignees: true,
          openLeadInvestigation: true,
          editMortgageRecordDetails: true,
        })
        await superPermissions.save()
    
          //* Create Mortgage Tags
      let mortgageTagIds = []
      let mortgageTag1 = new MortgageTagModel({
        label: 'LLC Owned',
        apiMapping: 'ownerIsLLC',
        origin: 'default',
        discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
      })
      await mortgageTag1.save()
      mortgageTagIds.push(mortgageTag1._id)
      let mortgageTag2 = new MortgageTagModel({
        label: 'LLP Owned',
        apiMapping: 'ownerIsLLP',
        origin: 'default',
        discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
      })
      await mortgageTag2.save()
      mortgageTagIds.push(mortgageTag2._id)
      let mortgageTag3 = new MortgageTagModel({
        label: 'FLLP Owned',
        apiMapping: 'ownerIsFLLP',
        origin: 'default',
        discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
      })
      await mortgageTag3.save()
      mortgageTagIds.push(mortgageTag3._id)
      let mortgageTag4 = new MortgageTagModel({
        label: 'Corporate Owned',
        apiMapping: 'ownerIsCorporation',
        origin: 'default',
        discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
      })
      await mortgageTag4.save()
      mortgageTagIds.push(mortgageTag4._id)
      let mortgageTag5 = new MortgageTagModel({
        label: 'Trust',
        apiMapping: 'ownerIsTrust',
        origin: 'default',
        discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
      })
      await mortgageTag5.save()
      mortgageTagIds.push(mortgageTag5._id)
      let mortgageTag6 = new MortgageTagModel({
        label: 'Revocable Trust',
        apiMapping: 'ownerIsRevocableTrust',
        origin: 'default',
        discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
      })
      await mortgageTag6.save()
      mortgageTagIds.push(mortgageTag6._id)
      let mortgageTag7 = new MortgageTagModel({
        label: 'Living Trust',
        apiMapping: 'ownerIsLivingTrust',
        origin: 'default',
        discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
      })
      await mortgageTag7.save()
      mortgageTagIds.push(mortgageTag7._id)
      let mortgageTag8 = new MortgageTagModel({
        label: 'Association Owner',
        apiMapping: 'ownerIsAssociation',
        origin: 'default',
        discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator', 'Owner1FullName', 'Owner1LastName', 'Owner1FirstName', 'Owner2FullName', 'Owner2LastName', 'Owner2FirstName'],
      })
      await mortgageTag8.save()
      mortgageTagIds.push(mortgageTag8._id)
      let mortgageTag9 = new MortgageTagModel({
        label: 'Entity Owner Type',
        apiMapping: 'miscEntityOwnerType',
        origin: 'default',
        discrepancyFields: ['Owner1IsCorporation', 'Owner2IsCorporation', 'CorporateIndicator'],
      })
      await mortgageTag9.save()
      mortgageTagIds.push(mortgageTag9._id)
      //* Property Type Tags
      let mortgageTag10 = new MortgageTagModel({
        label: 'Commercial Property',
        apiMapping: 'commercialProperty',
        origin: 'default',
        discrepancyFields: ['PropertySubTypeDescription', 'PropertyType'],
      })
      await mortgageTag10.save()
      mortgageTagIds.push(mortgageTag10._id)
      let mortgageTag11 = new MortgageTagModel({
        label: 'Residential Property',
        apiMapping: 'residentialProperty',
        origin: 'default',
        discrepancyFields: ['PropertySubTypeDescription', 'PropertyType'],
      })
      await mortgageTag11.save()
      mortgageTagIds.push(mortgageTag11._id)
      let mortgageTag12 = new MortgageTagModel({
        label: 'Property Type',
        apiMapping: 'miscPropertyType',
        origin: 'default',
        discrepancyFields: ['PropertySubTypeDescription', 'PropertyType'],
      })
      await mortgageTag12.save()
      mortgageTagIds.push(mortgageTag12._id)
      //* Amortization Type Tags
      let mortgageTag13 = new MortgageTagModel({
        label: 'Fixed-Rate Amortization',
        apiMapping: 'fixedRateAmortization',
        origin: 'default',
        discrepancyFields: [],
      })
      await mortgageTag13.save()
      mortgageTagIds.push(mortgageTag13._id)
      //* Loan Type Tags
      let mortgageTag14 = new MortgageTagModel({
        label: 'Conventional Loan',
        apiMapping: 'conventionalLoan',
        origin: 'default',
        discrepancyFields: ['PrimaryLoanType'],
      })
      await mortgageTag14.save()
      mortgageTagIds.push(mortgageTag14._id)
      let mortgageTag15 = new MortgageTagModel({
        label: 'Loan Type',
        apiMapping: 'miscLoanType',
        origin: 'default',
        discrepancyFields: ['PrimaryLoanType'],
      })
      await mortgageTag15.save()
      mortgageTagIds.push(mortgageTag15._id)
      //* Distress Tags (All One-Diemnsional)
      let mortgageTag16 = new MortgageTagModel({
        label: 'Tax Initial Delinquency Year',
        apiMapping: 'taxInitialDelinquencyYear',
        origin: 'default',
        discrepancyFields: ['TaxInitialDeliquencyYear'],
      })
      await mortgageTag16.save()
      mortgageTagIds.push(mortgageTag16._id)
      let mortgageTag17 = new MortgageTagModel({
        label: 'REO',
        apiMapping: 'reoFlag',
        origin: 'default',
        discrepancyFields: ['REOflag'],
      })
      await mortgageTag17.save()
      mortgageTagIds.push(mortgageTag17._id)
      let mortgageTag18 = new MortgageTagModel({
        label: 'Distress',
        apiMapping: 'distress',
        origin: 'default',
        discrepancyFields: ['DistressYN'],
      })
      await mortgageTag18.save()
      mortgageTagIds.push(mortgageTag18._id)
      //* One-Dimensional Tags
      let mortgageTag19 = new MortgageTagModel({
        label: 'Quit Claim',
        apiMapping: 'quitClaim',
        origin: 'default',
        discrepancyFields: ['QuitClaimFlag'],
      })
      await mortgageTag19.save()
      mortgageTagIds.push(mortgageTag19._id)
      let mortgageTag20 = new MortgageTagModel({
        label: 'Second Mortgage',
        apiMapping: 'secondMortgage',
        origin: 'default',
        discrepancyFields: ['SecondaryMortgageAmount', 'SecondaryLenderName', 'SecondaryMortgageRecordingDate', 'SecondaryLoanType', 'SecondaryMortgageTerm', 'SecondaryMortgageDueDate'],
      })
      await mortgageTag20.save()
      mortgageTagIds.push(mortgageTag20._id)
      let mortgageTag21 = new MortgageTagModel({
        label: 'Owner Occupied',
        apiMapping: 'ownerOccupied',
        origin: 'default',
        discrepancyFields: ['OwnerOccupied'],
      })
      await mortgageTag21.save()
      mortgageTagIds.push(mortgageTag21._id)
      let mortgageTag22 = new MortgageTagModel ({
        label: 'Tax Exemption Status Changed',
        apiMapping: 'taxExemptionStatus',
        origin: 'default',
        discrepancyFields: ['TaxExemptionLibrary', 'TaxExemptionHospital', 'TaxExemptionCemetery', 'TaxExemptionPublicUtility', 'TaxExemptionWelfare', 'TaxExemptionReligious', 'TaxExemptionSchoolCollege', 'TaxExemptionSenior', 'TaxExemptionWidow', 'TaxExemptionDisabled', 'TaxExemptionVeteran', 'TaxExemptionHomestead'],
      })
      await mortgageTag22.save()
      mortgageTagIds.push(mortgageTag22._id)

        let sweepParameters = []
        for (let j = 0; j < Object.entries(mortgageDataModel).length; j++) {
          for (let k = 0; k < Object.entries(Object.entries(mortgageDataModel)[j][1]).length; k++) {
            let sweepParameter = new SweepParameterModel({
              subCategory: Object.entries(mortgageDataModel)[j][0],
              apiMapping: Object.entries(Object.entries(mortgageDataModel)[j][1])[k][0],
              label: Object.entries(Object.entries(mortgageDataModel)[j][1])[k][1].label,
              assignedTier: Object.entries(Object.entries(mortgageDataModel)[j][1])[k][1].assignedTier,
              active: Object.entries(Object.entries(mortgageDataModel)[j][1])[k][1].active,
              tags: Object.entries(Object.entries(mortgageDataModel)[j][1])[k][1].tags,
            });
            await sweepParameter.save();
            sweepParameters.push(sweepParameter)
          }
        }

        let paymentSchedules = []
        let paymentSchedule1 = new PaymentScheduleModel({
          label: 'Fixed-Rate',
          apiMapping: 'fixedRateAmortization',
          calculation: '[P * r * (1 + r)^n] ÷ [(1 + r)^(n - 1)]',
          legend: [
            'P: The principal loan amount',
            'r: The monthly interest rate, which is the annual interest rate divided by 12',
            'n: The number of payments, which is the borrowing term in years multiplied by 12',
          ],
        })
        await paymentSchedule1.save()
        paymentSchedules.push(paymentSchedule1._id)
    
        let team = new TeamModel({
          dateCreated: todaysDateLabel,
          teamName: 'Lancaster Systems',
          appAdminName: 'Jake Walsh',
          appAdminEmail: 'solutions@lancastersweep.com',
          lastRefinance: 'N/A',
          lastRenegotiation: 'N/A',
          queryFrequency: 30,
          lastQuery: 'N/A',
          nextQuery: 'N/A',
          subscriptionMonthlyQueries: 200,
          remainingMonthlyQueries: 200,
          sweepParameters: sweepParameters,
          defaultTargetTerm: 30,
          defaultTargetInterestRate: 7,
          mortgageTags: mortgageTagIds,
          leadTags: leadTagIds,
          subscription: 'enterprise',
          paymentSchedules: paymentSchedules,
          defaultPaymentSchedule: paymentSchedule1._id,
        });
        await team.save();
    
        let teamMembers = [];
        let firstNames = ['Duane', 'Jimmy']
        let lastNames = ['Allman', 'Page']
        for (let i = 0; i < firstNames.length; i++) {
          let teamMember = new UserModel({
            dateCreated: todaysDateLabel,
            role: 'user',
            firstName: firstNames[i],
            lastName: lastNames[i],
            fullName: firstNames[i] + ' ' + lastNames[i],
            initials: firstNames[i].charAt(0) + lastNames[i].charAt(0),
            email: firstNames[i] + '@gmail.com',
            team: team._id,
            loginDates: [{
              date: 'N/A',
              ip: '',
            }],
            defaultState: 'CA',
            defaultCity: 'San Francisco',
          })
          await teamMember.save();
          teamMembers.push(teamMember._id)
        }
        
        let super1 = new UserModel({
          dateCreated: todaysDateLabel,
          role: 'super',
          fullName: 'Jake Walsh',
          firstName: 'Jake',
          initials: 'JW',
          lastName: 'Walsh',
          email: 'solutions@lancastersweep.com',
          team: team._id,
          loginDates: [{
            date: 'N/A',
            ip: '',
          }],
          defaultState: 'CA',
          defaultCity: 'San Francisco',
        })
        await super1.save();
        teamMembers.push(super1._id)
        let admin1 = new UserModel({
          dateCreated: todaysDateLabel,
          role: 'admin',
          fullName: 'Frank Antonini',
          firstName: 'Frank',
          initials: 'FA',
          lastName: 'Antonini',
          email: 'solutions@lancastersweep.com',
          team: team._id,
          loginDates: [{
            date: 'N/A',
            ip: '',
          }],
          defaultState: 'CA',
          defaultCity: 'San Francisco',
        })
        await admin1.save();
        teamMembers.push(admin1._id)
    
        await team.updateOne({
          members: teamMembers
        })
    
        let logTime = todaysDate.format("MMM Do, YYYY HH:mm:ss")
        await handleRequestLog('Log', logTime, 'Launch Team', 'Auth', [{type: 'Team ID', detail: team._id}], 'success', false, null, null, null, null)
        sendApiSuccessResponse(res, null, 'Launch successful');
        console.info("*** Success")
        console.info('')
      }
    }
  } catch (error) {
    console.info('*** Something went wrong!! The error:')
    console.error(error)
    console.info('')
    let time = moment(new Date())
    let errorTime = time.format("MMM Do, YYYY HH:mm:ss")
    await handleRequestLog('Error', errorTime, 'API Request Error', 'Launch Team', [{}], error, true, null, null, null, null)
    sendApiErrorResponse(res, null, error)
  }
}

module.exports = { launchExecutiveTeam };
