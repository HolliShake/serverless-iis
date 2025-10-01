import { createBrowserRouter, type RouteObject } from "react-router-dom"
import { RouterProvider } from "react-router-dom"
import ROUTES from "@/routing"
import type { Route } from "./types"
import SidebarLayout from "./layout/sidebar"
import DefaultLayout from "./layout/default"


const routes = createBrowserRouter(ROUTES.map((r: Route) => ({
  path: r.path,
  element: r.layout == "sidebar"
    ? <SidebarLayout>{r.component}</SidebarLayout>
    : <DefaultLayout>{r.component}</DefaultLayout>,
})) as RouteObject[])

function App() {
  return (
    <RouterProvider
      router={routes}
    />
  )
}

export default App
