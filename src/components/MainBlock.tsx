import React, { useRef, useState, useEffect } from 'react'
import TypescriptMinecraft from '../TypescriptMinecraft'
import Circles from './Circles'
import Bubbles from './Bubbles'
import ScrollDown from './ScrollDown'
import { PuffsContainer } from './Background'

const MainBlock: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(true)

    // Intersection Observer for visibility optimization
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const entry = entries[0]
                if (entry) {
                    setIsVisible(entry.isIntersecting)
                }
            },
            { threshold: 0.1 },
        )

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <div>
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100dvh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10,
                }}
            >
                <Circles />
                <ScrollDown />
                {isVisible && <PuffsContainer />}
            </div>
            <Bubbles />
            <TypescriptMinecraft />
        </div>
    )
}

export default MainBlock
