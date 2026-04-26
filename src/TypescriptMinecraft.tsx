/* eslint-disable unicorn/prefer-switch */
'use client'

import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useCamera, Stats } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls'
import { motion } from 'framer-motion'
import { FaGamepad, FaCube } from 'react-icons/fa'

const isMobile = () => {
    if (typeof window === 'undefined') return false
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)
}

// Custom OrbitControls that only zooms with Shift+Wheel and disables touch on mobile
const CustomOrbitControls = ({ orbitControlsRef, ...props }) => {
    const { camera, gl } = useThree()

    useEffect(() => {
        if (!orbitControlsRef.current) return

        const controls = orbitControlsRef.current

        // Override the wheel event handler
        const handleWheel = event => {
            if (event.shiftKey) {
                // Allow normal zoom behavior when shift is held
            } else {
                // Prevent zoom and allow page scroll
                event.preventDefault = () => {} // Disable preventDefault
                event.stopPropagation()
                return false
            }

            return
        }

        // Add custom wheel listener
        gl.domElement.addEventListener('wheel', handleWheel, { passive: false })

        return () => {
            gl.domElement.removeEventListener('wheel', handleWheel)
        }
    }, [gl, orbitControlsRef])

    return <OrbitControls ref={orbitControlsRef} {...props} />
}

// Color palettes used by the two stacked words. Each word can have its own
// fill, emissive and edge colors.
const COLORS = {
    typescript: { fill: '#00d4ff', emissive: '#0088cc', edge: '#00ffff' },
    minecraft: { fill: '#7CFC00', emissive: '#39c000', edge: '#b6ff5c' },
} as const

const BoxWithEdges = ({ position, colors = COLORS.typescript }: { position: [number, number, number]; colors?: { fill: string; emissive: string; edge: string } }) => {
    return (
        <group position={position}>
            <mesh>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshPhysicalMaterial
                    transparent
                    color={colors.fill}
                    roughness={0.1}
                    metalness={0.2}
                    opacity={0.9}
                    transmission={0.3}
                    clearcoat={1}
                    emissive={colors.emissive}
                    emissiveIntensity={0.5}
                />
            </mesh>
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(0.5, 0.5, 0.5)]} />
                <lineBasicMaterial color={colors.edge} linewidth={3} />
            </lineSegments>
        </group>
    )
}

// Letter shapes. Most letters use the default `j * 0.5 - 1` column placement;
// N and X have custom per-column offsets defined in CUSTOM_COLUMN_OFFSETS.
// All letters are auto-centered around x=0 inside `BoxLetter`.
const LETTER_SHAPES: Record<string, number[][]> = {
    N: [
        [1, 0, 0, 0, 1],
        [1, 1, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 1, 1],
        [1, 0, 0, 0, 1],
    ],
    E: [
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 0],
        [1, 0, 0],
        [1, 1, 1],
    ],
    X: [
        [1, 0, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1],
    ],
    T: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
    ],
    S: [
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
        [1, 1, 1],
    ],
    C: [
        [1, 1, 1],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0],
        [1, 1, 1],
    ],
    R: [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 0],
        [1, 0, 1],
        [1, 0, 1],
    ],
    Y: [
        [1, 0, 1],
        [1, 0, 1],
        [1, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
    ],
    P: [
        [1, 1, 1, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 1, 1, 0, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0],
    ],
    O: [
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [0, 1, 1, 1, 0],
    ],
    I: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 1],
    ],
    M: [
        [1, 0, 0, 0, 1],
        [1, 1, 0, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
    ],
    // 4-block-wide A (4 columns total → 2 blocks visual width on each side of center)
    A: [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
    ],
    F: [
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 0],
        [1, 0, 0],
        [1, 0, 0],
    ],
}

// Letters whose columns aren't placed on the regular `j * 0.5 - 1` grid.
const CUSTOM_COLUMN_OFFSETS: Record<string, number[]> = {
    N: [-0.5, 0, 0.25, 0.5, 1],
    X: [-1, -0.75, -0.25, 0.25, 0.5],
}

// Returns each letter's visual width in world units (max-cell - min-cell + 1 cell).
// Computed once per process.
const LETTER_VISUAL_WIDTH: Record<string, number> = (() => {
    const widths: Record<string, number> = {}
    for (const [letter, shape] of Object.entries(LETTER_SHAPES)) {
        const xs: number[] = []
        for (const row of shape) {
            for (let j = 0; j < row.length; j++) {
                if (!row[j]) continue
                const x = CUSTOM_COLUMN_OFFSETS[letter]?.[j] ?? j * 0.5 - 1
                xs.push(x)
            }
        }
        const min = Math.min(...xs)
        const max = Math.max(...xs)
        widths[letter] = max - min + 0.5 // +0.5 = block size
    }
    return widths
})()

