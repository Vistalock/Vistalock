import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const QUEUE_KEY = '@vistalock_offline_sales_queue';

export interface QueuedSale {
    id: string; // unique offline ID
    payload: any;
    timestamp: number;
    retryCount: number;
}

export const syncService = {
    /**
     * Get all pending sales from the queue
     */
    getQueue: async (): Promise<QueuedSale[]> => {
        try {
            const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
            if (!queueStr) return [];
            return JSON.parse(queueStr);
        } catch (error) {
            console.error('Error reading offline queue', error);
            return [];
        }
    },

    /**
     * Add a failed sale to the offline queue
     */
    enqueueSale: async (payload: any): Promise<void> => {
        try {
            const queue = await syncService.getQueue();
            const newSale: QueuedSale = {
                id: Date.now().toString() + Math.random().toString(36).substring(7),
                payload,
                timestamp: Date.now(),
                retryCount: 0
            };

            queue.push(newSale);
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
            console.log(`Sale ${newSale.id} queued for offline sync.`);
        } catch (error) {
            console.error('Error adding sale to queue', error);
        }
    },

    /**
     * Remove a specific sale from the queue
     */
    removeSale: async (id: string): Promise<void> => {
        try {
            const queue = await syncService.getQueue();
            const updatedQueue = queue.filter(item => item.id !== id);
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
        } catch (error) {
            console.error('Error removing sale from queue', error);
        }
    },

    /**
     * Attempt to sync all queued sales with the backend
     */
    flushQueue: async (): Promise<number> => {
        const queue = await syncService.getQueue();
        if (queue.length === 0) return 0;

        console.log(`Flushing ${queue.length} items from offline queue...`);
        let syncedCount = 0;
        let updatedQueue = [...queue];

        for (const item of queue) {
            try {
                // Attempt to send the payload to the API
                await api.post('/agents/sales/new', item.payload);

                // If successful, remove it from the updated queue
                updatedQueue = updatedQueue.filter(qItem => qItem.id !== item.id);
                syncedCount++;
                console.log(`Offline sale ${item.id} successfully synced.`);
            } catch (error: any) {
                console.error(`Failed to sync offline sale ${item.id}:`, error.message);

                // If the error is a 400 (Bad Request) or similar fatal business validation,
                // we might want to discard it or mark it as permanently failed.
                // For MVP, we'll increment the retry count.
                const failedItemIndex = updatedQueue.findIndex(qItem => qItem.id === item.id);
                if (failedItemIndex !== -1) {
                    updatedQueue[failedItemIndex].retryCount += 1;
                }
            }
        }

        // Save the updated queue back (items that failed will remain)
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));

        return syncedCount;
    }
};
