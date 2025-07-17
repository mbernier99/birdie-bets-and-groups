import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface OfflineData {
  shots: any[];
  scores: any[];
  pressBets: any[];
  courseData: any;
  lastSync: number;
}

interface QueuedOperation {
  id: string;
  type: 'shot' | 'score' | 'press_bet';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  roundId?: string;
}

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<QueuedOperation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load queued operations from localStorage
    loadSyncQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadSyncQueue = () => {
    try {
      const saved = localStorage.getItem('sync-queue');
      if (saved) {
        setSyncQueue(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  };

  const saveSyncQueue = (queue: QueuedOperation[]) => {
    try {
      localStorage.setItem('sync-queue', JSON.stringify(queue));
      setSyncQueue(queue);
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  };

  const addToSyncQueue = (operation: Omit<QueuedOperation, 'id' | 'timestamp'>) => {
    const newOperation: QueuedOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now()
    };

    const updatedQueue = [...syncQueue, newOperation];
    saveSyncQueue(updatedQueue);

    // If online, attempt immediate sync
    if (isOnline) {
      syncOfflineData();
    }
  };

  const saveOfflineData = (key: keyof OfflineData, data: any) => {
    try {
      const existing = getOfflineData();
      const updated = {
        ...existing,
        [key]: data,
        lastSync: Date.now()
      };
      localStorage.setItem('offline-golf-data', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  };

  const getOfflineData = (): OfflineData => {
    try {
      const saved = localStorage.getItem('offline-golf-data');
      return saved ? JSON.parse(saved) : {
        shots: [],
        scores: [],
        pressBets: [],
        courseData: null,
        lastSync: 0
      };
    } catch (error) {
      console.error('Error loading offline data:', error);
      return {
        shots: [],
        scores: [],
        pressBets: [],
        courseData: null,
        lastSync: 0
      };
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline || isSyncing || syncQueue.length === 0 || !user) return;

    setIsSyncing(true);
    const successful: string[] = [];
    const failed: QueuedOperation[] = [];

    try {
      for (const operation of syncQueue) {
        try {
          await syncSingleOperation(operation);
          successful.push(operation.id);
        } catch (error) {
          console.error('Error syncing operation:', operation, error);
          failed.push(operation);
        }
      }

      // Remove successful operations from queue
      const remainingQueue = syncQueue.filter(op => !successful.includes(op.id));
      saveSyncQueue(remainingQueue);

      if (successful.length > 0) {
        toast({
          title: "Data Synced",
          description: `Successfully synced ${successful.length} offline operations.`
        });
      }

      if (failed.length > 0) {
        toast({
          title: "Partial Sync",
          description: `${failed.length} operations failed to sync. Will retry when online.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncSingleOperation = async (operation: QueuedOperation) => {
    switch (operation.type) {
      case 'shot':
        return await syncShot(operation);
      case 'score':
        return await syncScore(operation);
      case 'press_bet':
        return await syncPressBet(operation);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  };

  const syncShot = async (operation: QueuedOperation) => {
    if (operation.operation === 'create') {
      const { error } = await supabase
        .from('shots')
        .insert(operation.data);
      if (error) throw error;
    }
    // Add update/delete operations as needed
  };

  const syncScore = async (operation: QueuedOperation) => {
    if (operation.operation === 'create') {
      const { error } = await supabase
        .from('hole_scores')
        .insert(operation.data);
      if (error) throw error;
    }
    // Add update/delete operations as needed
  };

  const syncPressBet = async (operation: QueuedOperation) => {
    if (operation.operation === 'create') {
      const { error } = await supabase
        .from('press_bets')
        .insert(operation.data);
      if (error) throw error;
    } else if (operation.operation === 'update') {
      const { error } = await supabase
        .from('press_bets')
        .update(operation.data.updates)
        .eq('id', operation.data.id);
      if (error) throw error;
    }
  };

  const preloadCourseData = async (courseId: string) => {
    try {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      const { data: holes, error: holesError } = await supabase
        .from('holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');

      if (holesError) throw holesError;

      const courseData = {
        ...course,
        holes
      };

      saveOfflineData('courseData', courseData);
      
      toast({
        title: "Course Data Cached",
        description: "Course information is now available offline."
      });

      return courseData;
    } catch (error) {
      console.error('Error preloading course data:', error);
      throw error;
    }
  };

  const getQueuedOperationsCount = () => syncQueue.length;

  return {
    isOnline,
    isSyncing,
    syncQueue: syncQueue.length,
    addToSyncQueue,
    saveOfflineData,
    getOfflineData,
    syncOfflineData,
    preloadCourseData,
    getQueuedOperationsCount
  };
};