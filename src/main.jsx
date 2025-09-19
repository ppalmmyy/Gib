import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import List from "./List.jsx";
import Hello from "./Hello";
import Gib from "./Gid.jsx";
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Gib/>
    </StrictMode>
)