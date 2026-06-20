import { useState, useEffect, useCallback } from 'react';
import { supportService } from '@/services/supportService';
import { SupportTicket } from '@/types/support';
import { toast } from 'react-hot-toast';

export function useSupport() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const fetchTickets = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await supportService.getTickets();
            setTickets(data);
        } catch (error: any) {
            console.error('Error fetching tickets:', error);
            toast.error('Failed to load support tickets');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createTicket = async (data: {
        subject: string;
        message: string;
        priority: string;
    }) => {
        try {
            setIsCreating(true);
            const newTicket = await supportService.createTicket(data);
            setTickets(prev => [newTicket, ...prev]);
            toast.success('Support ticket created successfully');
            return newTicket;
        } catch (error: any) {
            console.error('Error creating ticket:', error);
            toast.error('Failed to create support ticket');
            throw error;
        } finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    return {
        tickets,
        isLoading,
        isCreating,
        createTicket,
        refreshTickets: fetchTickets,
    };
}
