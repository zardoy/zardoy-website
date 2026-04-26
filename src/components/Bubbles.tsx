/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/naming-convention */
'use client'

import { useEffect, useRef, useState } from 'react'
import MyProjects from './MyProjects'

interface Bubble {
    baseX: number
    baseY: number
    x: number
    y: number
    size: number
    rgb: { r: number; g: number; b: number }
    fillAlpha: number
    duration: number
    delay: number
    type: 0 | 1 | 2 | 3 | 4
    name: string
    textColor: string
}

// `color` paints the bubble; `textColor` is the readable tooltip color paired
// with that bubble. Pinks/yellows on a black canvas can be muddy if we just
// reuse the bubble color, so each entry gets a brighter, high-contrast tone.
const techStack = [
    {
        name: 'I drive technical excellence by identifying and reducing technical debt, establishing best practices, and implementing architectural revolutions.',
        color: 'rgba(59, 130, 246, 0.4)',
        textColor: '#93c5fd',
    },
    { name: 'Next.js', color: 'rgba(147, 51, 234, 0.4)', textColor: '#d8b4fe' },
    { name: 'React', color: 'rgba(236, 72, 153, 0.4)', textColor: '#f9a8d4' },
    { name: 'Prisma', color: 'rgba(34, 197, 94, 0.4)', textColor: '#86efac' },
    { name: 'Electron', color: 'rgba(251, 191, 36, 0.4)', textColor: '#fcd34d' },
    { name: 'RSBuild', color: 'rgba(239, 68, 68, 0.4)', textColor: '#fca5a5' },
    { name: 'Tailwind', color: 'rgba(20, 184, 166, 0.4)', textColor: '#5eead4' },
    { name: 'Pixi.js', color: 'rgba(168, 85, 247, 0.4)', textColor: '#c4b5fd' },
    { name: 'Node.js', color: 'rgba(99, 102, 241, 0.4)', textColor: '#a5b4fc' },
    { name: 'GraphQL', color: 'rgba(245, 101, 101, 0.4)', textColor: '#fda4af' },
    { name: 'Three.js', color: 'rgba(255, 206, 86, 0.4)', textColor: '#fde68a' },
]

const parseRGBA = (rgba: string): { r: number; g: number; b: number; a: number } => {
    const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(rgba)
    if (match) {
        return {
            r: Number(match[1]!),
            g: Number(match[2]!),
            b: Number(match[3]!),
            a: match[4] ? Number.parseFloat(match[4]) : 1,
        }
    }

    return { r: 255, g: 255, b: 255, a: 0.4 }
}

// Animation: returns offset from base position + scale.
// Bubbles are continuous (no pausing on hover) so the visual rhythm never stops.
const animateBubble = (b: Bubble, time: number) => {
    const t = ((time / 1000 - b.delay) / b.duration) % 1
    const phase = (t < 0 ? t + 1 : t) * Math.PI * 2

    switch (b.type) {
        case 0:
            return { dx: 0, dy: Math.sin(phase) * -25, scale: 1 + Math.sin(phase) * 0.025 }
        case 1:
            return { dx: Math.sin(phase) * 20, dy: 0, scale: 1 - Math.abs(Math.sin(phase)) * 0.025 }
        case 2:
            return { dx: Math.sin(phase * 2) * 30, dy: Math.cos(phase * 2) * 30, scale: 1 + Math.sin(phase * 4) * 0.05 }
        case 3:
            return { dx: Math.cos(phase) * 40, dy: Math.sin(phase) * 40, scale: 1 + Math.sin(phase * 2) * 0.05 }
        case 4:
            return { dx: Math.sin(phase) * 20, dy: Math.sin(phase * 2) * 30, scale: 1 + Math.abs(Math.sin(phase * 3)) * 0.05 }
        default:
            return { dx: 0, dy: 0, scale: 1 }
    }
}

