import { Server as SocketServer, Socket } from 'socket.io';
import { JWTAuthService } from '@/core/auth';
import CustomerModel, { ICustomerDB } from '@/database/models/customer';
import ProviderModel, { IProviderDB } from '@/database/models/provider';

// ---------------------------------------------------------------------------
// Augment socket data type
// ---------------------------------------------------------------------------
interface AuthSocket extends Socket {
    data: {
        customer?: ICustomerDB;
        provider?: IProviderDB;
    };
}

// ---------------------------------------------------------------------------
// JWT auth middleware — runs before 'connection' fires
// ---------------------------------------------------------------------------
async function jwtAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
    try {
        // Accept token from socket.handshake.auth.token OR query.token
        const raw: string | undefined =
            (socket.handshake.auth as Record<string, string>).token ||
            (socket.handshake.query.token as string | undefined);

        if (!raw) {
            return next(new Error('Authentication error: no token provided'));
        }

        // Strip "Bearer " prefix if present
        const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;

        // 1. Try verifying as customer (User)
        let result = JWTAuthService.verifyUserAccessToken(token);
        let userId: string | null = result.result?.userId || null;

        // 2. If it fails, try verifying as provider
        if (!userId) {
            const providerResult = JWTAuthService.verifyProviderAccessToken(token);
            if (providerResult.result && !providerResult.error) {
                userId = providerResult.result;
            }
        }

        if (!userId) {
            return next(new Error('Authentication error: invalid token'));
        }

        // 1. Try finding as customer
        const customer = await CustomerModel.findById(userId);
        if (customer) {
            if (customer.deletedAt) {
                return next(new Error('Authentication error: account is banned or deleted'));
            }
            socket.data.customer = customer;
            return next();
        }

        // 2. Try finding as provider
        const provider = await ProviderModel.findById(userId);
        if (provider) {
            if (provider.deletedAt) {
                return next(new Error('Authentication error: account is banned or deleted'));
            }
            socket.data.provider = provider;
            return next();
        }

        return next(new Error('Authentication error: user not found'));
    } catch {
        next(new Error('Authentication error: token verification failed'));
    }
}

// ---------------------------------------------------------------------------
// Socket.IO server initialiser
// ---------------------------------------------------------------------------
export function initSocket(io: SocketServer): void {
    // Apply JWT auth to every incoming connection
    io.use(jwtAuthMiddleware);

    io.on('connection', (socket: Socket) => {
        const authSocket = socket as AuthSocket;

        // Handle customer connection
        if (authSocket.data.customer) {
            const customerId = authSocket.data.customer._id!.toString();
            socket.join(`customer:${customerId}`);
        }

        // Handle provider connection — join both brand room and own private room
        if (authSocket.data.provider) {
            const brandId = authSocket.data.provider.brandId.toString();
            const providerId = authSocket.data.provider._id!.toString();
            socket.join(`brand:${brandId}`);
            socket.join(`provider:${providerId}`);
        }

        socket.on('disconnect', () => {
            // Room cleanup is automatic
        });
    });
}

