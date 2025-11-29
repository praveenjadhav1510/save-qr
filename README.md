# 📱 QR Manager Pro

A modern, offline-first web application built with React to scan, manage, and generate QR codes. Designed as a **single-file application**—no build tools or complex setup required.

### 🚀 [Live Demo](https://praveenjadhav1510.github.io/save-qr/)
Click the link above to try the application directly in your browser.

---

## ✨ Features

* **📷 Live Scanning:** Real-time QR code scanning using the device camera.
* **💾 Local Storage:** All scanned codes are saved locally in your browser. No data leaves your device.
* **🏷️ Organization:** Tag, categorize, and "Favorite" your QR codes for easy access.
* **🔍 Search & Filter:** Powerful search (Ctrl + K) and tag filtering to find codes instantly.
* **📤 Import / Export:** Backup your data to JSON and restore it on any device.
* **🎨 Dark/Light Mode:** Automatic theme detection with a manual toggle (Spacebar).
* **⚡ Zero Dependencies:** Run it locally without `npm install` or build steps.

## 🛠️ Tech Stack

This project is built as a Single Page Application (SPA) contained entirely within one HTML file.

* **Core:** React 18 & ReactDOM (via CDN)
* **Routing:** React Router DOM v6
* **Scanning:** `html5-qrcode` library
* **Generation:** `qrcode.js` library
* **Styling:** CSS3 Variables & Flexbox (No external CSS frameworks)

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Ctrl + K`** | Focus Search Bar (Saved Page) |
| **`Ctrl + S`** | Save currently scanned QR |
| **`Space`** | Toggle Light/Dark Theme |

## 🚀 How to Run Locally

Because this app accesses the **Camera**, browser security policies require it to be served via **HTTPS** or **Localhost**. You cannot simply double-click the `.html` file to access the camera (though the Saved page will still work).

1.  **Clone the repo:**
    ```bash
    git clone [https://github.com/praveenjadhav1510/save-qr.git](https://github.com/praveenjadhav1510/save-qr.git)
    ```
2.  **Serve the file:**
    * **VS Code:** Install the "Live Server" extension, right-click `index.html`, and select "Open with Live Server".
    * **Python:** Run `python3 -m http.server` in the directory and open `http://localhost:8000`.
    * **Node:** Run `npx serve .`

## 🔒 Privacy & Security

* **Client-Side Only:** This application has no backend database.
* **Data Persistence:** Your saved QR codes are stored in your browser's `localStorage`.
* **Camera Access:** Camera permission is requested only for scanning. No video feeds are recorded or sent to any server.

## 🤝 Contributing

Feel free to fork this repository and submit pull requests. Since the entire app is in `index.html`, it is easy to modify and experiment with!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.