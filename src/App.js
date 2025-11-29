import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
} from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QRCodeCanvas } from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import {
  Scan,
  Archive,
  Sun,
  Moon,
  Copy,
  ExternalLink,
  Download,
  Save,
  Trash2,
  Eye,
  Star,
  Search,
  Upload,
  FileJson,
} from "lucide-react";
import "./App.css";

// --- Utility Functions ---

const downloadQR = (text, filename) => {
  const canvas = document.createElement("canvas");
  // We render a temp QR to canvas just for download
  // In a real app, we might grab the ref of the visible canvas,
  // but generating new ensures consistent size/quality.
  const size = 512;
  // This is a simplified way. Ideally we render a hidden component or use a library buffer.
  // For this demo, we simply assume the User views the QR then clicks download,
  // or we perform a quick DOM manipulation.

  // Logic: Create a temporary container, render QR, export.
  // To keep it React-friendly without heavy DOM manipulation,
  // we will grab the specific canvas ID if visible or generic approach.

  // Let's use the simplest robust method:
  // We trigger a download on the existing canvas if visible, or alert if not.
  // Better approach for "Background" download:
  // Using qrcode library directly in JS context is harder without node.
  // We will assume the View Modal is open or we render a hidden canvas.

  // Quick Fix for "Download Anywhere":
  // We will require the user to View the QR to download it, OR
  // we render a hidden canvas with a specific ID just for the action.

  console.log("Downloading", text);
  // Implementation note: In this single file demo, specific download logic
  // is attached to the visible <QRCodeCanvas> via refs for simplicity.
};

// --- Custom Hooks ---

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

// --- Components ---

const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className="theme-btn"
    title="Toggle Theme (Space)"
  >
    {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
  </button>
);

const NavBar = ({ theme, toggleTheme }) => (
  <nav className="navbar">
    <div className="nav-brand">QR Manager</div>
    <div className="nav-links">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }
      >
        <span className="btn-icon">
          <Scan size={18} /> Scan
        </span>
      </NavLink>
      <NavLink
        to="/saved"
        className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }
      >
        <span className="btn-icon">
          <Archive size={18} /> Saved
        </span>
      </NavLink>
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
    </div>
  </nav>
);

const Footer = () => (
  <footer className="footer-hint">
    SHORTCUTS: <span className="kbd">Space</span> Toggle Theme •{" "}
    <span className="kbd">Ctrl+K</span> Search Saved •{" "}
    <span className="kbd">Ctrl+S</span> Save Scan
  </footer>
);

// --- Pages ---

const ScannerPage = ({ onSave }) => {
  const [scannedText, setScannedText] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Keyboard shortcut listener for Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (scannedText) setShowSaveModal(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scannedText]);

  const handleScan = (result) => {
    if (result && result.length > 0) {
      setScannedText(result[0].rawValue);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scannedText);
    alert("Copied to clipboard!");
  };

  const handleDownload = () => {
    const canvas = document.getElementById("generated-qr");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-scan-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="page-content">
      <div className="scanner-wrapper">
        <Scanner
          onScan={handleScan}
          onError={(error) => console.log(error)}
          components={{ audio: false, finder: true }}
          styles={{ container: { height: 300 } }}
        />
      </div>

      {scannedText && (
        <div className="scan-result">
          <h3>Detected Content:</h3>
          <div className="card-text">{scannedText}</div>

          <div className="card-actions">
            {scannedText.startsWith("http") && (
              <a
                href={scannedText}
                target="_blank"
                rel="noreferrer"
                className="btn-primary btn-icon"
                style={{ textDecoration: "none" }}
              >
                <ExternalLink size={16} /> Open Link
              </a>
            )}
            <button
              onClick={copyToClipboard}
              className="btn-secondary btn-icon"
            >
              <Copy size={16} /> Copy
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="btn-secondary btn-icon"
            >
              <Save size={16} /> Save
            </button>
            <button onClick={handleDownload} className="btn-secondary btn-icon">
              <Download size={16} /> Download
            </button>
          </div>

          {/* Hidden Canvas for Download generation */}
          <div style={{ display: "none" }}>
            <QRCodeCanvas id="generated-qr" value={scannedText} size={512} />
          </div>
        </div>
      )}

      {showSaveModal && (
        <SaveModal
          text={scannedText}
          onClose={() => setShowSaveModal(false)}
          onSave={onSave}
        />
      )}
    </div>
  );
};

