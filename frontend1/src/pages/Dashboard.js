import { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {
  const [myItems, setMyItems] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    lostItems: 0,
    foundItems: 0,
    openCases: 0,
  });
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError("");

        const userRes = await api.get("/api/auth/me");
        setUser(userRes.data);

        const myItemsRes = await api.get("/api/items/mine");
        setMyItems(Array.isArray(myItemsRes.data) ? myItemsRes.data : []);

        const allItemsRes = await api.get("/api/items");

        const allItems = Array.isArray(allItemsRes.data)
          ? allItemsRes.data
          : Array.isArray(allItemsRes.data?.items)
          ? allItemsRes.data.items
          : [];

        setStats({
          totalReports: allItemsRes.data?.stats?.totalReports ?? allItems.length,
          lostItems:
            allItemsRes.data?.stats?.lostItems ??
            allItems.filter((item) => item.type === "lost").length,
          foundItems:
            allItemsRes.data?.stats?.foundItems ??
            allItems.filter((item) => item.type === "found").length,
          openCases:
            allItemsRes.data?.stats?.openCases ??
            allItems.filter(
              (item) => item.status === "open" || item.status === "claimed"
            ).length,
        });
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || "Unable to load dashboard data right now."
        );
      }
    };

    fetchDashboard();
  }, []);

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Hello{user?.name ? `, ${user.name}` : ""}</h1>
          <p className="hero-text">
            Monitor all activity across the platform and manage your own reports.
          </p>
        </div>

        <div className="hero-badge-card">
          <span>Platform status</span>
          <strong>Active</strong>
          <p>Tracking all reported lost and found cases.</p>
        </div>
      </section>

      {error && <p className="error-banner">{error}</p>}

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Reports</span>
          <h3>{stats.totalReports}</h3>
          <p>Total items posted on the website.</p>
        </div>

        <div className="stat-card">
          <span>Lost Items</span>
          <h3>{stats.lostItems}</h3>
          <p>Total lost item reports across all users.</p>
        </div>

        <div className="stat-card">
          <span>Found Items</span>
          <h3>{stats.foundItems}</h3>
          <p>Total found item reports across all users.</p>
        </div>

        <div className="stat-card">
          <span>Open Cases</span>
          <h3>{stats.openCases}</h3>
          <p>Cases not fully resolved yet.</p>
        </div>
      </section>

      <section className="content-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">My activity</p>
            <h2>My recent reports</h2>
          </div>
        </div>

        {myItems.length === 0 ? (
          <div className="empty-state">
            <h3>No reports yet</h3>
            <p>Create your first lost or found report to start tracking activity.</p>
          </div>
        ) : (
          <div className="item-grid">
            {myItems.map((item) => (
              <article key={item._id} className="report-card">
                <div className="report-top">
                  <span className={`pill ${item.type}`}>{item.type}</span>
                  <span className={`status ${item.status}`}>{item.status}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="report-meta">
                  <span>{item.category}</span>
                  <span>{item.location}</span>
                  <span>{item.date}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;