// eslint-disable-next-line react/function-component-definition
export default function Component() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Refs for everything the render loop needs (avoids stale closures)
    const bubblesRef = useRef<Bubble[]>([])
    const hoveredIdxRef = useRef<number>(-1)
    // `x` / `y` are canvas-local coords, `clientX` / `clientY` are viewport
    // coords (kept so we can recompute canvas-local on scroll, since
    // `mousemove` doesn't fire while the user only scrolls).
    const mouseRef = useRef({ x: 0, y: 0, clientX: 0, clientY: 0, inside: false })
    const dprRef = useRef(1)
    const sizeRef = useRef({ w: 0, h: 0 })

    // React state only for things outside the canvas (tooltip)
    const [hoveredBubble, setHoveredBubble] = useState<Bubble | null>(null)
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

    const drawBubble = (ctx: CanvasRenderingContext2D, b: Bubble, time: number, isHovered: boolean) => {
        const { dx, dy, scale } = animateBubble(b, time)
        const x = b.baseX + dx
        const y = b.baseY + dy
        const radius = (b.size / 2) * scale

        b.x = x
        b.y = y

        const { r, g, b: bl } = b.rgb
        const fillAlpha = isHovered ? Math.min(1, b.fillAlpha + 0.25) : b.fillAlpha

        // 1) Soft outer glow behind the body. A radial gradient that starts at
        //    the bubble color near the edge and fades to fully transparent past
        //    the bubble, giving a smooth bloom without any inner artifact.
        const glowR = radius * (isHovered ? 2.6 : 2)
        const glow = ctx.createRadialGradient(x, y, radius * 0.85, x, y, glowR)
        glow.addColorStop(0, `rgba(${r}, ${g}, ${bl}, ${isHovered ? 0.35 : 0.22})`)
        glow.addColorStop(1, `rgba(${r}, ${g}, ${bl}, 0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, glowR, 0, Math.PI * 2)
        ctx.fill()

        // 2) Bubble body — flat solid color, no inner gradient, no border.
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${bl}, ${fillAlpha})`
        ctx.fill()
    }

    const drawCursor = (ctx: CanvasRenderingContext2D, x: number, y: number, isHovering: boolean) => {
        ctx.save()
        // Large soft glow halo
        if (!isHovering) {
            const halo = ctx.createRadialGradient(x, y, 0, x, y, 250)
            halo.addColorStop(0, 'rgba(50, 205, 50, 0.06)')
            halo.addColorStop(1, 'rgba(50, 205, 50, 0)')
            ctx.fillStyle = halo
            ctx.beginPath()
            ctx.arc(x, y, 250, 0, Math.PI * 2)
            ctx.fill()

            // Outer ring with blurry glow
            ctx.shadowColor = 'rgb(50, 205, 50)'
            ctx.shadowBlur = 15
            ctx.strokeStyle = 'rgba(50, 205, 50, 0.85)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(x, y, 40, 0, Math.PI * 2)
            ctx.stroke()
        }

        // Center dot with strong glow (always shown)
        ctx.shadowColor = 'rgb(50, 205, 50)'
        ctx.shadowBlur = 20
        ctx.fillStyle = 'rgb(50, 205, 50)'
        ctx.beginPath()
        ctx.arc(x, y, isHovering ? 5 : 7.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
    }

    const buildBubbles = (w: number, h: number) => {
        const list: Bubble[] = []
        const count = techStack.length * 3
        for (let i = 0; i < count; i++) {
            const tech = techStack[i % techStack.length]!
            const c = parseRGBA(tech.color)
            const baseX = (Math.random() * 0.9 + 0.05) * w
            const baseY = (Math.random() * 0.9 + 0.05) * h
            list.push({
                baseX,
                baseY,
                x: baseX,
                y: baseY,
                size: Math.random() * 100 + 30,
                rgb: { r: c.r, g: c.g, b: c.b },
                fillAlpha: c.a,
                duration: Math.random() * 15 + 10,
                delay: Math.random() * 5 + 1,
                type: Math.floor(Math.random() * 5) as 0 | 1 | 2 | 3 | 4,
                name: tech.name,
                textColor: tech.textColor,
            })
        }

        bubblesRef.current = list
    }

    // Recompute the canvas-local cursor position + hover/tooltip from the
    // last known viewport coordinates. Called from both `mousemove` and
    // window `scroll` (the latter doesn't dispatch `mousemove` even though
    // the cursor visually moves relative to the page).
    const updateFromViewport = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = clientX - rect.left
        const y = clientY - rect.top

        mouseRef.current.x = x
        mouseRef.current.y = y
        mouseRef.current.clientX = clientX
        mouseRef.current.clientY = clientY
        mouseRef.current.inside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom

        const bubbles = bubblesRef.current
        let foundIdx = -1
        if (mouseRef.current.inside) {
            for (let i = bubbles.length - 1; i >= 0; i--) {
                const b = bubbles[i]!
                const dx = x - b.x
                const dy = y - b.y
                if (dx * dx + dy * dy < (b.size / 2) ** 2) {
                    foundIdx = i
                    break
                }
            }
        }

        hoveredIdxRef.current = foundIdx

        const found = foundIdx >= 0 ? bubbles[foundIdx]! : null
        setHoveredBubble(prev => (prev === found ? prev : found))
        if (found) setTooltipPos({ x: clientX, y: clientY })
    }

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx) return

        const resize = () => {
            const rect = container.getBoundingClientRect()
            const w = rect.width
            const h = window.innerHeight
            const dpr = window.devicePixelRatio || 1
            dprRef.current = dpr
            sizeRef.current = { w, h }
            canvas.width = Math.round(w * dpr)
            canvas.height = Math.round(h * dpr)
            canvas.style.width = `${w}px`
            canvas.style.height = `${h}px`
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            buildBubbles(w, h)
        }

        resize()
        window.addEventListener('resize', resize)

        // Global mousemove — always keeps the viewport coords fresh even when
        // the cursor is outside the canvas. Without this, moving the cursor
        // away from the canvas then scrolling back would use a stale position.
        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current.clientX = e.clientX
            mouseRef.current.clientY = e.clientY
            updateFromViewport(e.clientX, e.clientY)
        }

        window.addEventListener('mousemove', onMouseMove, { passive: true })

        // Reuse last viewport coords on scroll so the cursor stays correct
        // even when the user only scrolls without moving the mouse.
        const onScroll = () => {
            updateFromViewport(mouseRef.current.clientX, mouseRef.current.clientY)
        }

        window.addEventListener('scroll', onScroll, { passive: true })

        let raf = 0
        const loop = (time: number) => {
            const { w, h } = sizeRef.current

            ctx.fillStyle = '#000000'
            ctx.fillRect(0, 0, w, h)

            const bubbles = bubblesRef.current
            const hoveredIdx = hoveredIdxRef.current
            for (const [i, bubble] of bubbles.entries()) {
                drawBubble(ctx, bubble, time, i === hoveredIdx)
            }

            if (mouseRef.current.inside) {
                drawCursor(ctx, mouseRef.current.x, mouseRef.current.y, hoveredIdx >= 0)
            }

            raf = requestAnimationFrame(loop)
        }

        raf = requestAnimationFrame(loop)

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('scroll', onScroll)
        }
    }, [])

    return (
        <div className="bg-black overflow-x-hidden">
            <div ref={containerRef} className="h-screen bg-black relative cursor-none overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 cursor-none"
                />

                {/* Title */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <h1
                        className="text-8xl md:text-9xl font-bold bg-gradient-to-r text-center from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none"
                        style={{ lineHeight: 1.2, paddingBottom: '0.15em' }}
                    >
                        meet my stack
                    </h1>
                </div>

                {/* Tooltip — bigger text in the bubble's own readable color.
                    Long descriptions wrap to multiple centered lines while the
                    font size stays the same as for short tech names. */}
                {hoveredBubble && (
                    <div
                        className="fixed pointer-events-none z-20 px-4 py-2 rounded-lg"
                        style={{
                            left: tooltipPos.x,
                            top: tooltipPos.y - 50,
                            transform: 'translateX(-50%)',
                            maxWidth: 'min(420px, 70vw)',
                        }}
                    >
                        <p
                            className="text-base md:text-lg font-semibold text-center leading-snug"
                            style={{
                                color: hoveredBubble.textColor,
                                textShadow: `0 0 18px ${hoveredBubble.textColor}66, 0 2px 8px rgba(0, 0, 0, 0.85)`,
                            }}
                        >
                            {hoveredBubble.name}
                        </p>
                    </div>
                )}
            </div>

            <MyProjects />
        </div>
    )
}
