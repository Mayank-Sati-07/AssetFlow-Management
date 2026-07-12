// ============================================
// AssetFlow — Seed Data Generator
// ============================================

const SeedData = {
  async seed() {
    if (Store.isSeeded()) return;

    console.log('AssetFlow: Seeding initial data...');

    // ---- Admin User ----
    const adminHash = await Auth.hashPassword('admin123');
    const admin = Store.create('users', {
      id: 'user_admin',
      name: 'System Administrator',
      email: 'admin@assetflow.com',
      passwordHash: adminHash,
      role: 'Admin',
      departmentId: null,
      status: 'Active'
    });

    // ---- Departments ----
    const depts = [
      { id: 'dept_it', name: 'Information Technology', description: 'IT infrastructure and support', status: 'Active' },
      { id: 'dept_hr', name: 'Human Resources', description: 'People management and recruitment', status: 'Active' },
      { id: 'dept_ops', name: 'Operations', description: 'Day-to-day business operations', status: 'Active' },
      { id: 'dept_fin', name: 'Finance', description: 'Financial planning and accounting', status: 'Active' },
      { id: 'dept_fac', name: 'Facilities', description: 'Building and facility management', status: 'Active' }
    ];
    depts.forEach(d => Store.create('departments', d));

    // ---- Categories ----
    const cats = [
      { id: 'cat_elec', name: 'Electronics', description: 'Laptops, monitors, phones, etc.', customFields: [{ key: 'Warranty Period', type: 'text' }, { key: 'Processor', type: 'text' }] },
      { id: 'cat_furn', name: 'Furniture', description: 'Desks, chairs, shelves', customFields: [{ key: 'Material', type: 'text' }] },
      { id: 'cat_vehi', name: 'Vehicles', description: 'Cars, vans, trucks', customFields: [{ key: 'License Plate', type: 'text' }, { key: 'Mileage', type: 'text' }] },
      { id: 'cat_lab', name: 'Lab Equipment', description: 'Testing and lab devices', customFields: [{ key: 'Calibration Date', type: 'date' }] },
      { id: 'cat_off', name: 'Office Supplies', description: 'Printers, projectors, etc.', customFields: [] },
      { id: 'cat_space', name: 'Spaces & Rooms', description: 'Meeting rooms, halls, parking', customFields: [{ key: 'Capacity', type: 'text' }] }
    ];
    cats.forEach(c => Store.create('categories', c));

    // ---- Employees ----
    const empHash = await Auth.hashPassword('password123');
    const employees = [
      { id: 'user_e1', name: 'Priya Sharma', email: 'priya@assetflow.com', role: 'DeptHead', departmentId: 'dept_it' },
      { id: 'user_e2', name: 'Raj Patel', email: 'raj@assetflow.com', role: 'Employee', departmentId: 'dept_it' },
      { id: 'user_e3', name: 'Ananya Gupta', email: 'ananya@assetflow.com', role: 'AssetManager', departmentId: 'dept_ops' },
      { id: 'user_e4', name: 'Vikram Singh', email: 'vikram@assetflow.com', role: 'Employee', departmentId: 'dept_it' },
      { id: 'user_e5', name: 'Meera Joshi', email: 'meera@assetflow.com', role: 'DeptHead', departmentId: 'dept_hr' },
      { id: 'user_e6', name: 'Arjun Nair', email: 'arjun@assetflow.com', role: 'Employee', departmentId: 'dept_hr' },
      { id: 'user_e7', name: 'Kavitha Raman', email: 'kavitha@assetflow.com', role: 'Employee', departmentId: 'dept_ops' },
      { id: 'user_e8', name: 'Suresh Kumar', email: 'suresh@assetflow.com', role: 'DeptHead', departmentId: 'dept_fin' },
      { id: 'user_e9', name: 'Deepa Menon', email: 'deepa@assetflow.com', role: 'Employee', departmentId: 'dept_fin' },
      { id: 'user_e10', name: 'Rahul Verma', email: 'rahul@assetflow.com', role: 'Employee', departmentId: 'dept_fac' },
      { id: 'user_e11', name: 'Sunita Rao', email: 'sunita@assetflow.com', role: 'DeptHead', departmentId: 'dept_fac' },
      { id: 'user_e12', name: 'Amit Chopra', email: 'amit@assetflow.com', role: 'Employee', departmentId: 'dept_it' },
      { id: 'user_e13', name: 'Nisha Kapoor', email: 'nisha@assetflow.com', role: 'Employee', departmentId: 'dept_ops' },
      { id: 'user_e14', name: 'Karthik Iyer', email: 'karthik@assetflow.com', role: 'AssetManager', departmentId: 'dept_it' },
      { id: 'user_e15', name: 'Pooja Reddy', email: 'pooja@assetflow.com', role: 'Employee', departmentId: 'dept_hr' }
    ];
    employees.forEach(e => Store.create('users', {
      ...e,
      passwordHash: empHash,
      status: 'Active'
    }));

    // Update department heads
    Store.update('departments', 'dept_it', { headId: 'user_e1' });
    Store.update('departments', 'dept_hr', { headId: 'user_e5' });
    Store.update('departments', 'dept_fin', { headId: 'user_e8' });
    Store.update('departments', 'dept_fac', { headId: 'user_e11' });

    // ---- Assets ----
    const assets = [
      { id: 'asset_1', name: 'Dell Latitude 5540', assetTag: 'AF-0001', serialNumber: 'DL5540-A1B2C3', categoryId: 'cat_elec', acquisitionDate: '2024-01-15', cost: 1200, condition: 'Good', location: 'Floor 2, IT Lab', status: 'Allocated', departmentId: 'dept_it', isBookable: false },
      { id: 'asset_2', name: 'Dell Latitude 5540', assetTag: 'AF-0002', serialNumber: 'DL5540-D4E5F6', categoryId: 'cat_elec', acquisitionDate: '2024-01-15', cost: 1200, condition: 'Good', location: 'Floor 2, IT Lab', status: 'Available', departmentId: 'dept_it', isBookable: false },
      { id: 'asset_3', name: 'MacBook Pro 16"', assetTag: 'AF-0003', serialNumber: 'MBP16-X7Y8Z9', categoryId: 'cat_elec', acquisitionDate: '2024-03-10', cost: 2400, condition: 'New', location: 'Floor 3, Dev Area', status: 'Allocated', departmentId: 'dept_it', isBookable: false },
      { id: 'asset_4', name: 'HP LaserJet Pro', assetTag: 'AF-0004', serialNumber: 'HPLJ-PRO-001', categoryId: 'cat_off', acquisitionDate: '2023-06-20', cost: 450, condition: 'Good', location: 'Floor 1, Print Room', status: 'Available', departmentId: 'dept_ops', isBookable: true },
      { id: 'asset_5', name: 'Herman Miller Aeron Chair', assetTag: 'AF-0005', serialNumber: 'HM-AERON-101', categoryId: 'cat_furn', acquisitionDate: '2023-09-01', cost: 800, condition: 'Good', location: 'Floor 2', status: 'Allocated', departmentId: 'dept_it', isBookable: false },
      { id: 'asset_6', name: 'Conference Room A', assetTag: 'AF-0006', serialNumber: 'ROOM-A-001', categoryId: 'cat_space', acquisitionDate: '2022-01-01', cost: 0, condition: 'Good', location: 'Floor 1', status: 'Available', departmentId: 'dept_fac', isBookable: true },
      { id: 'asset_7', name: 'Conference Room B', assetTag: 'AF-0007', serialNumber: 'ROOM-B-001', categoryId: 'cat_space', acquisitionDate: '2022-01-01', cost: 0, condition: 'Good', location: 'Floor 2', status: 'Available', departmentId: 'dept_fac', isBookable: true },
      { id: 'asset_8', name: 'Toyota Innova', assetTag: 'AF-0008', serialNumber: 'TI-MH12AB1234', categoryId: 'cat_vehi', acquisitionDate: '2023-04-15', cost: 25000, condition: 'Good', location: 'Parking Lot B', status: 'Available', departmentId: 'dept_ops', isBookable: true },
      { id: 'asset_9', name: 'Epson Projector EB-X51', assetTag: 'AF-0009', serialNumber: 'EPSON-EB-X51-01', categoryId: 'cat_off', acquisitionDate: '2023-08-10', cost: 600, condition: 'Good', location: 'Floor 1, AV Room', status: 'Available', departmentId: 'dept_fac', isBookable: true },
      { id: 'asset_10', name: 'Standing Desk', assetTag: 'AF-0010', serialNumber: 'SD-UPLIFT-202', categoryId: 'cat_furn', acquisitionDate: '2024-02-01', cost: 550, condition: 'New', location: 'Floor 3', status: 'Available', departmentId: 'dept_it', isBookable: false },
      { id: 'asset_11', name: 'Dell Monitor 27"', assetTag: 'AF-0011', serialNumber: 'DELL-U2723-01', categoryId: 'cat_elec', acquisitionDate: '2024-01-20', cost: 350, condition: 'Good', location: 'Floor 2', status: 'Under Maintenance', departmentId: 'dept_it', isBookable: false },
      { id: 'asset_12', name: 'Cisco IP Phone', assetTag: 'AF-0012', serialNumber: 'CISCO-8845-03', categoryId: 'cat_elec', acquisitionDate: '2023-05-15', cost: 200, condition: 'Fair', location: 'Floor 1, Reception', status: 'Available', departmentId: 'dept_ops', isBookable: false },
      { id: 'asset_13', name: 'Oscilloscope Keysight', assetTag: 'AF-0013', serialNumber: 'KS-DSOX1204G', categoryId: 'cat_lab', acquisitionDate: '2024-06-01', cost: 3500, condition: 'New', location: 'Lab 1', status: 'Available', departmentId: 'dept_ops', isBookable: true },
      { id: 'asset_14', name: 'Filing Cabinet 4-Drawer', assetTag: 'AF-0014', serialNumber: 'FC-STEEL-401', categoryId: 'cat_furn', acquisitionDate: '2022-03-10', cost: 180, condition: 'Fair', location: 'Floor 1, HR', status: 'Allocated', departmentId: 'dept_hr', isBookable: false },
      { id: 'asset_15', name: 'Whiteboard 6x4', assetTag: 'AF-0015', serialNumber: 'WB-MAGNETIC-01', categoryId: 'cat_off', acquisitionDate: '2023-01-15', cost: 120, condition: 'Good', location: 'Floor 2, Training Room', status: 'Available', departmentId: 'dept_fac', isBookable: false },
      { id: 'asset_16', name: 'Dell Latitude 7440', assetTag: 'AF-0016', serialNumber: 'DL7440-RETIRED', categoryId: 'cat_elec', acquisitionDate: '2019-06-01', cost: 900, condition: 'Poor', location: 'Storage', status: 'Retired', departmentId: 'dept_it', isBookable: false },
      { id: 'asset_17', name: 'Samsung Galaxy Tab S9', assetTag: 'AF-0017', serialNumber: 'SGT-S9-FE-01', categoryId: 'cat_elec', acquisitionDate: '2024-09-10', cost: 450, condition: 'New', location: 'Floor 3', status: 'Reserved', departmentId: 'dept_it', isBookable: false },
      { id: 'asset_18', name: 'Training Room 1', assetTag: 'AF-0018', serialNumber: 'ROOM-TR1-001', categoryId: 'cat_space', acquisitionDate: '2022-01-01', cost: 0, condition: 'Good', location: 'Floor 3', status: 'Available', departmentId: 'dept_fac', isBookable: true },
      { id: 'asset_19', name: 'Honda City', assetTag: 'AF-0019', serialNumber: 'HC-MH14CD5678', categoryId: 'cat_vehi', acquisitionDate: '2024-01-20', cost: 18000, condition: 'New', location: 'Parking Lot A', status: 'Available', departmentId: 'dept_ops', isBookable: true },
      { id: 'asset_20', name: 'Network Switch 48-Port', assetTag: 'AF-0020', serialNumber: 'CISCO-C9300-48', categoryId: 'cat_elec', acquisitionDate: '2023-11-01', cost: 4200, condition: 'Good', location: 'Server Room', status: 'Allocated', departmentId: 'dept_it', isBookable: false },
      { id: 'asset_21', name: 'Ergonomic Keyboard', assetTag: 'AF-0021', serialNumber: 'LOGI-ERGO-K860', categoryId: 'cat_elec', acquisitionDate: '2024-04-01', cost: 130, condition: 'New', location: 'Floor 2', status: 'Available', departmentId: 'dept_it', isBookable: false },
      { id: 'asset_22', name: 'Security Camera System', assetTag: 'AF-0022', serialNumber: 'HIKVISION-NVR01', categoryId: 'cat_elec', acquisitionDate: '2023-02-15', cost: 2800, condition: 'Good', location: 'Security Office', status: 'Allocated', departmentId: 'dept_fac', isBookable: false },
      { id: 'asset_23', name: 'Executive Desk', assetTag: 'AF-0023', serialNumber: 'ED-MAHOGANY-01', categoryId: 'cat_furn', acquisitionDate: '2023-07-20', cost: 950, condition: 'Good', location: 'Floor 4, MD Office', status: 'Allocated', departmentId: 'dept_fin', isBookable: false },
      { id: 'asset_24', name: 'Broken Projector', assetTag: 'AF-0024', serialNumber: 'PROJ-OLD-001', categoryId: 'cat_off', acquisitionDate: '2020-01-10', cost: 400, condition: 'Poor', location: 'Storage', status: 'Disposed', departmentId: 'dept_fac', isBookable: false },
      { id: 'asset_25', name: 'UPS 3kVA', assetTag: 'AF-0025', serialNumber: 'APC-SMT3000', categoryId: 'cat_elec', acquisitionDate: '2023-09-15', cost: 1800, condition: 'Good', location: 'Server Room', status: 'Allocated', departmentId: 'dept_it', isBookable: false }
    ];
    assets.forEach(a => Store.create('assets', a));

    // ---- Allocations ----
    const today = new Date();
    const allocations = [
      { id: 'alloc_1', assetId: 'asset_1', employeeId: 'user_e1', departmentId: 'dept_it', allocatedDate: '2024-02-01', expectedReturnDate: '2025-02-01', status: 'Active' },
      { id: 'alloc_2', assetId: 'asset_3', employeeId: 'user_e4', departmentId: 'dept_it', allocatedDate: '2024-04-01', expectedReturnDate: null, status: 'Active' },
      { id: 'alloc_3', assetId: 'asset_5', employeeId: 'user_e2', departmentId: 'dept_it', allocatedDate: '2024-01-15', expectedReturnDate: '2026-06-30', status: 'Active' },
      { id: 'alloc_4', assetId: 'asset_14', employeeId: 'user_e5', departmentId: 'dept_hr', allocatedDate: '2023-03-01', expectedReturnDate: null, status: 'Active' },
      { id: 'alloc_5', assetId: 'asset_20', employeeId: 'user_e14', departmentId: 'dept_it', allocatedDate: '2023-12-01', expectedReturnDate: null, status: 'Active' },
      { id: 'alloc_6', assetId: 'asset_22', employeeId: 'user_e11', departmentId: 'dept_fac', allocatedDate: '2023-03-01', expectedReturnDate: null, status: 'Active' },
      { id: 'alloc_7', assetId: 'asset_23', employeeId: 'user_e8', departmentId: 'dept_fin', allocatedDate: '2023-08-01', expectedReturnDate: null, status: 'Active' },
      { id: 'alloc_8', assetId: 'asset_25', employeeId: 'user_e14', departmentId: 'dept_it', allocatedDate: '2023-10-01', expectedReturnDate: null, status: 'Active' }
    ];
    allocations.forEach(a => Store.create('allocations', a));

    // ---- Bookings ----
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const dayAfter = new Date(today); dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];

    const bookings = [
      { id: 'book_1', assetId: 'asset_6', userId: 'user_e1', date: todayStr, startTime: '09:00', endTime: '10:00', purpose: 'Sprint Planning', notes: 'Need projector setup', status: 'Upcoming' },
      { id: 'book_2', assetId: 'asset_6', userId: 'user_e3', date: todayStr, startTime: '14:00', endTime: '15:30', purpose: 'Client Review', notes: '', status: 'Upcoming' },
      { id: 'book_3', assetId: 'asset_7', userId: 'user_e5', date: tomorrowStr, startTime: '10:00', endTime: '11:00', purpose: 'HR Policy Meeting', notes: '', status: 'Upcoming' },
      { id: 'book_4', assetId: 'asset_8', userId: 'user_e7', date: tomorrowStr, startTime: '08:00', endTime: '17:00', purpose: 'Site Visit — Warehouse', notes: 'Full day trip', status: 'Upcoming' },
      { id: 'book_5', assetId: 'asset_18', userId: 'user_e14', date: dayAfterStr, startTime: '09:00', endTime: '12:00', purpose: 'New Employee Onboarding', notes: 'Batch of 5 new hires', status: 'Upcoming' }
    ];
    bookings.forEach(b => Store.create('bookings', b));

    // ---- Maintenance Requests ----
    const maintenanceRequests = [
      { id: 'maint_1', assetId: 'asset_11', reportedBy: 'user_e2', description: 'Screen flickering intermittently. Possible backlight issue.', priority: 'High', status: 'Approved', assignedTo: null, resolutionNotes: null, resolutionCost: null, createdAt: '2026-07-10T10:30:00Z' },
      { id: 'maint_2', assetId: 'asset_12', reportedBy: 'user_e7', description: 'Phone not receiving calls. Dial tone works but incoming calls drop.', priority: 'Medium', status: 'Pending', assignedTo: null, resolutionNotes: null, resolutionCost: null, createdAt: '2026-07-11T14:00:00Z' },
      { id: 'maint_3', assetId: 'asset_4', reportedBy: 'user_e13', description: 'Paper jam occurring frequently, needs roller replacement.', priority: 'Low', status: 'Resolved', assignedTo: 'user_e10', resolutionNotes: 'Replaced pickup roller. Test prints successful.', resolutionCost: 45, createdAt: '2026-07-05T09:00:00Z', resolvedAt: '2026-07-07T16:00:00Z' }
    ];
    maintenanceRequests.forEach(m => Store.create('maintenance_requests', m));

    // ---- Audit Cycle ----
    Store.create('audit_cycles', {
      id: 'audit_1',
      name: 'Q3 2026 IT Asset Audit',
      scope: 'department',
      scopeValue: 'dept_it',
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      auditorIds: ['user_e3', 'user_e14'],
      status: 'In Progress'
    });

    // Audit items for IT assets
    const itAssets = assets.filter(a => a.departmentId === 'dept_it');
    itAssets.forEach((a, i) => {
      Store.create('audit_items', {
        id: `ai_${i + 1}`,
        auditCycleId: 'audit_1',
        assetId: a.id,
        status: i < 3 ? 'Verified' : 'Pending',
        notes: i < 3 ? 'Asset verified at location' : '',
        checkedBy: i < 3 ? 'user_e3' : null,
        checkedAt: i < 3 ? '2026-07-10T10:00:00Z' : null
      });
    });

    // ---- Sample Notifications ----
    const notifications = [
      { userId: 'user_e1', type: 'BOOKING_CONFIRMED', message: 'Your booking for Conference Room A on today at 9:00 AM has been confirmed.', isRead: false },
      { userId: 'user_e2', type: 'OVERDUE_RETURN', message: 'The Herman Miller Aeron Chair (AF-0005) was due for return on Jun 30. Please return or request an extension.', isRead: false },
      { userId: 'user_e3', type: 'AUDIT_ASSIGNED', message: 'You have been assigned as an auditor for "Q3 2026 IT Asset Audit". Please begin verifying assets.', isRead: true },
      { userId: 'user_e2', type: 'MAINTENANCE_APPROVED', message: 'Your maintenance request for Dell Monitor 27" (AF-0011) has been approved.', isRead: false },
      { userId: 'user_admin', type: 'GENERAL', message: 'Welcome to AssetFlow! Start by setting up departments and importing your asset register.', isRead: false }
    ];
    notifications.forEach(n => Store.create('notifications', n));

    // ---- Sample Activity Logs ----
    const logs = [
      { userId: 'user_admin', action: 'SYSTEM_INIT', targetType: 'system', targetId: null, details: 'AssetFlow system initialized with seed data' },
      { userId: 'user_e3', action: 'ASSET_REGISTERED', targetType: 'asset', targetId: 'asset_1', details: 'Registered Dell Latitude 5540 (AF-0001)' },
      { userId: 'user_admin', action: 'ASSET_ALLOCATED', targetType: 'asset', targetId: 'asset_1', details: 'Allocated Dell Latitude 5540 to Priya Sharma' },
      { userId: 'user_e2', action: 'MAINTENANCE_RAISED', targetType: 'maintenance', targetId: 'maint_1', details: 'Raised maintenance request for Dell Monitor 27" — screen flickering' },
      { userId: 'user_e1', action: 'BOOKING_CREATED', targetType: 'booking', targetId: 'book_1', details: 'Booked Conference Room A for Sprint Planning' }
    ];
    logs.forEach(l => Store.create('activity_logs', l));

    Store.markSeeded();
    console.log('AssetFlow: Seed data loaded successfully.');
  }
};
