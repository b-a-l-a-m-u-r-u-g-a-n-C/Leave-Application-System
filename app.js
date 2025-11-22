// Application state
let currentUser = null;
let isAdmin = false;
let applications = [];
let studentIdCounter = 1;
let applicationIdCounter = 1;
let leaveBalance = 12; // Initial leave balance

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Show student registration fields by default
    document.getElementById('studentRegistration').style.display = 'block';
    
    // Set minimum date for date inputs to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fromDate').min = today;
    document.getElementById('toDate').min = today;
    
    // Initialize event listeners
    initializeEventListeners();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Login functionality
    document.querySelectorAll('.user-type').forEach(type => {
        type.addEventListener('click', function() {
            document.querySelectorAll('.user-type').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide student registration fields
            const studentRegistration = document.getElementById('studentRegistration');
            if (this.dataset.type === 'student') {
                studentRegistration.style.display = 'block';
            } else {
                studentRegistration.style.display = 'none';
            }
        });
    });
    
    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Navigation functionality
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Leave form submission
    document.getElementById('leaveForm').addEventListener('submit', handleLeaveSubmission);
    
    // Modal close functionality
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('detailsModal')) {
            closeModal();
        }
    });
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.querySelector('.user-type.active').dataset.type;
    
    // Simple authentication (in a real app, this would be server-side)
    if (username && password) {
        if (userType === 'admin' && username === 'admin' && password === 'admin123') {
            // Admin login successful
            currentUser = { 
                name: 'Admin User', 
                type: 'admin',
                id: 'ADMIN001',
                role: 'Administrator'
            };
            isAdmin = true;
            showNotification('Admin login successful!', 'success');
        } else if (userType === 'student' && username === 'student' && password === 'student123') {
            // Student login successful - get registration details
            const studentName = document.getElementById('studentName').value;
            const studentReg = document.getElementById('studentReg').value;
            const studentDepartment = document.getElementById('studentDepartment').value;
            const studentYear = document.getElementById('studentYear').value;
            
            if (!studentName || !studentReg || !studentDepartment || !studentYear) {
                showNotification('Please fill all student registration details', 'error');
                return;
            }
            
            // Generate student ID
            const studentId = `STU${new Date().getFullYear()}${studentIdCounter.toString().padStart(3, '0')}`;
            
            currentUser = { 
                name: studentName, 
                type: 'student',
                id: studentId,
                registrationNo: studentReg,
                department: studentDepartment,
                year: studentYear,
                advisor: getAdvisorByDepartment(studentDepartment),
                role: 'Student'
            };
            isAdmin = false;
            studentIdCounter++;
            showNotification('Student login successful!', 'success');
        } else {
            showNotification('Invalid credentials. Try admin/admin123 or student/student123', 'error');
            return;
        }
        
        // Update UI for logged in user
        updateUserInterface();
    }
}

// Get advisor by department
function getAdvisorByDepartment(department) {
    const advisors = {
        'Computer Science': 'Dr. Smith',
        'Electrical Engineering': 'Dr. Johnson',
        'Mechanical Engineering': 'Dr. Williams',
        'Civil Engineering': 'Dr. Brown'
    };
    return advisors[department] || 'Dr. Advisor';
}

// Update user interface after login
function updateUserInterface() {
    document.getElementById('userDisplayName').textContent = currentUser.name;
    document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=3498db&color=fff`;
    document.getElementById('logoutBtn').style.display = 'inline-block';
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appContent').style.display = 'block';
    
    // Update navigation based on user type
    updateNavigation();
    
    // Update profile information
    updateProfile();
    
    // Update dashboard and application data
    updateDashboard();
    updateLeaveHistory();
    updatePendingApprovals();
}

// Update navigation based on user type
function updateNavigation() {
    const applyNav = document.getElementById('applyNav');
    const pendingNav = document.getElementById('pendingNav');
    
    if (isAdmin) {
        // Admin navigation
        applyNav.parentElement.style.display = 'none';
        pendingNav.parentElement.style.display = 'list-item';
        
        // Show admin message on apply page
        document.getElementById('adminApplyMessage').style.display = 'block';
        document.getElementById('studentApplyForm').style.display = 'none';
    } else {
        // Student navigation
        applyNav.parentElement.style.display = 'list-item';
        pendingNav.parentElement.style.display = 'none';
        
        // Show student form on apply page
        document.getElementById('adminApplyMessage').style.display = 'none';
        document.getElementById('studentApplyForm').style.display = 'block';
        
        // Update student form fields
        document.getElementById('studentId').value = currentUser.id;
        document.getElementById('studentFullName').value = currentUser.name;
        document.getElementById('studentRegNo').value = currentUser.registrationNo;
    }
}

// Update profile information
function updateProfile() {
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=3498db&color=fff`;
    document.getElementById('profileRole').textContent = currentUser.role;
    document.getElementById('profileUserId').textContent = currentUser.id;
    
    if (currentUser.type === 'student') {
        // Student profile details
        document.getElementById('profileRegNo').textContent = currentUser.registrationNo;
        document.getElementById('profileDepartment').textContent = currentUser.department;
        document.getElementById('profileAdvisor').textContent = currentUser.advisor;
        document.getElementById('profileYear').textContent = currentUser.year;
        document.getElementById('profileLeaveBalance').textContent = leaveBalance + ' days';
        
        // Show student-specific profile items
        document.getElementById('profileRegItem').style.display = 'block';
        document.getElementById('profileAdvisorItem').style.display = 'block';
        document.getElementById('profileLeaveItem').style.display = 'block';
        document.getElementById('profileYearItem').style.display = 'block';
    } else {
        // Admin profile details
        document.getElementById('profileDepartment').textContent = 'Administration';
        
        // Hide student-specific profile items
        document.getElementById('profileRegItem').style.display = 'none';
        document.getElementById('profileAdvisorItem').style.display = 'none';
        document.getElementById('profileLeaveItem').style.display = 'none';
        document.getElementById('profileYearItem').style.display = 'none';
    }
}

