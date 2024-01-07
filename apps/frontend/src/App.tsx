import { Button, NextUIProvider } from "@nextui-org/react";

function App() {
    return (
        <div className="light text-foreground bg-background">
            <NextUIProvider>
                <Button color="primary" className="w-6 mx-auto">
                    Button
                </Button>
            </NextUIProvider>
        </div>
    );
}

export default App;
