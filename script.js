// State Management
let currentRole = 'customer'; // 'customer' | 'employee'
let currentMode = 'login';    // 'login' | 'signup'

// DOM Elements
const customerTab = document.getElementById('customerTab');
const employeeTab = document.getElementById('employeeTab');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');

const formTitle = document.getElementById('formTitle');
const formSubTitle = document.getElementById('formSubTitle');
const identifierLabel = document.getElementById('identifierLabel');
const identifierInput = document.getElementById('identifier');
const submitBtn = document.getElementById('submitBtn');
const alertBox = document.getElementById('alertBox');

const signupOnlyFields = document.querySelectorAll('.signup-only');
const loginOnlyFields = document.querySelectorAll('.login-only');
const customerOnlyFields = document.querySelectorAll('.customer-only');
const employeeOnlyFields = document.querySelectorAll('.employee-only');

// Switch Role (Customer vs Employee)
function switchRole(role) {
    currentRole = role;

    if (role === 'customer') {
        customerTab.classList.add('active');
        employeeTab.classList.remove('active');
    } else {
        employeeTab.classList.add('active');
        customerTab.classList.remove('active');
    }

    updateFormUI();
}

// Switch Mode (Login vs Sign Up)
function switchMode(mode) {
    currentMode = mode;

    if (mode === 'login') {
        loginBtn.classList.add('active');
        signupBtn.classList.remove('active');
    } else {
        signupBtn.classList.add('active');
        loginBtn.classList.remove('active');
    }

    updateFormUI();
}

// Update UI fields based on active role and mode
function updateFormUI() {
    hideAlert();

    const roleName = currentRole === 'customer' ? 'Customer' : 'Employee';
    const modeName = currentMode === 'login' ? 'Login' : 'Sign Up';

    // Header & Subtext
    formTitle.textContent = `${roleName} ${modeName}`;
    if (currentMode === 'login') {
        formSubTitle.textContent = `Enter your credentials to access your ${roleName.toLowerCase()} portal.`;
        submitBtn.textContent = `Log In as ${roleName}`;
    } else {
        formSubTitle.textContent = `Create a new ${roleName.toLowerCase()} account for WareFlow.`;
        submitBtn.textContent = `Sign Up as ${roleName}`;
    }

    // Input Labels & Placeholders
    if (currentRole === 'customer') {
        identifierLabel.textContent = 'Email Address';
        identifierInput.placeholder = 'e.g. customer@wareflow.com';
    } else {
        identifierLabel.textContent = 'Employee ID / Staff Email';
        identifierInput.placeholder = 'e.g. EMP-4092 or staff@wareflow.com';
    }

    // Toggle Field Visibilities
    signupOnlyFields.forEach(field => {
        field.classList.toggle('hidden', currentMode !== 'signup');
    });

    loginOnlyFields.forEach(field => {
        field.classList.toggle('hidden', currentMode !== 'login');
    });

    employeeOnlyFields.forEach(field => {
        if (currentRole === 'employee') {
            if (field.classList.contains('signup-only')) {
                field.classList.toggle('hidden', currentMode !== 'signup');
            } else {
                field.classList.remove('hidden');
            }
        } else {
            field.classList.add('hidden');
        }
    });

    customerOnlyFields.forEach(field => {
        field.classList.toggle('hidden', !(currentRole === 'customer' && currentMode === 'signup'));
    });
}

// Password Visibility Toggle
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-pwd');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = 'Hide';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = 'Show';
    }
}

// Display Notification Alerts
function showAlert(message, type = 'error') {
    alertBox.textContent = message;
    alertBox.className = `alert-box ${type}`;
}

function hideAlert() {
    alertBox.className = 'alert-box hidden';
    alertBox.textContent = '';
}

// Forgot Password Handler
function handleForgotPassword(event) {
    event.preventDefault();
    const idVal = identifierInput.value.trim();
    if (!idVal) {
        showAlert('Please enter your Email or Employee ID above to reset password.', 'error');
    } else {
        showAlert(`Password reset link sent to ${idVal}. Please check your inbox.`, 'success');
    }
}

// Form Submission Handler
function handleFormSubmit(event) {
    event.preventDefault();

    const idVal = identifierInput.value.trim();
    const pwdVal = document.getElementById('password').value.trim();

    if (!idVal || !pwdVal) {
        showAlert('Please fill in all required fields.', 'error');
        return;
    }

    if (currentMode === 'signup') {
        const confirmPwd = document.getElementById('confirmPassword').value.trim();
        if (pwdVal !== confirmPwd) {
            showAlert('Passwords do not match! Please check and try again.', 'error');
            return;
        }

        if (currentRole === 'employee') {
            const empCode = document.getElementById('employeeCode').value.trim();
            if (!empCode) {
                showAlert('Please enter Employee Access Code to register as Staff.', 'error');
                return;
            }
        }
    }

    // Process Login & Redirect
    processLogin(idVal);
}

// Redirect user to their respective portal
function processLogin(userIdentifier) {
    if (currentRole === 'customer') {
        const custName = userIdentifier.includes('@') ? userIdentifier.split('@')[0] : userIdentifier;
        const formattedName = custName.charAt(0).toUpperCase() + custName.slice(1);
        localStorage.setItem('wareflow_cust_name', formattedName);
        window.location.href = "customer_dashboard.html";
    } else {
        const staffName = userIdentifier.includes('@') ? userIdentifier.split('@')[0] : userIdentifier;
        const formattedName = staffName.charAt(0).toUpperCase() + staffName.slice(1);
        const deptSelect = document.getElementById('department');
        const deptText = (deptSelect && deptSelect.options[deptSelect.selectedIndex]) 
            ? deptSelect.options[deptSelect.selectedIndex].text 
            : "Central Warehouse - Hub A";

        localStorage.setItem('wareflow_emp_name', formattedName);
        if (deptText && !deptText.includes('Select')) {
            localStorage.setItem('wareflow_emp_dept', deptText);
        }
        window.location.href = "employee_dashboard.html";
    }
}

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', () => {
    updateFormUI();
});
