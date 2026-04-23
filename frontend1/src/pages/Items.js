import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Items() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser._id || currentUser.id;

  const fetchItems = async () => {
    try {
      setError("");
      const res = await api.get("/api/items");

      const itemsData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.items)
        ? res.data.items
        : [];

      setItems(itemsData);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load items.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleClaim = async (itemId) => {
    try {
      await api.put(`/api/items/${itemId}/claim`);
      await fetchItems();
      alert("Item claimed successfully.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to claim item.");
    }
  };

  const handleCancelClaim = async (itemId) => {
    try {
      await api.put(`/api/items/${itemId}/cancel-claim`);
      await fetchItems();
      alert("Claim cancelled successfully.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel claim.");
    }
  };

  const handleDelete = async (itemId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/api/items/${itemId}`);
      await fetchItems();
      alert("Item deleted successfully.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete item.");
    }
  };

  const handleContact = async (item) => {
    try {
      const ownerId = item?.user?._id || item?.user;

      if (!ownerId) {
        alert("Unable to identify item owner.");
        return;
      }

      if (String(ownerId) === String(currentUserId)) {
        alert("You cannot contact yourself.");
        return;
      }

      const startRes = await api.post("/api/messages/start", {
        otherUserId: ownerId,
        itemId: item._id,
      });

      const chatId = startRes.data.chatId;

      await api.post("/api/messages", {
        chatId,
        receiver: ownerId,
        itemId: item._id,
        text: `Hi, I am contacting you about "${item.title}".`,
      });

      localStorage.setItem("activeChatId", chatId);
      navigate("/chat");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to start chat.");
    }
  };

  return (
    <main className="page-shell">
      <section className="content-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Listings</p>
            <h1>All lost and found items</h1>
          </div>
        </div>

        {error && <p className="error-banner">{error}</p>}

        {!error && items.length === 0 ? (
          <div className="empty-state">
            <h3>No items found</h3>
            <p>There are no reports available right now.</p>
          </div>
        ) : (
          <div className="item-grid">
            {items.map((item) => {
              const ownerId = item?.user?._id || item?.user;
              const claimedById = item?.claimedBy?._id || item?.claimedBy;

              const isOwner = String(ownerId) === String(currentUserId);
              const isClaimer = claimedById && String(claimedById) === String(currentUserId);
              const isFoundItem = item.type === "found";
              const isClaimed = item.status === "claimed";
              const isResolved = item.status === "resolved";

              const imageUrl = item.image
                ? `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${item.image}`
                : "";

              return (
                <article key={item._id} className="report-card">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "220px",
                        objectFit: "cover",
                        borderRadius: "14px",
                        marginBottom: "14px",
                      }}
                    />
                  )}

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

                  <div
                    style={{
                      marginTop: "14px",
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    {!isOwner && (
                      <button className="primary-btn" onClick={() => handleContact(item)}>
                        Contact
                      </button>
                    )}

                    {!isOwner && isFoundItem && !isClaimed && !isResolved && (
                      <button className="primary-btn" onClick={() => handleClaim(item._id)}>
                        Claim
                      </button>
                    )}

                    {!isOwner && isClaimer && isClaimed && (
                      <button className="primary-btn" onClick={() => handleCancelClaim(item._id)}>
                        Cancel
                      </button>
                    )}

                    {isOwner && (
                      <button className="primary-btn" onClick={() => handleDelete(item._id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Items;