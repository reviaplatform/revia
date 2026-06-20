import Joi from 'joi';
import { SupportTicketStatus } from '@/database/models/supportTicket';

export const updateSupportTicketStatusSchema = Joi.object({
    status: Joi.string().valid(...Object.values(SupportTicketStatus)).required(),
    adminNote: Joi.string().max(1000).optional().allow(''),
});
