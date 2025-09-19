import { useState, useEffect, useRef, useCallback } from 'react'
import { Position, DragState } from '../types'

interface UseDraggableProps {
  initialPosition?: Position
  isOpen: boolean
}

export const useDraggable = ({
  initialPosition = { x: 0, y: 0 },
  isOpen
}: UseDraggableProps) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    position: initialPosition
  })

  const modalRef = useRef<HTMLDivElement>(null)

  // Center modal when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (modalRef.current) {
          const modal = modalRef.current
          const centerPosition = {
            x: window.innerWidth / 2 - modal.offsetWidth / 2,
            y: window.innerHeight / 2 - modal.offsetHeight / 2
          }
          setDragState(prev => ({
            ...prev,
            position: centerPosition
          }))
        }
      }, 10)
    }
  }, [isOpen])

  const startDrag = useCallback((e: React.MouseEvent) => {
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      dragStart: {
        x: e.clientX - prev.position.x,
        y: e.clientY - prev.position.y
      }
    }))
  }, [])

  const onDrag = useCallback((e: MouseEvent) => {
    setDragState(prev => {
      if (prev.isDragging) {
        return {
          ...prev,
          position: {
            x: e.clientX - prev.dragStart.x,
            y: e.clientY - prev.dragStart.y
          }
        }
      }
      return prev
    })
  }, [])

  const stopDrag = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      isDragging: false
    }))
  }, [])

  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', onDrag)
      window.addEventListener('mouseup', stopDrag)
    }

    return () => {
      window.removeEventListener('mousemove', onDrag)
      window.removeEventListener('mouseup', stopDrag)
    }
  }, [dragState.isDragging, onDrag, stopDrag])

  return {
    modalRef,
    position: dragState.position,
    isDragging: dragState.isDragging,
    startDrag
  }
}