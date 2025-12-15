import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './components/Home'
import Ow from './components/Ow'
import { PuffsContainer } from './components/Background'
import Typescript from './Typescript'
import NotFound from './NotFound'
import Bubbles from './components/Bubbles'

const RedirectToR = () => {
    useEffect(() => {
        const { hostname, pathname, search, hash } = window.location
        const targetHost = 'r.zardoy.com'

        // Only redirect if we're on zardoy.com (not already on r.zardoy.com)
        if (hostname === 'zardoy.com' || hostname === 'www.zardoy.com') {
            const newUrl = `https://${targetHost}${pathname}${search}${hash}`
            window.location.replace(newUrl)
        }
    }, [])

    return null
}

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
        path: '/404',
        element: <NotFound />,
    },
    {
        path: '/test',
        element: <NotFound />,
    },
    {
        path: '/*',
        element: <RedirectToR />,
    },
])

export default () => <RouterProvider router={router} />