const BoxLetter = ({
    letter,
    position,
    colors,
}: {
    letter: string
    position: [number, number, number]
    colors?: { fill: string; emissive: string; edge: string }
}) => {
    const group = useRef<THREE.Group>(null)
    const shape = LETTER_SHAPES[letter] ?? LETTER_SHAPES.N!
    const customCols = CUSTOM_COLUMN_OFFSETS[letter]

    // Collect every active cell, then auto-center the letter glyph horizontally
    // so 3-col / 4-col / 5-col / N / X letters all share the same anchor point.
    const cells: { i: number; x: number }[] = []
    shape.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (!cell) return
            const x = customCols?.[j] ?? j * 0.5 - 1
            cells.push({ i, x })
        })
    })
    const minX = Math.min(...cells.map(c => c.x))
    const maxX = Math.max(...cells.map(c => c.x))
    const midX = (minX + maxX) / 2

    return (
        <group ref={group} position={position}>
            {cells.map((c, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <BoxWithEdges key={idx} position={[c.x - midX, (4 - c.i) * 0.5 - 1, 0]} colors={colors} />
            ))}
        </group>
    )
}

// Renders a word with each letter centered, then advances by the letter's
// actual visual width plus a constant `gap`. This keeps narrow letters (I, T)
// from looking too far apart while wide ones (M, N) stay readable.
// `wordGaps` maps letter index → extra gap to insert *after* that letter,
// useful for adding a visible space between words in a single string
// (e.g. index 1 in "INTYPESCRIPT" → gap after the N → "IN  TYPESCRIPT").
const WordOfBoxes = ({
    word,
    y,
    scale,
    gap,
    colors,
    wordGaps,
}: {
    word: string
    y: number
    scale: number
    gap: number
    colors: { fill: string; emissive: string; edge: string }
    wordGaps?: Record<number, number>
}) => {
    const widths = [...word].map(l => LETTER_VISUAL_WIDTH[l] ?? 1.5)
    const extraGaps = wordGaps ?? {}
    const total = widths.reduce((s, w, i) => s + w + (i < widths.length - 1 ? gap + (extraGaps[i] ?? 0) : 0), 0)
    let cursor = -total / 2
    const positions = widths.map((w, i) => {
        const center = cursor + w / 2
        cursor += w + gap + (extraGaps[i] ?? 0)
        return center
    })

    return (
        <group position={[0, y, 0]} scale={[scale, scale, scale]}>
            {[...word].map((letter, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <BoxLetter key={`${letter}-${i}`} letter={letter} position={[positions[i]!, 0, 0]} colors={colors} />
            ))}
        </group>
    )
}

const NARROW_VIEWPORT_PX = 400
// Viewports narrower than this shrink both 3D words to ~1.5× smaller (÷1.5)
const NARROW_TEXT_SCALE = 1 / 1.5

