const mongoosePaginate = require('mongoose-paginate-v2');
const mongoose = require('mongoose');

const DefaultTiersSchema = new mongoose.Schema(
  {
    tier1: [{
      ParcelNumber: {
        type: Boolean,
        default: true,
      },
      Owner1IsCorporation: {
        type: Boolean,
        default: true,
      },
      Owner2IsCorporation: {
        type: Boolean,
        default: true,
      },
      Owner1FullName: {
        type: Boolean,
        default: true,
      },
      Owner2FullName: {
        type: Boolean,
        default: true,
      },
      lastSaleRecordingDocumentIdapn: {
        type: Boolean,
        default: true,
      },
      lastSaleRecordingDate: {
        type: Boolean,
        default: true,
      },
      lastSaleContractDate: {
        type: Boolean,
        default: true,
      },
      closePrice: {
        type: Boolean,
        default: true,
      },
      lastSaleSeller1FullName: {
        type: Boolean,
        default: true,
      },
      lastSaleSeller2FullName: {
        type: Boolean,
        default: true,
      },
      owner1LastName: {
        type: Boolean,
        default: true,
      },
      owner1FirstName: {
        type: Boolean,
        default: true,
      },
      owner1NameSuffix: {
        type: Boolean,
        default: true,
      },
      owner2LastName: {
        type: Boolean,
        default: true,
      },
      owner2FirstName: {
        type: Boolean,
        default: true,
      },
      owner2NameSuffix: {
        type: Boolean,
        default: true,
      },
      OwnerOccupied: {
        type: Boolean,
        default: true,
      },
      taxExemptionSchoolCollege: {
        type: Boolean,
        default: true,
      },
      taxExemptionReligious: {
        type: Boolean,
        default: true,
      },
      taxExemptionPublicUtility: {
        type: Boolean,
        default: true,
      },
      taxExemptionCemetery: {
        type: Boolean,
        default: true,
      },
      taxExemptionHospital: {
        type: Boolean,
        default: true,
      },
      taxExemptionLibrary: {
        type: Boolean,
        default: true,
      },
      numberOfUnitsTotal: {
        type: Boolean,
        default: true,
      },
      numberOfBuildings: {
        type: Boolean,
        default: true,
      },
      lastSaleTransactionId: {
        type: Boolean,
        default: true,
      },
    }],
    tier2: [{
      StreetNumber: {
        type: Boolean,
        default: true,
      },
      StreetName: {
        type: Boolean,
        default: true,
      },
      StreetSuffix: {
        type: Boolean,
        default: true,
      },
      UnitPrefix: {
        type: Boolean,
        default: true,
      },
      UnitNumber: {
        type: Boolean,
        default: true,
      },
      latitude: {
        type: Boolean,
        default: true,
      },
      longitude: {
        type: Boolean,
        default: true,
      },
      propertyType: {
        type: Boolean,
        default: true,
      },
      propertySubType: {
        type: Boolean,
        default: true,
      },
      propertySubTypeDescription: {
        type: Boolean,
        default: true,
      },
      landUseCode: {
        type: Boolean,
        default: true,
      },
      zoning: {
        type: Boolean,
        default: true,
      },
      censusTractId: {
        type: Boolean,
        default: true,
      },
      lotSizeAcres: {
        type: Boolean,
        default: true,
      },
      lotSizeSquareFeet: {
        type: Boolean,
        default: true,
      },
      legalSubdivisionName: {
        type: Boolean,
        default: true,
      },
      owner1MiddleName: {
        type: Boolean,
        default: true,
      },
      owner2MiddleName: {
        type: Boolean,
        default: true,
      },
      owner1OwnershipRights: {
        type: Boolean,
        default: true,
      },
      taxInitialDeliquencyYear: {
        type: Boolean,
        default: true,
      },
      taxExemptionHomestead: {
        type: Boolean,
        default: true,
      },
      taxExemptionVeteran: {
        type: Boolean,
        default: true,
      },
      taxExemptionDisabled: {
        type: Boolean,
        default: true,
      },
      taxExemptionWidow: {
        type: Boolean,
        default: true,
      },
      taxExemptionSenior: {
        type: Boolean,
        default: true,
      },
      taxExemptionWelfare: {
        type: Boolean,
        default: true,
      },
      buildingAreaTotal: {
        type: Boolean,
        default: true,
      },
      grossArea: {
        type: Boolean,
        default: true,
      },
      belowGradeTotalArea: {
        type: Boolean,
        default: true,
      },
      yearBuiltEffective: {
        type: Boolean,
        default: true,
      },
      architecturalStyle: {
        type: Boolean,
        default: true,
      },
      lastSaleInputBook: {
        type: Boolean,
        default: true,
      },
      lastSaleInputPage: {
        type: Boolean,
        default: true,
      },
    }],
    tier3: [{
      assessedYear: {
        type: Boolean,
        default: true,
      },
      assessedValue: {
        type: Boolean,
        default: true,
      },
      assessedLandValue: {
        type: Boolean,
        default: true,
      },
      assessedImprovementValue: {
        type: Boolean,
        default: true,
      },
      assessorsMapReference: {
        type: Boolean,
        default: true,
      },
      taxYear: {
        type: Boolean,
        default: true,
      },
      taxAnnualAmount: {
        type: Boolean,
        default: true,
      },
      taxLotList: {
        type: Boolean,
        default: true,
      },
      taxLot: {
        type: Boolean,
        default: true,
      },
      taxBlock: {
        type: Boolean,
        default: true,
      },
    }],
  }
);

DefaultTiersSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('DefaultTiers', DefaultTiersSchema);
