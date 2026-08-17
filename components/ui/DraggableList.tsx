'use client';

import { useRef } from 'react';

interface DraggableListProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}

export function DraggableList({ children, className = '', innerClassName = '' }: DraggableListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Use refs for math and tracking to guarantee 60fps without waiting for React state
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasDragged.current = false; // Reset drag status
    if (scrollRef.current) {
      startX.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeft.current = scrollRef.current.scrollLeft;
      // Disable CSS smooth scrolling instantly so it doesn't lag behind the mouse
      scrollRef.current.style.scrollBehavior = 'auto';
    }
  };

  const stopDragging = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = '';
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    
    // Only register as a "drag" if they move the mouse more than a few pixels
    const x = e.pageX - scrollRef.current.offsetLeft;
    if (Math.abs(x - startX.current) > 5) {
      hasDragged.current = true;
    }
    
    const walk = (x - startX.current) * 1.5; // Slightly lower multiplier feels heavier and more premium
    
    // requestAnimationFrame ensures the DOM updates perfectly in sync with the monitor's refresh rate
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
      }
    });
  };

  const onClickCapture = (e: React.MouseEvent) => {
    // If the user actually dragged the list, prevent the click event from firing on child links
    if (hasDragged.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={onMouseDown}
      onMouseLeave={stopDragging}
      onMouseUp={stopDragging}
      onMouseMove={onMouseMove}
      onClickCapture={onClickCapture}
      className={`flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] select-none cursor-grab active:cursor-grabbing ${className}`}
    >
      <div 
        className={`flex w-max ${innerClassName}`}
        onDragStart={(e) => e.preventDefault()} // Prevent native drag events
      >
        {children}
      </div>
    </div>
  );
}
