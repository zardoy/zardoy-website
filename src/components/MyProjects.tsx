'use client'

interface Project {
    name: string
    description: string
    link: string
    color: string
    years?: string
}

const projects: Project[] = [
    {
        name: 'AQUA PLAYER',
        description: 'my Electron project',
        link: 'https://aqua-player.zardoy.com',
        color: '#00CED1',
        years: '2023-2024',
    },
]

// eslint-disable-next-line react/function-component-definition
export default function MyProjects() {
    return (
        <section className="relative bg-black py-16 px-4 overflow-hidden">
            {/* Watermark-style title that fades to the right with a neon blue gradient */}
            <h2
                className="relative -ml-1 md:-ml-3 max-w-4xl select-none pointer-events-none font-extrabold tracking-tight text-balance"
                style={{
                    fontSize: 'clamp(1.25rem, 3.5vw, 2.25rem)',
                    lineHeight: 1.2,
                    paddingBottom: '0.12em',
                    backgroundImage:
                        'linear-gradient(90deg, rgba(125, 249, 255, 0.95) 0%, rgba(56, 189, 248, 0.85) 25%, rgba(59, 130, 246, 0.55) 55%, rgba(59, 130, 246, 0.18) 80%, rgba(59, 130, 246, 0) 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.25)) drop-shadow(0 0 24px rgba(125, 249, 255, 0.1))',
                }}
            >
                Some of my other projects
            </h2>

            <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
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
                                    style={{ color: project.color }}
                                >
                                    {project.name}
                                </h3>
                                {project.years && <span className="text-sm text-gray-400">{project.years}</span>}
                            </div>
                            <p className="text-gray-300 text-sm">{project.description}</p>
                        </div>
                        <div
                            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                            style={{
                                background: `radial-gradient(circle at center, ${project.color}, transparent)`,
                            }}
                        />
                    </a>
                ))}
            </div>
        </section>
    )
}
