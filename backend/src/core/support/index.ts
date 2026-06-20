import { AsyncSafeResult } from '@/core/types';
import { ApiError } from '@/core/errors';
import { converToTimeZone } from '@/core/utils/functions';
import SupportTicketModel, { 
    ISupportTicketDB, 
    SupportTicketSenderType 
} from '@/database/models/supportTicket';
import { ICustomerDB } from '@/database/models/customer';
import { IBrandDB } from '@/database/models/brand';
import { 
    CreateSupportTicketData, 
    SupportTicketResult, 
    UpdateSupportTicketStatusData 
} from './interfaces';

// ---------------------------------------------------------------------------
// Create Support Ticket
// ---------------------------------------------------------------------------
export async function createSupportTicket(
    sender: ICustomerDB | IBrandDB,
    senderType: SupportTicketSenderType,
    data: CreateSupportTicketData,
): AsyncSafeResult<SupportTicketResult> {
    try {
        const ticketData: any = {
            senderType,
            subject: data.subject,
            message: data.message,
            priority: data.priority,
        };

        if (senderType === SupportTicketSenderType.CUSTOMER) {
            ticketData.customerId = sender._id;
        } else {
            ticketData.brandId = sender._id;
        }

        const ticket = await SupportTicketModel.create(ticketData);
        
        // Populate sender info for the result
        const populated = await SupportTicketModel.findById(ticket._id)
            .populate('customerId', 'name')
            .populate('brandId', 'name');

        return { result: _formatSupportTicket(populated!), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Get Customer Support Tickets
// ---------------------------------------------------------------------------
export async function getCustomerSupportTickets(
    customerId: string,
): AsyncSafeResult<SupportTicketResult[]> {
    try {
        const tickets = await SupportTicketModel.find({ customerId })
            .sort('-createdAt');
        return { result: tickets.map(_formatSupportTicket), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Get Brand Support Tickets
// ---------------------------------------------------------------------------
export async function getBrandSupportTickets(
    brandId: string,
): AsyncSafeResult<SupportTicketResult[]> {
    try {
        const tickets = await SupportTicketModel.find({ brandId })
            .sort('-createdAt');
        return { result: tickets.map(_formatSupportTicket), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Admin: Get All Support Tickets
// ---------------------------------------------------------------------------
export async function adminListSupportTickets(): AsyncSafeResult<SupportTicketResult[]> {
    try {
        const tickets = await SupportTicketModel.find()
            .populate('customerId', 'name')
            .populate('brandId', 'name')
            .sort('-createdAt');
        return { result: tickets.map(_formatSupportTicket), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Admin: Update Support Ticket Status
// ---------------------------------------------------------------------------
export async function adminUpdateSupportTicketStatus(
    ticketId: string,
    data: UpdateSupportTicketStatusData,
): AsyncSafeResult<SupportTicketResult> {
    try {
        const ticket = await SupportTicketModel.findById(ticketId);
        if (!ticket) {
            throw ApiError.notFoundSupportTicket();
        }

        ticket.status = data.status;
        if (data.adminNote !== undefined) {
            ticket.adminNote = data.adminNote;
        }

        await ticket.save();

        const populated = await SupportTicketModel.findById(ticket._id)
            .populate('customerId', 'name')
            .populate('brandId', 'name');

        return { result: _formatSupportTicket(populated!), error: null };
    } catch (err) {
        return { error: err, result: null };
    }
}

// ---------------------------------------------------------------------------
// Helper: Format Support Ticket Result
// ---------------------------------------------------------------------------
function _formatSupportTicket(doc: ISupportTicketDB): SupportTicketResult {
    const customer = doc.customerId as any;
    const brand = doc.brandId as any;

    return {
        id: doc._id!.toString(),
        senderType: doc.senderType,
        customerId: doc.customerId ? (customer._id ? customer._id.toString() : doc.customerId.toString()) : undefined,
        customerName: customer?.name,
        brandId: doc.brandId ? (brand._id ? brand._id.toString() : doc.brandId.toString()) : undefined,
        brandName: brand?.name?.en || brand?.name, // Handles both lang object and string
        subject: doc.subject,
        message: doc.message,
        status: doc.status,
        priority: doc.priority,
        adminNote: doc.adminNote,
        createdAt: converToTimeZone(doc.createdAt),
        updatedAt: converToTimeZone(doc.updatedAt),
    };
}
