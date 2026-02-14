'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'

interface Bubble {
    x: number
    y: number
    baseX: number
    baseY: number
    size: number
    color: string
    rgba: { r: number; g: number; b: number; a: number }
    animationDuration: number
    animationDelay: number
    animationType: 0 | 1 | 2 | 3 | 4
    name: string
    time: number
    isPaused: boolean
}

interface Project {
    name: string
    description: string
    link: string
    color: string
    years?: string
}

const techStack = [
    {
        name: 'I drive technical excellence by identifying and reducing technical debt, establishing best practices, and implementing architectural revolutions.',
        color: 'rgba(59, 130, 246, 0.4)',
    },
    { name: 'Next.js', color: 'rgba(147, 51, 234, 0.4)' },
    { name: 'React', color: 'rgba(236, 72, 153, 0.4)' },
    { name: 'Prisma', color: 'rgba(34, 197, 94, 0.4)' },
    { name: 'Electron', color: 'rgba(251, 191, 36, 0.4)' },
    { name: 'RSBuild', color: 'rgba(239, 68, 68, 0.4)' },
    { name: 'Tailwind', color: 'rgba(20, 184, 166, 0.4)' },
    { name: 'Vite', color: 'rgba(168, 85, 247, 0.4)' },
    { name: 'Node.js', color: 'rgba(99, 102, 241, 0.4)' },
    { name: 'GraphQL', color: 'rgba(245, 101, 101, 0.4)' },
    { name: 'Three.js', color: 'rgba(255, 206, 86, 0.4)' },
]

const projects: Project[] = [
    {
        name: 'AQUA PLAYER',
        description: 'my Electron project',
        link: 'https://aqua-player.zardoy.com',
        color: '#00CED1',
        years: '2023-2024',
    },
]

const parseRGBA = (rgba: string): { r: number; g: number; b: number; a: number } => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
    if (match) {
        return {
            r: parseInt(match[1]!),
            g: parseInt(match[2]!),
            b: parseInt(match[3]!),
            a: match[4] ? parseFloat(match[4]) : 1,
        }
    }
    return { r: 255, g: 255, b: 255, a: 0.4 }
}

