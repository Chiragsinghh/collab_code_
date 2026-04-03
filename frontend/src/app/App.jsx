import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}

export default App;