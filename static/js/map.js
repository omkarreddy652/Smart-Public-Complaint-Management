// Map functionality for complaint visualization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map only if the map container exists
    const mapContainer = document.getElementById('trafficMap');
    if (!mapContainer) return;

    // Create map centered on India
    const map = L.map('trafficMap').setView([20.5937, 78.9629], 5);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add markers for complaints if data exists
    if (typeof window.complaintsOnMap !== 'undefined') {
        let validComplaints = 0;

        window.complaintsOnMap.forEach((complaint, index) => {
            if (complaint.latitude && complaint.longitude) {
                validComplaints++;

                // Create custom popup content
                const popupContent = `
                    <div style="min-width: 200px;">
                        <h6 style="margin-bottom: 8px; color: #333;">
                            📍 ${complaint.location || 'Unknown Location'}
                        </h6>
                        <p style="margin-bottom: 8px; font-size: 14px;">
                            ${complaint.description || 'No description provided'}
                        </p>
                        <div style="font-size: 12px; color: #666;">
                            <strong>Status:</strong> 
                            <span style="color: ${getStatusColor(complaint.status)}">
                                ${complaint.status || 'Pending'}
                            </span>
                        </div>
                    </div>
                `;

                // Create marker with custom icon based on status
                const marker = L.marker([complaint.latitude, complaint.longitude], {
                    icon: getStatusIcon(complaint.status)
                }).addTo(map);

                marker.bindPopup(popupContent);
            }
        });

        // Adjust map view if we have complaints
        if (validComplaints > 0) {
            const group = new L.featureGroup(
                window.complaintsOnMap
                    .filter(c => c.latitude && c.longitude)
                    .map(c => L.marker([c.latitude, c.longitude]))
            );
            map.fitBounds(group.getBounds().pad(0.1));
        }

        // Update info display
        updateMapInfo(validComplaints);
    }
});

function getStatusColor(status) {
    switch(status?.toLowerCase()) {
        case 'resolved': return '#198754';
        case 'in progress': return '#fd7e14';
        case 'pending':
        default: return '#6c757d';
    }
}

function getStatusIcon(status) {
    const colors = {
        'resolved': '#198754',
        'in progress': '#fd7e14',
        'pending': '#6c757d'
    };

    const color = colors[status?.toLowerCase()] || colors['pending'];

    return L.divIcon({
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        className: 'custom-marker'
    });
}

function updateMapInfo(count) {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'alert alert-info mt-3';
    infoDiv.innerHTML = `
        📊 <strong>${count}</strong> complaints with location data are displayed on the map.
        ${count === 0 ? 'Submit complaints with latitude/longitude to see them here!' : ''}
    `;

    const mapContainer = document.getElementById('trafficMap');
    if (mapContainer && mapContainer.parentNode) {
        mapContainer.parentNode.insertBefore(infoDiv, mapContainer.nextSibling);
    }
}

// Add click handler for complaint images (modal view)
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.complaint-image');
    images.forEach(img => {
        img.addEventListener('click', function() {
            // Create modal for image viewing
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.8); z-index: 9999; display: flex;
                align-items: center; justify-content: center; cursor: pointer;
            `;

            const modalImg = document.createElement('img');
            modalImg.src = this.src;
            modalImg.style.cssText = `
                max-width: 90%; max-height: 90%; border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            `;

            modal.appendChild(modalImg);
            document.body.appendChild(modal);

            modal.addEventListener('click', () => modal.remove());
        });
    });
});