// Update dashboard with user-specific data
function updateDashboard() {
    if (currentUser.type === 'student') {
        const userApplications = applications.filter(app => app.studentId === currentUser.id);
        const pendingCount = userApplications.filter(app => app.status === 'pending').length;
        const approvedCount = userApplications.filter(app => app.status === 'approved').length;
        
        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('approvedCount').textContent = approvedCount;
        document.getElementById('leaveBalance').textContent = leaveBalance + ' Days';
        document.getElementById('profilePending').textContent = pendingCount;
        document.getElementById('profileApproved').textContent = approvedCount;
        document.getElementById('profileRejected').textContent = userApplications.filter(app => app.status === 'rejected').length;
        document.getElementById('totalApplications').textContent = userApplications.length;
        
        // Update recent applications table
        const recentApps = userApplications.slice(0, 3);
        updateApplicationsTable(recentApps, 'recentApplicationsContainer');
    } else {
        // Admin dashboard
        const pendingCount = applications.filter(app => app.status === 'pending').length;
        const approvedCount = applications.filter(app => app.status === 'approved').length;
        
        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('approvedCount').textContent = approvedCount;
        
        // Update recent applications table with all applications
        const recentApps = applications.slice(0, 3);
        updateApplicationsTable(recentApps, 'recentApplicationsContainer');
    }
}

// Update applications table
function updateApplicationsTable(apps, containerId) {
    const container = document.getElementById(containerId);
    
    if (apps.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No Applications Found</h3>
                <p>${currentUser.type === 'student' ? 'You haven\'t submitted any leave applications yet.' : 'No leave applications have been submitted yet.'}</p>
            </div>
        `;
        return;
    }
    
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Application ID</th>
                    <th>Leave Type</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    apps.forEach(app => {
        tableHTML += `
            <tr>
                <td>${app.id}</td>
                <td>${app.type}</td>
                <td>${app.fromDate}</td>
                <td>${app.toDate}</td>
                <td><span class="status status-${app.status}">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span></td>
                <td><button class="btn view-details">View Details</button></td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
    
    // Add event listeners to view details buttons
    document.querySelectorAll(`#${containerId} .view-details`).forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const appId = row.cells[0].textContent;
            viewApplicationDetails(appId);
        });
    });
}

// Update leave history table
function updateLeaveHistory() {
    let userApplications = [];
    if (currentUser.type === 'student') {
        userApplications = applications.filter(app => app.studentId === currentUser.id);
    } else {
        userApplications = applications;
    }
    
    updateApplicationsTable(userApplications, 'leaveHistoryContainer');
}

