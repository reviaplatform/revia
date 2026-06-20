import Joi from 'joi';
import { SupportTicketPriority } from '@/database/models/supportTicket';

export const createSupportTicketSchema = Joi.object({
    subject: Joi.string().required().max(200),
    message: Joi.string().required().max(2000),
    priority: Joi.string().valid(...Object.values(SupportTicketPriority)).optional(),
});
