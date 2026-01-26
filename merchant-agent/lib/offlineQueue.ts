import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OfflineAction {
    id: string;
    type: 'NIN_VERIFICATION' | 'CREDIT_CHECK' | 'SUBMIT_ONBOARDING' | 'DUPLICATE_CHECK' | 'IMEI_CHECK';
    payload: any;
    timestamp: number;
    retryCount: number;
}

const OFFLINE_QUEUE_KEY = '@vistalock_offline_queue';
const MAX_RETRY_COUNT = 3;

class OfflineQueueService {
    private queue: OfflineAction[] = [];
    private syncing: boolean = false;

    /**
     * Initialize queue from storage
     */
    async initialize() {
        try {
            const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
            if (stored) {
                this.queue = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load offline queue:', error);
        }
    }

    /**
     * Add action to offline queue
     */
    async addAction(type: OfflineAction['type'], payload: any): Promise<string> {
        const action: OfflineAction = {
            id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            payload,
            timestamp: Date.now(),
            retryCount: 0,
        };

        this.queue.push(action);
        await this.saveQueue();

        return action.id;
    }

    /**
     * Remove action from queue
     */
    async removeAction(actionId: string) {
        this.queue = this.queue.filter(action => action.id !== actionId);
        await this.saveQueue();
    }

    /**
     * Get all queued actions
     */
    getQueue(): OfflineAction[] {
        return [...this.queue];
    }

    /**
     * Get queue count
     */
    getQueueCount(): number {
        return this.queue.length;
    }

    /**
     * Clear entire queue
     */
    async clearQueue() {
        this.queue = [];
        await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    }

    /**
     * Save queue to storage
     */
    private async saveQueue() {
        try {
            await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
        } catch (error) {
            console.error('Failed to save offline queue:', error);
        }
    }

    /**
     * Sync queued actions when online
     */
    async syncQueue(executeAction: (action: OfflineAction) => Promise<void>): Promise<{
        success: number;
        failed: number;
        errors: Array<{ actionId: string; error: string }>;
    }> {
        if (this.syncing) {
            return { success: 0, failed: 0, errors: [] };
        }

        this.syncing = true;
        const results = {
            success: 0,
            failed: 0,
            errors: [] as Array<{ actionId: string; error: string }>,
        };

        const actionsToSync = [...this.queue];

        for (const action of actionsToSync) {
            try {
                await executeAction(action);
                await this.removeAction(action.id);
                results.success++;
            } catch (error: any) {
                console.error(`Failed to sync action ${action.id}:`, error);

                // Increment retry count
                const actionIndex = this.queue.findIndex(a => a.id === action.id);
                if (actionIndex !== -1) {
                    this.queue[actionIndex].retryCount++;

                    // Remove if max retries exceeded
                    if (this.queue[actionIndex].retryCount >= MAX_RETRY_COUNT) {
                        await this.removeAction(action.id);
                        results.errors.push({
                            actionId: action.id,
                            error: `Max retries exceeded: ${error?.message || 'Unknown error'}`,
                        });
                    }
                }

                results.failed++;
            }
        }

        await this.saveQueue();
        this.syncing = false;

        return results;
    }

    /**
     * Check if currently syncing
     */
    isSyncing(): boolean {
        return this.syncing;
    }
}

export default new OfflineQueueService();
