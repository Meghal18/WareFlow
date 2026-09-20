// Customer Session State
let customerName = localStorage.getItem('wareflow_cust_name') || "Customer";
let customerId = localStorage.getItem('wareflow_cust_id') || ("CUST-" + Math.floor(10000 + Math.random() * 90000));
localStorage.setItem('wareflow_cust_id', customerId);

// Helper functions for orders storage
function getStoredOrders() {
    try {
        const data = localStorage.getItem('wareflow_orders');
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error("Failed to parse orders:", err);
        return [];
    }
}

function saveStoredOrders(orders) {
    localStorage.setItem('wareflow_orders', JSON.stringify(orders));
    window.dispatchEvent(new Event('storage'));
}

// Main UI Render Function
function renderCustomerDashboard() {
    const custNameEl = document.getElementById("custNameDisplay");
    const custIdEl = document.getElementById("custIdDisplay");
    
    if (custNameEl) custNameEl.textContent = customerName;
    if (custIdEl) custIdEl.textContent = "ID: " + customerId;

    const orders = getStoredOrders();

    // Calculate metrics
    const totalCount = orders.length;
    const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'Picking' || o.status === 'Packing').length;
    const activeCount = orders.filter(o => o.status === 'Dispatched' || o.status === 'In Transit').length;
    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
    const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;

    // Update Counter Cards
    document.getElementById("totalOrders").textContent = totalCount;
    document.getElementById("pendingOrders").textContent = pendingCount;
    document.getElementById("activeShipments").textContent = activeCount;
    document.getElementById("deliveredOrders").textContent = deliveredCount;
    document.getElementById("cancelledOrders").textContent = cancelledCount;

    const tableBody = document.getElementById("ordersTableBody");
    const trackerBox = document.getElementById("trackerEmptyState");

    // Render Empty State or Table Rows
    if (orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-table-cell">
                    <div class="empty-table-state">
                        <span class="empty-icon-small">📭</span>
                        <p><strong>No orders placed yet.</strong></p>
                        <p class="sub-empty">Your placed orders, tracking info, and invoices will appear here.</p>
                        <button class="primary-btn small" onclick="createNewOrder()">+ Place First Order</button>
                    </div>
                </td>
            </tr>
        `;
        trackerBox.innerHTML = `
            <div class="empty-icon">🚛</div>
            <h4>No Active Shipments</h4>
            <p>You currently have no orders in transit. Placed orders will display live tracking details here.</p>
        `;
    } else {
        tableBody.innerHTML = "";
        orders.forEach(order => {
            let statusBg = "#fef9c3";
            let statusColor = "#854d0e";
            if (order.status === 'Dispatched' || order.status === 'In Transit') {
                statusBg = "#e0f2fe"; statusColor = "#0369a1";
            } else if (order.status === 'Delivered') {
                statusBg = "#dcfce7"; statusColor = "#15803d";
            } else if (order.status === 'Cancelled') {
                statusBg = "#fee2e2"; statusColor = "#b91c1c";
            }

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.customerId || customerId}</td>
                <td>${order.customerName || customerName}</td>
                <td><strong>${order.orderId}</strong></td>
                <td>${order.productName}</td>
                <td>${order.qty}</td>
                <td>${order.address}</td>
                <td><span style="background-color: ${statusBg}; color: ${statusColor}; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 11px;">${order.status}</span></td>
                <td><span style="background-color: #fffbeb; color: #92400e; border: 1px solid #fef3c7; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 11px;">${order.paymentStatus || 'Invoice Issued'}</span></td>
            `;
            tableBody.appendChild(row);
        });

        // Display tracker for active or latest order
        const activeOrder = orders.find(o => o.status !== 'Delivered' && o.status !== 'Cancelled') || orders[orders.length - 1];
        if (activeOrder) {
            trackerBox.innerHTML = `
                <div style="text-align: left; background-color: #ffffff; padding: 18px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 15px; font-weight: 700; color: #0f172a;">Active Order ${activeOrder.orderId}</span>
                        <span style="background-color: #0284c7; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">Status: ${activeOrder.status}</span>
                    </div>
                    <p style="margin-bottom: 6px; font-size: 13px;"><strong>Item:</strong> ${activeOrder.productName} (${activeOrder.qty})</p>
                    <p style="margin-bottom: 6px; font-size: 13px;"><strong>Destination:</strong> ${activeOrder.address}</p>
                    <p style="margin-bottom: 6px; font-size: 13px;"><strong>Tracking Code:</strong> <code style="background:#f1f5f9; padding:2px 6px; border-radius:4px;">${activeOrder.trackingCode || 'TRK-PENDING'}</code></p>
                    <p style="color: #0284c7; margin-top: 8px; font-size: 12px; font-weight: 600;">⚡ Live Status: Warehouse Operations team is processing this order.</p>
                </div>
            `;
        }
    }
}