// eslint-disable-next-line react/function-component-definition
export default function Component() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const bubblesRef = useRef<Bubble[]>([])
    const [hoveredBubble, setHoveredBubble] = useState<Bubble | null>(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isMouseInWindow, setIsMouseInWindow] = useState(false)
    const animationFrameRef = useRef<number>()

    // Animation functions
    const animateBubble = (bubble: Bubble, time: number): { x: number; y: number; scale: number } => {
        if (bubble.isPaused) {
            return { x: bubble.x, y: bubble.y, scale: 1 }
        }

        const t = ((time - bubble.animationDelay * 1000) / (bubble.animationDuration * 1000)) % 1
        if (t < 0) return { x: bubble.baseX, y: bubble.baseY, scale: 1 }

        const progress = t * Math.PI * 2

        switch (bubble.animationType) {
            case 0: // float-vertical
                return {
                    x: bubble.baseX,
                    y: bubble.baseY + Math.sin(progress) * -25,
                    scale: 1 + Math.sin(progress) * 0.025,
                }
            case 1: // float-horizontal
                return {
                    x: bubble.baseX + Math.sin(progress) * 20,
                    y: bubble.baseY,
                    scale: 1 - Math.abs(Math.sin(progress)) * 0.025,
                }
            case 2: // float-diagonal
                return {
                    x: bubble.baseX + Math.sin(progress * 2) * 30,
                    y: bubble.baseY + Math.cos(progress * 2) * 30,
                    scale: 1 + Math.sin(progress * 4) * 0.05,
                }
            case 3: // float-circular
                return {
                    x: bubble.baseX + Math.cos(progress) * 40,
                    y: bubble.baseY + Math.sin(progress) * 40,
                    scale: 1 + Math.sin(progress * 2) * 0.05,
                }
            case 4: // float-figure8
                return {
                    x: bubble.baseX + Math.sin(progress) * 20,
                    y: bubble.baseY + Math.sin(progress * 2) * 30,
                    scale: 1 + Math.abs(Math.sin(progress * 3)) * 0.05,
                }
            default:
                return { x: bubble.baseX, y: bubble.baseY, scale: 1 }
        }
    }

    const drawBubble = (ctx: CanvasRenderingContext2D, bubble: Bubble, isHovered: boolean) => {
        const { x, y, scale } = animateBubble(bubble, bubble.time)
        const radius = (bubble.size / 2) * scale

        ctx.save()

        // Glow effect
        const glowRadius = isHovered ? radius * 1.5 : radius / 3
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)
        gradient.addColorStop(0, `rgba(${bubble.rgba.r}, ${bubble.rgba.g}, ${bubble.rgba.b}, 0)`)
        gradient.addColorStop(1, `rgba(${bubble.rgba.r}, ${bubble.rgba.g}, ${bubble.rgba.b}, ${isHovered ? 0.3 : 0.1})`)
        ctx.fillStyle = gradient
        ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2)

        // Main bubble
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = bubble.color
        ctx.fill()

        // Border
        ctx.strokeStyle = isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'
        ctx.lineWidth = 1
        ctx.stroke()

        // Inner highlight
        const highlightGradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius)
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = highlightGradient
        ctx.fill()

        ctx.restore()

        // Update bubble position
        bubble.x = x
        bubble.y = y
    }

    const drawCursor = (ctx: CanvasRenderingContext2D, x: number, y: number, isHovering: boolean) => {
        ctx.save()

        if (!isHovering) {
            // Large glow
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 250)
            glowGradient.addColorStop(0, 'rgba(50, 205, 50, 0.03)')
            glowGradient.addColorStop(1, 'rgba(50, 205, 50, 0)')
            ctx.fillStyle = glowGradient
            ctx.fillRect(x - 250, y - 250, 500, 500)

            // Outer circle
            ctx.beginPath()
            ctx.arc(x, y, 40, 0, Math.PI * 2)
            ctx.strokeStyle = 'rgba(50, 205, 50, 0.8)'
            ctx.lineWidth = 2
            ctx.shadowColor = 'rgb(50, 205, 50)'
            ctx.shadowBlur = 15
            ctx.stroke()
        }

        // Inner dot
        ctx.beginPath()
        ctx.arc(x, y, 7.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgb(50, 205, 50)'
        ctx.shadowColor = 'rgb(50, 205, 50)'
        ctx.shadowBlur = 20
        ctx.fill()

        ctx.restore()
    }

    const render = (time: number) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx) return

        // Clear canvas
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Update bubble times
        bubblesRef.current.forEach(bubble => {
            bubble.time = time
        })

        // Draw bubbles
        bubblesRef.current.forEach(bubble => {
            drawBubble(ctx, bubble, hoveredBubble === bubble)
        })

        // Draw cursor
        if (isMouseInWindow) {
            drawCursor(ctx, mousePosition.x, mousePosition.y, hoveredBubble !== null)
        }

        animationFrameRef.current = requestAnimationFrame(render)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setMousePosition({ x, y })

        // Check if hovering over a bubble
        let foundBubble: Bubble | null = null
        for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
            const bubble = bubblesRef.current[i]!
            const dx = x - bubble.x
            const dy = y - bubble.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < bubble.size / 2) {
                foundBubble = bubble
                break
            }
        }

        // Update paused state
        bubblesRef.current.forEach(bubble => {
            bubble.isPaused = bubble === foundBubble
        })

        setHoveredBubble(foundBubble)
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        // Set canvas size
        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1
            canvas.width = window.innerWidth * dpr
            canvas.height = window.innerHeight * dpr
            canvas.style.width = `${window.innerWidth}px`
            canvas.style.height = `${window.innerHeight}px`

            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.scale(dpr, dpr)
            }

            // Regenerate bubbles on resize
            const bubbles: Bubble[] = []
            const bubbleCount = techStack.length * 3

            for (let i = 0; i < bubbleCount; i++) {
                const tech = techStack[i % techStack.length]!
                const baseX = (Math.random() * 0.9 + 0.05) * window.innerWidth
                const baseY = (Math.random() * 0.9 + 0.05) * window.innerHeight

                bubbles.push({
                    x: baseX,
                    y: baseY,
                    baseX,
                    baseY,
                    size: Math.random() * 100 + 30,
                    color: tech.color,
                    rgba: parseRGBA(tech.color),
                    animationDuration: Math.random() * 15 + 10,
                    animationDelay: Math.random() * 5 + 1,
                    animationType: Math.floor(Math.random() * 5) as 0 | 1 | 2 | 3 | 4,
                    name: tech.name,
                    time: 0,
                    isPaused: false,
                })
            }

            bubblesRef.current = bubbles
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Start animation
        animationFrameRef.current = requestAnimationFrame(render)

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [])

    // Update render when dependencies change
    useEffect(() => {
        // Trigger re-render
    }, [hoveredBubble, mousePosition, isMouseInWindow])

    return (
        <div className="min-h-screen bg-black relative cursor-none overflow-x-hidden">
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 cursor-none"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsMouseInWindow(true)}
                onMouseLeave={() => {
                    setIsMouseInWindow(false)
                    setHoveredBubble(null)
                    bubblesRef.current.forEach(b => (b.isPaused = false))
                }}
            />

            {/* Title */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r text-center from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
                    meet my stack
                </h1>
            </div>

            {/* Tooltip */}
            {hoveredBubble && (
                <div
                    className="fixed pointer-events-none z-20 px-3 py-2 rounded-lg"
                    style={{
                        left: mousePosition.x + 15,
                        top: mousePosition.y - 35,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <h1 className="text-sm font-medium" style={{ textShadow: 'rgba(224, 75, 176, 0.5) 0px 0px 35.8984px' }}>
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                            {hoveredBubble.name}
                        </span>
                    </h1>
                </div>
            )}

            {/* My Other Projects Section */}
            <div className="absolute bottom-0 left-0 right-0 bg-black z-10 py-8 px-4">
                <h2 className="text-4xl font-bold text-white text-center mb-6">my other projects</h2>
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map(project => (
                        <a
                            key={project.name}
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative p-6 rounded-lg border-2 transition-all duration-300 hover:scale-105"
                            style={{
                                borderColor: project.color,
                                backgroundColor: `${project.color}10`,
                            }}
                        >
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <h3
                                        className="text-2xl font-bold transition-colors"
                                        style={{
                                            color: project.color,
                                        }}
                                    >
                                        {project.name}
                                    </h3>
                                    {project.years && <span className="text-sm text-gray-400">{project.years}</span>}
                                </div>
                                <p className="text-gray-300 text-sm">{project.description}</p>
                            </div>
                            <div
                                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                                style={{
                                    background: `radial-gradient(circle at center, ${project.color}, transparent)`,
                                }}
                            />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}
