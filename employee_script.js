// Staff Session State & Persistence
let empName = localStorage.getItem('wareflow_emp_name') || "Staff Member";
let empId = localStorage.getItem('wareflow_emp_id') || ("EMP-" + Math.floor(1000 + Math.random() * 9000));
let empDept = localStorage.getItem('wareflow_emp_dept') || "Central Warehouse - Hub A";

localStorage.setItem('wareflow_emp_id', empId);
localStorage.setItem('wareflow_emp_name', empName);
localStorage.setItem('wareflow_emp_dept', empDept);

// Retrieve Orders from Local Storage
function getStoredOrders() {
    try {
        const data = localStorage.getItem('wareflow_orders');
        let orders = data ? JSON.parse(data) : [];

        // Sample orders if storage is empty
        if (orders.length === 0) {
            orders = [
                {
                    customerId: "CUST-84920",
                    customerName: "Global Logistics Corp",
                    orderId: "#WF-9001",
                    productName: "Heavy Storage Racks",
                    qty: "50 Units",
                    address: "Sector 4 Logistics Hub, Dock 12",
                    status: "Pending",
                    paymentStatus: "Invoice Issued",
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                    trackingCode: "TRK-882194"
                },
                {
                    customerId: "CUST-39102",
                    customerName: "Apex Retailers Ltd",
                    orderId: "#WF-9002",
                    productName: "Pallet Jack Hydraulic Lift",
                    qty: "4 Units",
                    address: "74 Industrial Parkway, Bldg B",
                    status: "Picking",
                    paymentStatus: "Paid",
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                    trackingCode: "TRK-540192"
                },
                {
                    customerId: "CUST-10492",
                    customerName: "BioPharm Storage Systems",
                    orderId: "#WF-9003",
                    productName: "Cold Storage Containers",
                    qty: "12 Units",
                    address: "Cold Bay Storage 9, Zone C",
                    status: "Dispatched",
                    paymentStatus: "Paid",
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                    trackingCode: "TRK-902184"
                }
            ];
            saveStoredOrders(orders);
        }
        return orders;
    } catch (err) {
        console.error("Failed to load orders:", err);
        return [];
    }
}

function saveStoredOrders(orders) {
    localStorage.setItem('wareflow_orders', JSON.stringify(orders));
    window.dispatchEvent(new Event('storage'));
}

