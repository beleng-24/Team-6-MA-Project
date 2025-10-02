// Simple customer order page functionality

// Handle form submission
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent page reload
    
    // Show loading state
    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Processing...';
    btn.disabled = true;
    
    // Hide any previous messages
    hideMessages();
    
    // Get form data
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const cardNumber = document.getElementById('cardNumber').value;
    
    // Basic validation
    if (!firstName || !lastName || !cardNumber) {
        showError('Please fill in all required fields');
        resetButton();
        return;
    }
    
    // Simulate processing time
    setTimeout(() => {
        // Show success message
        showSuccess('Order placed successfully!');
        
        // Reset the form
        document.getElementById('orderForm').reset();
        
        // Reset button
        resetButton();
        
        // TODO: Add real API call here
        // TODO: Add card validation here
        // TODO: Add order saving here
        
    }, 2000);
});

// Helper function to show success message
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

// Helper function to show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    document.getElementById('errorText').textContent = message;
    errorDiv.style.display = 'block';
}

// Helper function to hide all messages
function hideMessages() {
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

// Helper function to reset button
function resetButton() {
    const btn = document.getElementById('submitBtn');
    btn.textContent = 'Process Payment';
    btn.disabled = false;
}

// TODO: Add card number formatting
// TODO: Add card type detection
// TODO: Add expiry date validation