// Update pending approvals table (admin only)
function updatePendingApprovals() {
    if (isAdmin) {
        const pendingApps = applications.filter(app => app.status === 'pending');
        const container = document.getElementById('pendingApprovalsContainer');
        
        if (pendingApps.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>No Pending Approvals</h3>
                    <p>All leave applications have been processed. No pending approvals at this time.</p>
                </div>
            `;
            return;
        }
        
        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Application ID</th>
                        <th>Student Name</th>
                        <th>Registration No</th>
                        <th>Leave Type</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Current Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        pendingApps.forEach(app => {
            tableHTML += `
                <tr>
                    <td>${app.id}</td>
                    <td>${app.studentName}</td>
                    <td>${app.registrationNo}</td>
                    <td>${app.type}</td>
                    <td>${app.fromDate}</td>
                    <td>${app.toDate}</td>
                    <td><span class="status status-pending">Pending</span></td>
                    <td>
                        <button class="btn btn-success approve-btn">Approve</button>
                        <button class="btn btn-danger reject-btn">Reject</button>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        container.innerHTML = tableHTML;
        
        // Add event listeners to approve/reject buttons
        document.querySelectorAll('.approve-btn, .reject-btn').forEach(button => {
            button.addEventListener('click', function() {
                const action = this.classList.contains('approve-btn') ? 'approved' : 'rejected';
                const row = this.closest('tr');
                const applicationId = row.cells[0].textContent;
                
                // Update application status
                const appIndex = applications.findIndex(app => app.id === applicationId);
                if (appIndex !== -1) {
                    applications[appIndex].status = action;
                    applications[appIndex].processedOn = new Date().toISOString().split('T')[0];
                    
                    // Update leave balance if approved
                    if (action === 'approved') {
                        const app = applications[appIndex];
                        const fromDate = new Date(app.fromDate);
                        const toDate = new Date(app.toDate);
                        const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
                        leaveBalance = Math.max(0, leaveBalance - days);
                    }
                    
                    // Show notification
                    showNotification(`Application ${applicationId} ${action} successfully!`, 'success');
                    
                    // Simulate email notification to student
                    const studentName = applications[appIndex].studentName;
                    simulateEmailNotification(studentName, `Your leave application has been ${action}`);
                    
                    // Update all tables
                    updateDashboard();
                    updateLeaveHistory();
                    updatePendingApprovals();
                }
            });
        });
    }
}

// View application details
function viewApplicationDetails(appId) {
    const app = applications.find(a => a.id === appId);
    if (app) {
        const modalContent = `
            <p><strong>Application ID:</strong> ${app.id}</p>
            <p><strong>Student Name:</strong> ${app.studentName}</p>
            <p><strong>Registration No:</strong> ${app.registrationNo}</p>
            <p><strong>Student ID:</strong> ${app.studentId}</p>
            <p><strong>Leave Type:</strong> ${app.type}</p>
            <p><strong>From Date:</strong> ${app.fromDate}</p>
            <p><strong>To Date:</strong> ${app.toDate}</p>
            <p><strong>Status:</strong> ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</p>
            <p><strong>Reason:</strong> ${app.reason}</p>
            <p><strong>Submitted On:</strong> ${app.submittedOn}</p>
            ${app.status !== 'pending' ? `<p><strong>Processed On:</strong> ${app.processedOn || new Date().toISOString().split('T')[0]}</p>` : ''}
        `;
        
        document.getElementById('modalContent').innerHTML = modalContent;
        document.getElementById('detailsModal').style.display = 'flex';
    }
}

// Handle logout
function handleLogout() {
    currentUser = null;
    isAdmin = false;
    
    // Reset UI
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appContent').style.display = 'none';
    document.getElementById('loginForm').reset();
    
    // Show student registration fields by default
    document.getElementById('studentRegistration').style.display = 'block';
    
    showNotification('Logged out successfully', 'success');
}

// Handle navigation
function handleNavigation(e) {
    e.preventDefault();
    
    // Remove active class from all links and pages
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    
    // Add active class to clicked link
    this.classList.add('active');
    
    // Show corresponding page
    const pageId = this.dataset.page + 'Page';
    document.getElementById(pageId).classList.add('active');
}

// Handle leave form submission
function handleLeaveSubmission(e) {
    e.preventDefault();
    
    // Get form values
    const leaveType = document.getElementById('leaveType').value;
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    const reason = document.getElementById('reason').value;
    
    // Calculate leave days
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const leaveDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    
    // Check if sufficient leave balance is available
    if (leaveDays > leaveBalance) {
        showNotification(`Insufficient leave balance. You have ${leaveBalance} days remaining but requested ${leaveDays} days.`, 'error');
        return;
    }
    
    // Create new application
    const newApp = {
        id: `APP${new Date().getFullYear()}${applicationIdCounter.toString().padStart(4, '0')}`,
        studentId: currentUser.id,
        studentName: currentUser.name,
        registrationNo: currentUser.registrationNo,
        type: leaveType,
        fromDate: fromDate,
        toDate: toDate,
        reason: reason,
        status: 'pending',
        submittedOn: new Date().toISOString().split('T')[0],
        leaveDays: leaveDays
    };
    
    // Add to applications array
    applications.push(newApp);
    applicationIdCounter++;
    
    // Show success message
    showNotification('Leave application submitted successfully!', 'success');
    
    // Reset form (except student info)
    document.getElementById('leaveType').value = '';
    document.getElementById('fromDate').value = '';
    document.getElementById('toDate').value = '';
    document.getElementById('reason').value = '';
    document.getElementById('documents').value = '';
    
    // Update dashboard and tables
    updateDashboard();
    updateLeaveHistory();
    updatePendingApprovals();
    
    // Simulate email notification
    simulateEmailNotification('Class Advisor', `New leave application from ${currentUser.name}`);
}

// Close modal
function closeModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

// Notification function
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.className = 'notification';
    notification.classList.add(`notification-${type}`, 'show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Simulate email notification (in a real app, this would be a server-side function)
function simulateEmailNotification(recipient, message) {
    console.log(`Email sent to ${recipient}: ${message}`);
    // In a real application, you would integrate with an email service like SendGrid, Mailgun, etc.
}