const Scene = () => {
    const orbitControlsRef = useRef<OrbitControlsImpl>(null)
    const isMobileDevice = isMobile()
    const camera = useThree(state => {
        return state.camera
    })
    const [textRotationY, setTextRotationY] = useState(THREE.MathUtils.degToRad(-45))
    const containerRef = useRef<HTMLDivElement>(null)
    const [isNarrowViewport, setIsNarrowViewport] = useState(
        () => typeof window !== 'undefined' && window.innerWidth < NARROW_VIEWPORT_PX,
    )

    useEffect(() => {
        if (orbitControlsRef.current) {
            camera.rotation.y = THREE.MathUtils.degToRad(-45)
            //@ts-expect-error idk how to set properly
            orbitControlsRef.current.setAzimuthalAngle(THREE.MathUtils.degToRad(-25))
            //@ts-expect-error idk how to set properly
            orbitControlsRef.current.setPolarAngle(THREE.MathUtils.degToRad(105))
            orbitControlsRef.current.update()
        }
    }, [])

    useEffect(() => {
        const onResize = () => {
            if (typeof window === 'undefined') return
            setIsNarrowViewport(window.innerWidth < NARROW_VIEWPORT_PX)
        }
        onResize()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const narrowTextMul = isNarrowViewport ? NARROW_TEXT_SCALE : 1

    return (
        <>
            {/* Stack: MINECRAFT (lime-green, primary) on top, IN TYPESCRIPT
                (smaller, tighter) underneath. Both rotate together. */}
            <group position={[-0.5, 0.8, 0]} rotation={[0, textRotationY, 0]}>
                <WordOfBoxes
                    word="MINECRAFT"
                    y={1.8}
                    scale={1.0 * narrowTextMul}
                    gap={0.35}
                    colors={COLORS.minecraft}
                />
                <WordOfBoxes
                    word="INTYPESCRIPT"
                    y={-0.6}
                    scale={0.6 * narrowTextMul}
                    gap={0.2}
                    colors={COLORS.typescript}
                    wordGaps={{ 1: 0.6 }}
                />
            </group>
            <CustomOrbitControls
                enableZoom
                enablePan
                enableRotate
                autoRotate
                orbitControlsRef={orbitControlsRef}
                autoRotateSpeed={1}
                target={[0, 0, 0]}
                minDistance={3}
                maxDistance={22}
            />

            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
            <pointLight position={[0, 0, 5]} intensity={1} color="#00d4ff" />
            <pointLight position={[0, 0, -5]} intensity={0.5} color="#0088cc" />

            <Environment background files={isMobileDevice ? `pano-mobile.jpeg` : `pano.jpeg`} />
        </>
    )
}

// Minecraft-style Play Now Button
const PlayNowButton = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="translate-y-32 pointer-events-auto">
                <button onClick={() => window.open("https://mcraft.fun")} className="py-5 px-16 bg-blue-900/80 text-blue-300 font-mono uppercase tracking-wider rounded relative overflow-hidden group hover:bg-blue-800/75 transition-all duration-300 border border-blue-400">
                    <FaGamepad className="inline-block w-6 h-6 mr-3" />
                    <span className="text-xl font-bold">PLAY NOW</span>
                    <div className="absolute right-0 top-0 w-0 h-full bg-blue-400/30 group-hover:w-full transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <div className="absolute inset-0 border-2 border-blue-400 rounded opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300" />
                </button>
            </div>
        </div>
    )
}

// Add this to your global CSS or in a style tag in your component
const scanAnimation = `
@keyframes scan {
  0% {
    transform: translateX(-100%) skewX(-12deg);
  }
  100% {
    transform: translateX(200%) skewX(-12deg);
  }
}
`

// eslint-disable-next-line react/function-component-definition
export default function Component() {
    const containerRef = useRef<HTMLDivElement>(null)
    // Latches to true the first time the scene crosses the 20% visibility
    // threshold. Once mounted, the Three.js Canvas is kept in the React tree
    // forever so its WebGL context, geometries and textures stay cached.
    const [hasMounted, setHasMounted] = useState(false)
    // Reflects whether the scene is currently visible. Drives `frameloop` so
    // the renderer pauses (no draw calls) when the user scrolls away and
    // resumes from the cached state when they scroll back.
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Add the animation to the document
        const style = document.createElement('style')
        style.textContent = scanAnimation
        document.head.append(style)
        return () => style.remove()
    }, [])

    useEffect(() => {
        if (!containerRef.current) return

        const observer = new IntersectionObserver(
            entries => {
                const entry = entries[0]
                if (!entry) return
                const visible = entry.intersectionRatio >= 0.2
                setIsVisible(visible)
                if (visible) setHasMounted(true)
            },
            // Multiple thresholds so we get an update both at 20% in and 20% out
            { threshold: [0, 0.2, 0.5, 1] },
        )

        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    const mobile = isMobile()

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-gray-900">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: hasMounted && isVisible ? 1 : 0 }}
                transition={{ duration: 3, ease: 'easeInOut' }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
            >
                {hasMounted && (
                    <Canvas
                        camera={{
                            position: [15, 2, 0],
                            fov: 60,
                        }}
                        // "always" while visible, "never" while offscreen so the
                        // renderer is fully idle without losing state.
                        frameloop={isVisible ? 'always' : 'never'}
                        style={{
                            pointerEvents: mobile || !isVisible ? 'none' : 'auto',
                        }}
                    >
                        <Scene />
                        {/* GL Stats for development */}
                        {import.meta.env.DEV && <Stats />}
                    </Canvas>
                )}
            </motion.div>
            <PlayNowButton />

            {/* Instructions overlay - only show on desktop */}
            {!mobile && (
                <div className="absolute bottom-4 left-4 text-white/70 text-sm">
                    Hold <kbd className="px-2 py-1 bg-white/20 rounded">Shift</kbd> + scroll to zoom
                </div>
            )}
        </div>
    )
}
