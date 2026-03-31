import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>

      <Link to="/editor/123">
        <button>Open Project</button>
      </Link>
    </div>
  );
}