// mockData.js
export const studentInfo = {
  name: "Jan Lorenz Laroco",
  studentId: "STU123456",
  course: "BSIT",
  year: 3
};

export const devices = [
  {
    id: 1,
    type: "Laptop",
    brand: "Dell",
    model: "XPS 15",
    status: "active",
    qrExpiry: "2025-11-14",
    lastScanned: "2025-10-14 08:30 AM"
  },
  {
    id: 2,
    type: "Laptop",
    brand: "MacBook",
    model: "Pro M2",
    status: "pending",
    qrExpiry: null,
    lastScanned: null
  }
];

export const recentActivity = [
  { gate: "Gate 1", time: "2025-10-14 08:30 AM", status: "success" },
  { gate: "Gate 2", time: "2025-10-13 02:15 PM", status: "success" },
  { gate: "Gate 3", time: "2025-10-13 08:00 AM", status: "success" },
  { gate: "Gate 4", time: "2025-10-12 09:45 AM", status: "success" }
];