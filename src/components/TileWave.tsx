import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface TileProps {
    index: number
}

const Tile: React.FC<TileProps> = ({ index }) => {
    return (
        <div
            className="tile"
            data-index={index}
            style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#1a1a2e',
                border: '2px solid #16213e',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#eee',
                fontWeight: 'bold',
                transform: 'scale(0) rotate(0deg)',
                opacity: 0,
            }}
        >
            {index + 1}
        </div>
    )
}

const TileWave: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [animationComplete, setAnimationComplete] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const timelineRef = useRef<gsap.core.Timeline | null>(null)

    // Random number of tiles (between 30 and 80)
    const numberOfTiles = useRef(Math.floor(Math.random() * 51) + 30).current
    
    // Calculate grid dimensions
    const cols = Math.ceil(Math.sqrt(numberOfTiles * 1.5))
    const rows = Math.ceil(numberOfTiles / cols)

    const startAnimation = () => {
        if (!containerRef.current) return

        setIsAnimating(true)
        setAnimationComplete(false)

        const tiles = containerRef.current.querySelectorAll('.tile')

        // Kill any existing animations
        if (timelineRef.current) {
            timelineRef.current.kill()
        }

        // Reset all tiles
        gsap.set(tiles, {
            scale: 0,
            opacity: 0,
            rotation: 0,
            backgroundColor: '#1a1a2e',
        })

        // Create a master timeline
        const tl = gsap.timeline({
            onComplete: () => {
                setAnimationComplete(true)
                setIsAnimating(false)
            },
        })

        timelineRef.current = tl

        // Main wave animation - stagger based on grid position for diagonal wave
        tl.to(tiles, {
            scale: 1,
            opacity: 1,
            rotation: 360,
            duration: 0.6,
            ease: 'back.out(1.7)',
            stagger: {
                // This creates the diagonal wave from top-left
                amount: 2.5, // Total time for stagger
                from: 'start',
                grid: [rows, cols],
                axis: null, // null means diagonal
            },
        })

        // Color wave effect - follows after scale
        tl.to(
            tiles,
            {
                backgroundColor: '#0f3460',
                duration: 0.4,
                ease: 'power2.inOut',
                stagger: {
                    amount: 2,
                    from: 'start',
                    grid: [rows, cols],
                    axis: null,
                },
            },
            '-=2', // Start before previous animation finishes
        )

        // Secondary color wave
        tl.to(
            tiles,
            {
                backgroundColor: '#e94560',
                duration: 0.5,
                ease: 'power2.inOut',
                stagger: {
                    amount: 1.5,
                    from: 'start',
                    grid: [rows, cols],
                    axis: null,
                },
            },
            '-=1.5',
        )

        // Final settle with subtle bounce
        tl.to(tiles, {
            backgroundColor: '#16213e',
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out',
            stagger: {
                amount: 1,
                from: 'start',
                grid: [rows, cols],
                axis: null,
            },
        })

        tl.to(tiles, {
            scale: 1,
            duration: 0.2,
            ease: 'elastic.out(1, 0.3)',
            stagger: {
                amount: 0.5,
                from: 'start',
                grid: [rows, cols],
                axis: null,
            },
        })
    }

    useEffect(() => {
        // Auto-start animation on mount
        const timer = setTimeout(() => {
            startAnimation()
        }, 500)

        return () => {
            clearTimeout(timer)
            if (timelineRef.current) {
                timelineRef.current.kill()
            }
        }
    }, [])

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#0f0e17',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                position: 'relative',
                overflow: 'auto',
            }}
        >
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1
                    style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: '#fffffe',
                        marginBottom: '10px',
                        textShadow: '0 0 20px rgba(233, 69, 96, 0.5)',
                    }}
                >
                    GSAP Tile Wave Animation
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#a7a9be', marginBottom: '20px' }}>
                    {numberOfTiles} tiles • Diagonal wave effect from top-left
                </p>
                <button
                    onClick={startAnimation}
                    disabled={isAnimating}
                    style={{
                        padding: '12px 32px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        backgroundColor: isAnimating ? '#555' : '#e94560',
                        color: '#fffffe',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isAnimating ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: isAnimating ? 'none' : '0 4px 20px rgba(233, 69, 96, 0.4)',
                    }}
                >
                    {isAnimating ? 'Animating...' : 'Replay Animation'}
                </button>
            </div>

            <div
                ref={containerRef}
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 80px)`,
                    gap: '12px',
                    marginBottom: '40px',
                }}
            >
                {Array.from({ length: numberOfTiles }, (_, i) => (
                    <Tile key={i} index={i} />
                ))}
            </div>

            {animationComplete && (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(233, 69, 96, 0.95)',
                        color: '#fffffe',
                        padding: '30px 60px',
                        borderRadius: '16px',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                        animation: 'fadeInScale 0.5s ease-out',
                        zIndex: 1000,
                    }}
                >
                    🎉 Animation Complete! 🎉
                </div>
            )}

            <style>{`
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
            `}</style>

            <div
                style={{
                    marginTop: '40px',
                    padding: '30px',
                    backgroundColor: '#1a1a2e',
                    borderRadius: '12px',
                    maxWidth: '800px',
                    color: '#a7a9be',
                }}
            >
                <h2 style={{ color: '#fffffe', marginBottom: '15px', fontSize: '1.5rem' }}>🚀 Why GSAP?</h2>
                <ul style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                    <li>
                        <strong style={{ color: '#e94560' }}>Timeline System:</strong> Declarative JSX with imperative animation control
                    </li>
                    <li>
                        <strong style={{ color: '#e94560' }}>Stagger Grid:</strong> Built-in grid stagger for perfect wave effects
                    </li>
                    <li>
                        <strong style={{ color: '#e94560' }}>Performance:</strong> Hardware-accelerated, 60fps animations
                    </li>
                    <li>
                        <strong style={{ color: '#e94560' }}>Complex Timelines:</strong> Easy sequencing with overlap (see <code>-=</code> syntax)
                    </li>
                    <li>
                        <strong style={{ color: '#e94560' }}>Callbacks:</strong> onComplete, onUpdate for state management
                    </li>
                    <li>
                        <strong style={{ color: '#e94560' }}>Scalability:</strong> Works with any number of elements efficiently
                    </li>
                </ul>

                <div style={{ marginTop: '25px', padding: '20px', backgroundColor: '#16213e', borderRadius: '8px' }}>
                    <h3 style={{ color: '#fffffe', marginBottom: '10px' }}>💡 Key Features Demo:</h3>
                    <ul style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
                        <li>✅ Random number of tiles (30-80)</li>
                        <li>✅ Diagonal wave from top-left using grid stagger</li>
                        <li>✅ Multiple sequential animations on timeline</li>
                        <li>✅ Overlapping animations for smooth flow</li>
                        <li>✅ Completion callback triggers message</li>
                        <li>✅ Clean React integration with hooks</li>
                        <li>✅ Replay functionality with state management</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default TileWave