const SaveModal = ({ text, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");

  // Auto-detect type
  useEffect(() => {
    let suggestions = [];
    if (text.startsWith("http")) suggestions.push("Link");
    if (text.includes("WIFI:")) suggestions.push("Wi-Fi");
    if (text.includes("BEGIN:VCARD")) suggestions.push("Contact");
    setTags(suggestions.join(", "));
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    onSave({
      id: uuidv4(),
      text,
      title: title || "Untitled QR",
      tags: tagArray,
      createdAt: Date.now(),
      isFavorite: false,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Save QR Code</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label>Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Office Wi-Fi"
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>Tags (comma separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Link, Work, Personal"
            />
          </div>
          <div className="card-actions" style={{ justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ViewQRModal = ({ item, onClose }) => {
  const download = () => {
    const canvas = document.getElementById("view-qr-canvas");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `qr-${item.title.replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <span className="card-title">{item.title}</span>
          <button onClick={onClose} className="btn-sm btn-secondary">
            ✕
          </button>
        </div>
        <div className="qr-preview-container">
          <QRCodeCanvas id="view-qr-canvas" value={item.text} size={256} />
        </div>
        <p
          style={{
            wordBreak: "break-all",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
          }}
        >
          {item.text}
        </p>
        <div className="card-actions" style={{ justifyContent: "center" }}>
          <button onClick={download} className="btn-primary btn-icon">
            <Download size={16} /> Download PNG
          </button>
        </div>
      </div>
    </div>
  );
};

const SavedQrsPage = ({ items, setItems }) => {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const searchInputRef = useRef(null);

  // Global Ctrl+K
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Filter Logic
  const allTags = useMemo(() => {
    const tags = new Set(["All"]);
    items.forEach((i) => i.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [items]);

  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.text.toLowerCase().includes(search.toLowerCase());
      const matchesTag =
        selectedTag === "All" || item.tags.includes(selectedTag);
      const matchesFav = !showFavsOnly || item.isFavorite;
      return matchesSearch && matchesTag && matchesFav;
    })
    .sort((a, b) => {
      // Sort logic: Favorites first, then date descending
      if (a.isFavorite === b.isFavorite) {
        return b.createdAt - a.createdAt;
      }
      return a.isFavorite ? -1 : 1;
    });

  // Actions
  const toggleFavorite = (id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i))
    );
  };

  const deleteItem = (id) => {
    if (window.confirm("Are you sure you want to delete this QR?")) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const exportData = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(items));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = "qr-codes-backup.json";
    a.click();
  };

  const importData = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed)) {
          // Merge with unique IDs just in case, or simply append
          // Here we assume ID conflicts are rare if using UUID,
          // but we can re-generate IDs to be safe or filter duplicates.
          const newItems = parsed.map((p) => ({ ...p, id: uuidv4() })); // Regenerate IDs to avoid collision
          setItems((prev) => [...prev, ...newItems]);
          alert(`Imported ${newItems.length} QR codes.`);
        }
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
  };

  return (
    <div className="page-content">
      {/* Search & Export Controls */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ position: "relative", flexGrow: 1 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 10, top: 12, color: "gray" }}
          />
          <input
            ref={searchInputRef}
            placeholder="Search QRs (Ctrl + K)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2rem" }}
          />
        </div>
        <button
          onClick={exportData}
          title="Export JSON"
          className="btn-secondary btn-icon"
        >
          <FileJson size={16} />
        </button>
        <label
          className="btn-secondary btn-icon"
          style={{ cursor: "pointer", margin: 0 }}
        >
          <Upload size={16} />
          <input
            type="file"
            onChange={importData}
            style={{ display: "none" }}
            accept=".json"
          />
        </label>
      </div>

      {/* Filters */}
      <div className="filters">
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`chip ${selectedTag === tag ? "active" : ""}`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginLeft: "auto",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={showFavsOnly}
            onChange={(e) => setShowFavsOnly(e.target.checked)}
          />
          Favorites Only
        </label>
      </div>

      {/* Grid */}
      <div className="qr-grid">
        {filteredItems.length === 0 && (
          <p style={{ textAlign: "center", color: "gray" }}>
            No QR codes found.
          </p>
        )}
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`qr-card ${item.isFavorite ? "pinned" : ""}`}
          >
            <div className="card-header">
              <span className="card-title">{item.title}</span>
              <button
                onClick={() => toggleFavorite(item.id)}
                style={{
                  background: "none",
                  padding: 0,
                  color: item.isFavorite ? "#eab308" : "gray",
                }}
              >
                <Star size={20} fill={item.isFavorite ? "#eab308" : "none"} />
              </button>
            </div>

            <div className="card-meta">
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              {item.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    background: "var(--border)",
                    padding: "0 4px",
                    borderRadius: 3,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            <div
              className="card-text"
              style={{
                maxHeight: "60px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {item.text}
            </div>

            <div className="card-actions">
              <button
                onClick={() => setViewingItem(item)}
                className="btn-secondary btn-sm btn-icon"
              >
                <Eye size={14} /> View
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(item.text)}
                className="btn-secondary btn-sm btn-icon"
              >
                <Copy size={14} /> Copy
              </button>
              {item.text.startsWith("http") && (
                <a
                  href={item.text}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary btn-sm btn-icon"
                  style={{ textDecoration: "none" }}
                >
                  <ExternalLink size={14} /> Link
                </a>
              )}
              <button
                onClick={() => deleteItem(item.id)}
                className="btn-danger btn-sm"
                style={{ marginLeft: "auto" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {viewingItem && (
        <ViewQRModal item={viewingItem} onClose={() => setViewingItem(null)} />
      )}
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [theme, setTheme] = useLocalStorage("qr-app-theme", "dark");
  const [savedItems, setSavedItems] = useLocalStorage("qr-saved-items", []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // Global Theme Shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if (
        e.code === "Space" &&
        document.activeElement.tagName !== "INPUT" &&
        document.activeElement.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleSaveQR = (newItem) => {
    setSavedItems((prev) => [newItem, ...prev]);
    alert("QR Saved Successfully!");
  };

  return (
    <BrowserRouter>
      <div className="container">
        <NavBar theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<ScannerPage onSave={handleSaveQR} />} />
          <Route
            path="/saved"
            element={
              <SavedQrsPage items={savedItems} setItems={setSavedItems} />
            }
          />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
