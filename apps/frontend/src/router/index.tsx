import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";

import App from "@/App";
import { DefaultLayout } from "@/layouts";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route element={<DefaultLayout />}>
                <Route path="/" element={<div id="home" className="relative">Home</div>} />
            </Route>
        </Route>,
    ),
);

export default router;
