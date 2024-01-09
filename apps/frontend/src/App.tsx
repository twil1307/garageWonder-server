import { NextUIProvider } from "@nextui-org/react";
import { Outlet, useNavigate } from "react-router-dom";

function App() {
    const navigate = useNavigate();

    return (
        <NextUIProvider navigate={navigate}>
            <div className="light text-foreground bg-background">
                <Outlet />
            </div>
        </NextUIProvider>
    );
}

export default App;
