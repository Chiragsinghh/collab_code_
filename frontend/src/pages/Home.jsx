import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Welcome to CodeCollab 🚀</h1>
      <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  );
}