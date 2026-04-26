import React, { useMemo } from 'react'
import MainBlock from './MainBlock'
import { PuffsContainer } from './Background'

interface ComponentProps {}

const Home: React.FC<ComponentProps> = () => {
    return (
        <div>
            <MainBlock />
            <ArwesNote />
            {/* https://webkul.github.io/coolhue/ */}
        </div>
    )
}

const ArwesNote = () => {
    return (
        <div
            style={{
                position: 'absolute',
                bottom: 5,
                left: 0,
                right: 0,
                textAlign: 'right',
                color: '#489a9a',
                zIndex: 10,
                padding: 10,
                fontSize: 15,
            }}
        >
            <a href="https://arwes.dev/" rel="noreferrer">
                feat. Arwes
            </a>
        </div>
    )
}

export default Home
