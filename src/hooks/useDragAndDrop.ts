import { useState, useRef, useCallback } from 'react';
import { useHapticFeedback } from './useHapticFeedback';

export interface DragState {
  isDragging: boolean;
  draggedId: string | null;
  draggedType: 'player' | 'team' | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  longPressTimer: NodeJS.Timeout | null;
}

export const useDragAndDrop = () => {
  const { triggerImpact, triggerSelection } = useHapticFeedback();
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedId: null,
    draggedType: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    longPressTimer: null,
  });

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent, id: string, type: 'player' | 'team') => {
    const touch = e.touches[0];
    
    // Clear any existing timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // Set up long press detection (500ms)
    longPressTimerRef.current = setTimeout(() => {
      triggerImpact('medium');
      setDragState({
        isDragging: true,
        draggedId: id,
        draggedType: type,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        longPressTimer: null,
      });
    }, 500);

    setDragState(prev => ({
      ...prev,
      startX: touch.clientX,
      startY: touch.clientY,
      longPressTimer: longPressTimerRef.current,
    }));
  }, [triggerImpact]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    // Cancel long press if moved too much before timer completes
    if (!dragState.isDragging && longPressTimerRef.current) {
      const deltaX = Math.abs(touch.clientX - dragState.startX);
      const deltaY = Math.abs(touch.clientY - dragState.startY);
      
      if (deltaX > 10 || deltaY > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    if (dragState.isDragging) {
      setDragState(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
      }));
    }
  }, [dragState.isDragging, dragState.startX, dragState.startY]);

  const handleTouchEnd = useCallback((onDrop?: (draggedId: string, targetId: string) => void, targetId?: string) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (dragState.isDragging && dragState.draggedId && targetId && onDrop) {
      triggerSelection();
      onDrop(dragState.draggedId, targetId);
    }

    setDragState({
      isDragging: false,
      draggedId: null,
      draggedType: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      longPressTimer: null,
    });
  }, [dragState.isDragging, dragState.draggedId, triggerSelection]);

  return {
    dragState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
