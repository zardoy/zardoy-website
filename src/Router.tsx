import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './components/Home'
import Ow from './components/Ow'
import { PuffsContainer } from './components/Background'
import Typescript from './Typescript'
import NotFound from './NotFound'
import Bubbles from './components/Bubbles'
import TileWave from './components/TileWave'

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/ow',
        element: <Ow />,
    },
    {
        path: '/ts',
        element: <Typescript />,
    },
    {
        path: '/bubbles',
        element: <Bubbles />,
    },
    {
        path: '/tile-wave',
        element: <TileWave />,
    },
    {
        path: '/*',
        element: <NotFound />,
    },
])

export default () => <RouterProvider router={router} />
