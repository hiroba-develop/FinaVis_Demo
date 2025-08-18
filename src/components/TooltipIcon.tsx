import React, { useState, useRef, useLayoutEffect } from 'react';

const TooltipIcon: React.FC<{ text: string }> = ({ text }) => {
    const [positionClass, setPositionClass] = useState('left-1/2 -translate-x-1/2');
    const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({ left: '50%', transform: 'translateX(-50%)' });
    const containerRef = useRef<HTMLSpanElement>(null);

    const calculatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const tooltipWidth = 256; // w-64 is 16rem = 256px
            const iconWidth = rect.width;
            const centerOfIcon = rect.left + iconWidth / 2;

            // Check for left overflow
            if (centerOfIcon < tooltipWidth / 2) {
                setPositionClass('left-0');
                setArrowStyle({ left: `${iconWidth / 2}px`, transform: 'translateX(-50%)' });
            }
            // Check for right overflow
            else if (window.innerWidth - centerOfIcon < tooltipWidth / 2) {
                setPositionClass('right-0');
                setArrowStyle({ left: `${tooltipWidth - (iconWidth / 2)}px`, transform: 'translateX(-50%)' });
            }
            // Centered
            else {
                setPositionClass('left-1/2 -translate-x-1/2');
                setArrowStyle({ left: '50%', transform: 'translateX(-50%)' });
            }
        }
    };

    useLayoutEffect(() => {
        calculatePosition();
        window.addEventListener('resize', calculatePosition);
        return () => window.removeEventListener('resize', calculatePosition);
    }, []);

    return (
        <span className="group relative ml-2 flex items-center justify-center" ref={containerRef}>
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-400 text-white text-xs font-bold cursor-pointer">
                ?
            </div>
            <span
                className={`absolute bottom-full mb-2 w-64 p-3 text-sm text-white bg-gray-800 rounded-md shadow-lg
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none
                           ${positionClass}`}
            >
                {text}
                <svg
                    className="absolute text-gray-800 h-2 top-full"
                    style={arrowStyle}
                    viewBox="0 0 255 255"
                    xmlSpace="preserve"
                >
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                </svg>
            </span>
        </span>
    );
};

export default TooltipIcon;
