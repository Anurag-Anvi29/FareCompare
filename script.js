document.addEventListener('DOMContentLoaded', () => {

    function formatCurrency(amount) {
        return `₹$${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }

    const notificationArea = document.getElementById('notificationArea');
    function showNotification(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `notification $${type}`;
        notification.textContent = message;
        notificationArea.appendChild(notification);
        setTimeout(() => { notification.remove(); }, duration);
    }

    const profileModal = document.getElementById('profileModal');
    const profileBtn = document.getElementById('profileBtn');
    const closeProfileBtn = profileModal.querySelector('.close-button');

    let currentUser = { name: "Anjali Sharma", email: "anjali.sharma@example.com", phone: "+91 98765 43210" };

    function displayProfileData() {
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('profilePhone').textContent = currentUser.phone;
    }

    profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        displayProfileData();
        profileModal.style.display = 'block';
    });

    closeProfileBtn.addEventListener('click', () => {
        profileModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === profileModal) {
            profileModal.style.display = 'none';
        }
    });
    
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const noHistoryMessage = document.getElementById('noHistoryMessage');
    const HISTORY_STORAGE_KEY = 'cabFareHistory';

    function getHistory() {
        return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
    }

    function saveHistory(history) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }

    function addRideToHistory(rideDetails) {
        const history = getHistory();
        const newEntry = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            from: rideDetails.from,
            to: rideDetails.to,
            cabType: rideDetails.name,
            fare: rideDetails.fare
        };
        history.unshift(newEntry);
        saveHistory(history);
        renderHistory();
    }
    
    function renderHistory() {
        const history = getHistory();
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.appendChild(noHistoryMessage);
            noHistoryMessage.style.display = 'block';
        } else {
            noHistoryMessage.style.display = 'none';
            history.forEach(item => {
                const historyItemEl = document.createElement('div');
                historyItemEl.className = 'ride-card';
                historyItemEl.innerHTML = `
                    <div class="ride-info">
                        <p><strong>$${item.from}</strong> to <strong>$${item.to}</strong></p>
                        <small>$${item.cabType} on $${item.timestamp}</small>
                    </div>
                    <div class="ride-price">
                        <span>$${formatCurrency(item.fare)}</span>
                    </div>
                `;
                historyList.appendChild(historyItemEl);
            });
        }
    }
    
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all history?")) {
            localStorage.removeItem(HISTORY_STORAGE_KEY);
            renderHistory();
            showNotification("History cleared.", "success");
        }
    });

    const searchBtn = document.querySelector('.search-btn');
    const pickupInput = document.getElementById('from'); 
    const dropoffInput = document.getElementById('to');   
    const rideCardsContainer = document.querySelector('.ride-cards');
    const resultsSection = document.querySelector('.results-section');

    const cabServices = [
        { id: 1, name: 'Auto', baseFare: 30, costPerKm: 8, eta: 4, rating: 4.2 },
        { id: 2, name: 'Go', baseFare: 45, costPerKm: 10, eta: 5, rating: 4.5 },
        { id: 3, name: 'Premier', baseFare: 60, costPerKm: 14, eta: 5, rating: 4.7 },
        { id: 4, name: 'SUV', baseFare: 80, costPerKm: 18, eta: 7, rating: 4.8 },
    ];
    
    function estimateDistance(from, to) {
        return Math.floor(Math.random() * (25 - 3 + 1)) + 3; // Random distance between 3km and 25km
    }

    searchBtn.addEventListener('click', () => {
        const pickup = pickupInput.value.trim();
        const dropoff = dropoffInput.value.trim();
        
        if (!pickup || !dropoff) {
            showNotification("Please enter pickup and drop locations.", "warning");
            return;
        }
        
        const distance = estimateDistance(pickup, dropoff);
        let searchResults = cabServices.map(cab => {
            let fare = cab.baseFare + (distance * cab.costPerKm);
            return { ...cab, fare: Math.round(fare), from: pickup, to: dropoff };
        });

        searchResults.sort((a, b) => a.fare - b.fare);
        
        displayResults(searchResults);
    });
    
    function displayResults(rides) {
        rideCardsContainer.innerHTML = ''; // Clear previous results
        
        rides.forEach((ride, index) => {
            const rideCard = document.createElement('div');
            rideCard.className = 'ride-card';
            // Highlight the first item as "Best Price"
            if (index === 0) {
                rideCard.classList.add('best-price');
            }
            
            rideCard.innerHTML = `
                <img src="https://img.icons8.com/ios-filled/50/000000/sedan.png" alt="cab" class="cab-icon" style="width:40px; margin-right: 15px;">
                <div class="ride-info">
                    <h3>$${ride.name}</h3>
                    <p><i class="fas fa-star" style="color: #ffc107;"></i> $${ride.rating} &bull; $${ride.eta} min</p>
                </div>
                <div class="ride-price">
                    <span>$${formatCurrency(ride.fare)}</span>
                    $${index === 0 ? '<span class="badge">Best Price</span>' : ''}
                </div>
                <button class="select-ride-btn" data-ride='$${JSON.stringify(ride)}'>Book</button>
            `;
            rideCardsContainer.appendChild(rideCard);
        });
        resultsSection.style.display = 'block';
        historySection.style.display = 'none'; // Hide history when showing results
    }
    
        rideCardsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('select-ride-btn')) {
            const rideData = JSON.parse(event.target.dataset.ride);
            addRideToHistory(rideData);
            showNotification(`Booked $${rideData.name} for ${formatCurrency(rideData.fare)}!`, 'success');
        }
    });

        const header = document.querySelector('header');
    const historyButton = document.createElement('button');
    historyButton.textContent = 'View History';
    historyButton.className = 'secondary-btn';
    header.appendChild(historyButton);

    historyButton.addEventListener('click', () => {
        resultsSection.style.display = 'none'; // Hide results
        historySection.style.display = 'block'; // Show history
        renderHistory();
    });

        renderHistory();
});

