import { AsyncSafeResult } from '@/core/types';
import { ApiError } from '@/core/errors';
import { converToTimeZone } from '@/core/utils/functions';
import { IProviderDB } from '@/database/models/provider';
import InspectionModel, { IInspectionDB } from '@/database/models/inspection';
import RepairRequestModel, { RepairRequestStatus } from '@/database/models/repairRequest';
import BrandOfferModel from '@/database/models/brandOffer';
import { CreateInspectionData, InspectionResult } from './interfaces';

// ---------------------------------------------------------------------------
// Provider: create inspection result
// ---------------------------------------------------------------------------
export async function createInspection(
    provider: IProviderDB,
    requestId: string,
    data: CreateInspectionData,
): AsyncSafeResult<InspectionResult> {
    try {
        const req = await RepairRequestModel.findById(requestId);
        if (!req) throw ApiError.notFoundRepairRequest();
        if (req.status !== RepairRequestStatus.INSPECTION_PENDING)
            throw ApiError.invalidRepairRequestStatus();

        // Find the accepted offer to get brandOfferId
        const offer = await BrandOfferModel.findById(req.selectedOfferId);
        if (!offer) throw ApiError.notFoundBrandOffer();
        // Only the brand whose offer was accepted may submit the inspection
        if (offer.brandId.toString() !== provider.brandId.toString()) throw ApiError.notFoundRepairRequest();

        const inspectionExist = await InspectionModel.findOne({ repairRequestId: requestId });
        if (inspectionExist) throw ApiError.duplicateInspection();

        const inspection = await InspectionModel.create({
            repairRequestId: requestId,
            brandOfferId: offer._id,
            brandId: provider.brandId,
            customerId: req.customerId,
            resultNotes: data.resultNotes,
            finalPrice: data.finalPrice,
            images: data.images ?? [],
        });

        req.status = RepairRequestStatus.INSPECTION_DONE;
        await req.save();

        req.status = RepairRequestStatus.PAYMENT_PENDING;
        await req.save();

        return { result: _formatInspection(inspection), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Customer: get inspection result for a repair request
// ---------------------------------------------------------------------------
export async function getInspectionByRequest(
    requestId: string,
): AsyncSafeResult<InspectionResult> {
    try {
        const inspection = await InspectionModel.findOne({ repairRequestId: requestId });
        if (!inspection) throw ApiError.notFoundInspection();
        return { result: _formatInspection(inspection), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Provider: get inspection result by ID
// ---------------------------------------------------------------------------
export async function getInspectionById(
    inspectionId: string,
): AsyncSafeResult<InspectionResult> {
    try {
        const inspection = await InspectionModel.findById(inspectionId);
        if (!inspection) throw ApiError.notFoundInspection();
        return { result: _formatInspection(inspection), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

export function _formatInspection(doc: IInspectionDB): InspectionResult {
    return {
        id: doc._id!.toString(),
        repairRequestId: doc.repairRequestId.toString(),
        brandOfferId: doc.brandOfferId.toString(),
        brandId: doc.brandId.toString(),
        customerId: doc.customerId.toString(),
        resultNotes: doc.resultNotes,
        finalPrice: doc.finalPrice,
        images: doc.images,
        createdAt: converToTimeZone(doc.createdAt),
    };
}
