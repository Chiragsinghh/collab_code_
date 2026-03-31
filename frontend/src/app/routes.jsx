import { createBrowserRouter } from "react-router-dom";

import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Editor from "../pages/Editor";
import Settings from "../pages/Settings";

// ✅ ADD THIS IMPORT
import { CollabProvider } from "../features/collaboration/CollabProvider";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/editor/:id",
    element: (
      <CollabProvider>
        <Editor />
      </CollabProvider>
    ),
  },
  {
    path: "/settings",
    element: <Settings />,
  },
]);