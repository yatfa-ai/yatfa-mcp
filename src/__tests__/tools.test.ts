import { initializeTools, executeToolWrapper } from '../tools/index';
import { api } from '../api';

// Mock the API client
jest.mock('../api', () => ({
    api: {
        get: jest.fn(),
        post: jest.fn()
    }
}));

describe('MCP Tools (Dynamic Loader)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Tool Loading', () => {
        it('loads tools from Rails API on initialization', async () => {
            const mockTools = [
                {
                    name: 'list_tickets',
                    description: 'List tickets',
                    parameters: {
                        type: 'object',
                        properties: {
                            status: { type: 'string' }
                        }
                    }
                },
                {
                    name: 'transition_ticket',
                    description: 'Transition ticket',
                    parameters: {
                        type: 'object',
                        properties: {
                            ticket_id: { type: 'integer' },
                            event: { type: 'string' }
                        },
                        required: ['ticket_id', 'event']
                    }
                }
            ];

            (api.get as jest.Mock).mockResolvedValue({
                data: { tools: mockTools }
            });

            await initializeTools();

            expect(api.get).toHaveBeenCalledWith('/mcp/tools');
        });

        it('handles tool loading errors gracefully', async () => {
            const error = new Error('Rails API unavailable');
            (api.get as jest.Mock).mockRejectedValue(error);

            await expect(initializeTools()).rejects.toThrow('Rails API unavailable');
        });
    });

    describe('Tool Execution', () => {
        beforeEach(async () => {
            // Initialize tools before each execution test
            const mockTools = [
                {
                    name: 'list_tickets',
                    description: 'List tickets',
                    parameters: {
                        type: 'object',
                        properties: {
                            status: { type: 'string' }
                        }
                    }
                },
                {
                    name: 'transition_ticket',
                    description: 'Transition ticket',
                    parameters: {
                        type: 'object',
                        properties: {
                            ticket_id: { type: 'integer' },
                            event: { type: 'string' }
                        },
                        required: ['ticket_id', 'event']
                    }
                }
            ];

            (api.get as jest.Mock).mockResolvedValue({
                data: { tools: mockTools }
            });

            await initializeTools();
        });

        it('executes list_tickets tool', async () => {
            const mockResponse = {
                data: [{ id: 1, title: 'Ticket 1' }],
                meta: { total_count: 150, offset: 0, limit: 20, has_more: true }
            };
            (api.post as jest.Mock).mockResolvedValue({ data: { result: mockResponse } });

            const result = await executeToolWrapper('list_tickets', { status: 'todo' });
            const parsed = JSON.parse(result.content[0].text);

            expect(api.post).toHaveBeenCalledWith('/mcp/execute', {
                tool: 'list_tickets',
                params: { status: 'todo' }
            });
            expect(parsed).toEqual(mockResponse);
        });

        it('executes transition_ticket tool', async () => {
            const mockTicket = { id: 1, status: 'in_progress' };
            (api.post as jest.Mock).mockResolvedValue({ data: { result: mockTicket } });

            const result = await executeToolWrapper('transition_ticket', { ticket_id: 1, event: 'start_work' });

            expect(api.post).toHaveBeenCalledWith('/mcp/execute', {
                tool: 'transition_ticket',
                params: { ticket_id: 1, event: 'start_work' }
            });
            expect(JSON.parse(result.content[0].text)).toEqual(mockTicket);
        });

        it('handles tool execution errors', async () => {
            const error = new Error('Network Error');
            (api.post as jest.Mock).mockRejectedValue(error);

            const result = await executeToolWrapper('list_tickets', {});

            expect((result as any).isError).toBe(true);
            expect(result.content[0].text).toContain('Network Error');
        });

        it('handles API response errors', async () => {
            const error = {
                response: {
                    status: 500,
                    data: { error: 'Internal Server Error' }
                }
            } as any;
            (api.post as jest.Mock).mockRejectedValue(error);

            const result = await executeToolWrapper('list_tickets', {});

            expect((result as any).isError).toBe(true);
            expect(result.content[0].text).toContain('500');
        });

        it('handles network errors (no response)', async () => {
            const error = {
                request: {}
            } as any;
            (api.post as jest.Mock).mockRejectedValue(error);

            const result = await executeToolWrapper('list_tickets', {});

            expect((result as any).isError).toBe(true);
            expect(result.content[0].text).toContain('Network Error');
        });
    });
});
