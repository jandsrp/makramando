
import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    className?: string;
    delay?: number;
}

export const Reveal: React.FC<RevealProps> = ({
    children,
    width = "100%",
    className = "",
    delay = 0
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1,
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            style={{
                position: 'relative',
                width,
                overflow: 'visible'
            }}
            className={`${className} ${isVisible ? 'reveal-visible' : 'reveal-hidden'}`}
        >
            <div
                style={{
                    transitionDelay: `${delay}s`,
                }}
                className="reveal-content"
            >
                {children}
            </div>
        </div>
    );
};
