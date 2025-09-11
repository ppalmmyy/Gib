import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import List from "./List.jsx";
import Hello from "./Hello";
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <List/>
    </StrictMode>
)