// User Actions
function createNewOrder() {
    const productName = prompt("Enter product name for your new order:", "Heavy Storage Racks");
    if (!productName || !productName.trim()) return;

    const qty = prompt("Enter quantity:", "10 Units");
    if (!qty || !qty.trim()) return;

    let address = document.getElementById("deliveryAddressText").textContent;
    if (address === "No delivery address added yet.") {
        address = prompt("Enter delivery address for this order:", "100 Warehouse Way, Sector 4");
        if (address && address.trim()) {
            document.getElementById("deliveryAddressText").textContent = address.trim();
            document.getElementById("deliveryAddressText").style.fontStyle = "normal";
            localStorage.setItem("wareflow_delivery_address", address.trim());
        } else {
            address = "Standard Delivery Address";
        }
    }

    const orders = getStoredOrders();
    const orderId = "#WF-" + (9000 + orders.length + 1);

    const newOrder = {
        customerId: customerId,
        customerName: customerName,
        orderId: orderId,
        productName: productName.trim(),
        qty: qty.trim(),
        address: address,
        status: "Pending",
        paymentStatus: "Invoice Issued",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        trackingCode: "TRK-" + Math.floor(100000 + Math.random() * 900000)
    };

    orders.push(newOrder);
    saveStoredOrders(orders);
    renderCustomerDashboard();

    alert(`Order ${orderId} created successfully!`);
}

function requestStorage() {
    const space = prompt("Enter required storage capacity (e.g. 500 sq ft or 10 Racks):", "500 sq ft");
    if (space && space.trim()) {
        alert(`Storage unit request for "${space}" submitted! Our team will contact you shortly.`);
    }
}

function editAddress() {
    const currentAddress = document.getElementById("deliveryAddressText").textContent;
    const newAddress = prompt("Enter primary delivery address:", currentAddress === "No delivery address added yet." ? "" : currentAddress);
    if (newAddress && newAddress.trim()) {
        document.getElementById("deliveryAddressText").textContent = newAddress.trim();
        document.getElementById("deliveryAddressText").style.fontStyle = "normal";
        localStorage.setItem("wareflow_delivery_address", newAddress.trim());
        alert("Delivery address updated!");
    }
}

function filterOrders() {
    const searchVal = document.getElementById("searchInput").value.toLowerCase();
    const statusVal = document.getElementById("statusFilter") ? document.getElementById("statusFilter").value : "ALL";
    const rows = document.querySelectorAll("#ordersTableBody tr");

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matchesSearch = text.includes(searchVal);
        let matchesStatus = true;

        if (statusVal !== "ALL") {
            matchesStatus = text.includes(statusVal.toLowerCase());
        }

        row.style.display = (matchesSearch && matchesStatus) ? "" : "none";
    });
}

function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
        window.location.href = "index.html";
    }
}

// Initial Page Load & Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Restore saved address if present
    const savedAddress = localStorage.getItem("wareflow_delivery_address");
    if (savedAddress && document.getElementById("deliveryAddressText")) {
        document.getElementById("deliveryAddressText").textContent = savedAddress;
        document.getElementById("deliveryAddressText").style.fontStyle = "normal";
    }

    renderCustomerDashboard();

    // Synchronize updates across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'wareflow_orders') renderCustomerDashboard();
    });
});
