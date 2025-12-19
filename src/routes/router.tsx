import { publicRoutes } from "./public.routes";
import HomeLayout from "@/layout/public.layout";
import { createBrowserRouter } from "react-router-dom";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <HomeLayout/>,
        children: [...publicRoutes]
    }
])