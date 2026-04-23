import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function CreateItem() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    type: "lost",
    location: "",
    date: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!imageFile) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setImageFile(null);
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Only JPG, JPEG, and PNG images are allowed.");
      setImageFile(null);
      return;
    }

    setError("");
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("category", formData.category);
      payload.append("type", formData.type);
      payload.append("location", formData.location);
      payload.append("date", formData.date);

      if (imageFile) {
        payload.append("image", imageFile);
      }

      await api.post("/api/items", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Report submitted successfully.");

      setFormData({
        title: "",
        description: "",
        category: "",
        type: "lost",
        location: "",
        date: "",
      });

      setImageFile(null);
      setPreview("");

      setTimeout(() => {
        navigate("/items");
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit report.");
    }
  };

  return (
    <main className="page-shell">
      <section className="form-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Create report</p>
            <h1>Report a lost or found item</h1>
          </div>
        </div>

        <form className="styled-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label>Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Black backpack"
                required
              />
            </div>

            <div>
              <label>Category</label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Bag, phone, ID card..."
                required
              />
            </div>

            <div>
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>

            <div>
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="full-span">
              <label>Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Library block, metro station, cafeteria..."
                required
              />
            </div>

            <div className="full-span">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add identifying details, colors, brand, items inside, or where it was last seen."
                rows="5"
                required
              />
            </div>

            <div className="full-span">
              <label>Upload image (JPG/PNG)</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleFileChange}
              />
            </div>

            {preview && (
              <div className="full-span">
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: "220px",
                    height: "220px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                    marginTop: "10px",
                  }}
                />
              </div>
            )}
          </div>

          {message && <p className="success-banner">{message}</p>}
          {error && <p className="error-banner">{error}</p>}

          <button className="primary-btn submit-wide" type="submit">
            Submit report
          </button>
        </form>
      </section>
    </main>
  );
}

export default CreateItem;