// Render Staff Dashboard Table & Statistics
function renderEmployeeDashboard() {
    const empNameEl = document.getElementById("empNameDisplay");
    const empIdEl = document.getElementById("empIdDisplay");
    const shiftInfoEl = document.getElementById("shiftInfoText");

    if (empNameEl) empNameEl.textContent = empName;
    if (empIdEl) empIdEl.textContent = "ID: " + empId;
    if (shiftInfoEl) shiftInfoEl.textContent = `${empDept} | Shift: Active 🟢`;

    const orders = getStoredOrders();

    // Summary calculations
    const totalCount = orders.length;
    const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'Picking' || o.status === 'Packing').length;
    const activeCount = orders.filter(o => o.status === 'Dispatched' || o.status === 'In Transit').length;
    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

    document.getElementById("totalOrders").textContent = totalCount;
    document.getElementById("pendingOrders").textContent = pendingCount;
    document.getElementById("activeShipments").textContent = activeCount;
    document.getElementById("deliveredOrders").textContent = deliveredCount;

    const tableBody = document.getElementById("ordersTableBody");

    if (orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table-cell">
                    <div class="empty-table-state">
                        <span class="empty-icon-small">📭</span>
                        <p><strong>No customer orders pending in warehouse queue.</strong></p>
                        <p class="sub-empty">Click "+ Receive Inbound Freight" to register new shipments.</p>
                        <button class="primary-btn small" onclick="createNewStockOrder()">+ Receive Inbound Freight</button>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = "";
        orders.forEach(order => {
            let statusClass = "pending";
            if (order.status === 'Picking') statusClass = "picking";
            else if (order.status === 'Packing') statusClass = "packing";
            else if (order.status === 'Dispatched' || order.status === 'In Transit') statusClass = "dispatched";
            else if (order.status === 'Delivered') statusClass = "delivered";
            else if (order.status === 'Cancelled') statusClass = "cancelled";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${order.orderId}</strong><br><small style="color:#64748b;">${order.date || 'Today'}</small></td>
                <td><strong>${order.customerName || 'Customer'}</strong><br><small style="color:#0284c7;">${order.customerId || 'CUST-000'}</small></td>
                <td>${order.productName}<br><small style="color:#64748b;">Qty: ${order.qty}</small></td>
                <td><small style="color:#334155;">${order.address}</small></td>
                <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                <td><small style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:600;">${order.paymentStatus || 'Invoice Issued'}</small></td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus('${order.orderId}', this.value)">
                        <option value="" disabled selected>Change Status...</option>
                        <option value="Pending">Pending</option>
                        <option value="Picking">Picking</option>
                        <option value="Packing">Packing</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Update status for a specific order
function updateOrderStatus(orderId, newStatus) {
    if (!newStatus) return;
    const orders = getStoredOrders();
    const targetOrder = orders.find(o => o.orderId === orderId);

    if (targetOrder) {
        targetOrder.status = newStatus;
        if (newStatus === 'Dispatched') {
            targetOrder.trackingCode = targetOrder.trackingCode || ("TRK-" + Math.floor(100000 + Math.random() * 900000));
        }
        saveStoredOrders(orders);
        renderEmployeeDashboard();
        alert(`Order ${orderId} status changed to "${newStatus}". Customer dashboard updated!`);
    }
}

// Search and filter function
function filterOrders() {
    const searchVal = document.getElementById("searchInput").value.toLowerCase();
    const statusVal = document.getElementById("statusFilter").value;
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

// Register new inbound stock / order
function createNewStockOrder() {
    const custName = prompt("Enter customer or partner name:", "Apex Logistics Partner");
    if (!custName || !custName.trim()) return;

    const productName = prompt("Enter product description:", "Heavy Storage Racks");
    if (!productName || !productName.trim()) return;

    const qty = prompt("Enter item quantity:", "25 Units");
    if (!qty || !qty.trim()) return;

    const address = prompt("Enter storage dock or address:", "Dock B, Hub Central");

    const orders = getStoredOrders();
    const orderId = "#WF-" + (9000 + orders.length + 1);

    const newOrder = {
        customerId: "CUST-" + Math.floor(10000 + Math.random() * 90000),
        customerName: custName.trim(),
        orderId: orderId,
        productName: productName.trim(),
        qty: qty.trim(),
        address: address ? address.trim() : "Standard Warehouse Dock",
        status: "Pending",
        paymentStatus: "Invoice Issued",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        trackingCode: "TRK-" + Math.floor(100000 + Math.random() * 900000)
    };

    orders.push(newOrder);
    saveStoredOrders(orders);
    renderEmployeeDashboard();

    alert(`Inbound freight registered as Order ${orderId}!`);
}

// Batch dispatch all ready orders
function quickBatchDispatch() {
    const orders = getStoredOrders();
    let updatedCount = 0;

    orders.forEach(order => {
        if (order.status === 'Pending' || order.status === 'Picking' || order.status === 'Packing') {
            order.status = 'Dispatched';
            order.trackingCode = order.trackingCode || ("TRK-" + Math.floor(100000 + Math.random() * 900000));
            updatedCount++;
        }
    });

    if (updatedCount > 0) {
        saveStoredOrders(orders);
        renderEmployeeDashboard();
        alert(`Dispatched ${updatedCount} orders! Live tracking numbers generated.`);
    } else {
        alert("No pending orders available for batch dispatch.");
    }
}

// Export inventory summary report
function generateInventoryReport() {
    const orders = getStoredOrders();
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'Pending' || o.status === 'Picking').length;
    const active = orders.filter(o => o.status === 'Dispatched').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;

    alert(`📊 WareFlow Operational Report\n------------------------------------\nDepartment: ${empDept}\nTotal Managed Orders: ${total}\nPending Picking/Packing: ${pending}\nActive Dispatches: ${active}\nCompleted Deliveries: ${delivered}\nStorage Capacity Usage: 78%\n------------------------------------\nStatus: All Warehouse Operations Normal`);
}

// Update staff branch / department
function changeShiftInfo() {
    const newDept = prompt("Enter your assigned warehouse branch or department:", empDept);
    if (newDept && newDept.trim()) {
        empDept = newDept.trim();
        localStorage.setItem('wareflow_emp_dept', empDept);
        document.getElementById("shiftInfoText").textContent = `${empDept} | Shift: Active 🟢`;
        alert("Staff department updated!");
    }
}

function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
        window.location.href = "index.html";
    }
}

// Page initialization & storage listeners
document.addEventListener("DOMContentLoaded", () => {
    renderEmployeeDashboard();

    // Listen for updates from other tabs (e.g. customer places an order)
    window.addEventListener('storage', (e) => {
        if (e.key === 'wareflow_orders') renderEmployeeDashboard();
    });
});
