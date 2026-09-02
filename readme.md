# 🌮 Taco Bell Gourmet - Hotel Food Suite & KDS Real-Time System

An ultra-modern, luxury White Glassmorphism Hotel Food Management Dashboard and Kitchen Display System (KDS) powered by **Framer Motion**, seamlessly integrated in real-time with a high-performance **C++ console backend** (`food_menu.cpp`).

---

## ⚡ 1-Command Quick Start

To compile the C++ backend, launch the real-time server, open the web dashboard, and start the C++ ordering terminal all in **one single command**:

### In PowerShell / Terminal:
```powershell
.\start.bat
```
*or*
```powershell
npm run all
```

---

## 🏗️ Architecture & Features

1. **C++ Terminal Backend (`food_menu.cpp`)**:
   - Compiles to `food_menu.exe` with GCC/Clang/MSVC.
   - Interactive console ordering system supporting customized Juices, Shakes, Wraps, and Tacos.
   - Generates UPI payment links (`9625065557@upi`).
   - Atomically logs orders to `food_order.txt` and `orders.json`.

2. **Real-Time Node.js Sync Server (`server.js`)**:
   - High-throughput Express backend with Server-Sent Events (`/api/events`).
   - File system watcher on `orders.json` broadcasts new orders to the web dashboard in `<50ms`.

3. **Ultra-Modern White Luxe Dashboard (`index.html`, `style.css`, `app.js`)**:
   - **Modern White Theme**: Crisp porcelain white cards with soft gradient lighting, clean typography, and zero-fluctuation diff rendering.
   - **Framer Motion (`motion`)**: Fluid springs and staggered reveals.
   - **Kitchen KDS**: Real-time order cards with live lifecycle updates (*Pending* → *In Kitchen* → *Ready for Pickup* → *Served*).
   - **Food Kiosk & POS**: Dynamic catalog with food imagery, customizable cart drawer, coupon engine (`TACO10`), and pinned checkout button.
   - **Dynamic UPI Payment Modal**: Instant QR code generator with live payment confirmation.
   - **Sales Analytics Hub**: Live revenue metrics, category sales breakdown, and leaderboard.