import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";

import App from "@/App";
import { DefaultLayout } from "@/layouts";
import { HomePage } from "@/pages";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route element={<DefaultLayout />}>
                <Route path="/" element={<HomePage />} />
            </Route>
        </Route>,
    ),
);

export default router;
