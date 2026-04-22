// Map functionality for complaint visualization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map only if the map container exists
    const mapContainer = document.getElementById('trafficMap');
    if (!mapContainer) return;

    // Create map centered on India or generally if no data
    const map = L.map('trafficMap', {
        zoomControl: false // We will add it back in a better position
    }).setView([20.5937, 78.9629], 5);

    // Add Zoom Control to Bottom Right
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    // Add CartoDB Positron Premium Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    // Add markers for complaints if data exists
    const dataElement = document.getElementById('complaints-data');
    if (dataElement) {
        try {
            window.complaintsOnMap = JSON.parse(dataElement.textContent);
        } catch (e) {
            console.error("Could not parse complaints data:", e);
            window.complaintsOnMap = [];
        }
        let validComplaints = 0;

        window.complaintsOnMap.forEach((complaint, index) => {
            if (complaint.latitude && complaint.longitude && complaint.latitude !== "null" && complaint.longitude !== "null") {
                validComplaints++;

                // Format timestamp beautifully
                let timeStr = "";
                if(complaint.timestamp) {
                    timeStr = complaint.timestamp;
                }

                // Create custom popup content mapping to our new beautiful CSS
                const popupContent = `
                    <div style="min-width: 240px; font-family: 'Outfit', sans-serif;">
                        <div style="border-bottom: 2px solid ${getStatusColorRGB(complaint.status)}; margin-bottom: 10px; padding-bottom: 8px;">
                            <span style="background: ${getStatusColorRGB(complaint.status)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">
                                ${complaint.status || 'Pending'}
                            </span>
                            <h6 style="margin: 8px 0 0 0; color: #1e293b; font-weight: 700; font-size: 14px;">
                                📍 ${complaint.location || 'Reported Incident'}
                            </h6>
                            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Ref #${complaint.id} &bull; ${timeStr}</div>
                        </div>
                        <p style="margin-bottom: 0; font-size: 13px; color: #334155; line-height: 1.4;">
                            ${complaint.description || 'No description provided'}
                        </p>
                    </div>
                `;

                // Create marker with custom icon based on status
                const marker = L.marker([complaint.latitude, complaint.longitude], {
                    icon: getStatusIcon(complaint.status),
                    title: `Incident #${complaint.id}`
                }).addTo(map);

                marker.bindPopup(popupContent, {
                    closeButton: false,
                    className: 'custom-popup-wrapper'
                });
            }
        });

        // Adjust map view if we have complaints
        if (validComplaints > 0) {
            const validPoints = window.complaintsOnMap
                    .filter(c => c.latitude && c.longitude && c.latitude !== "null" && c.longitude !== "null")
                    .map(c => [c.latitude, c.longitude]);
                    
            if(validPoints.length > 0) {
                const bounds = L.latLngBounds(validPoints);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }
});

function getStatusColorRGB(status) {
    const s = status?.toLowerCase() || '';
    if (s.includes('resolved')) return '#10b981'; // success
    if (s.includes('progress')) return '#f59e0b'; // warning
    return '#0f172a'; // pending/dark
}

function getStatusClass(status) {
    const s = status?.toLowerCase() || '';
    if (s.includes('resolved')) return 'resolved';
    if (s.includes('progress')) return 'progress';
    return 'pending';
}

function getStatusIcon(status) {
    const cls = getStatusClass(status);
    return L.divIcon({
        html: `<div class="marker-pin ${cls}"></div><div style="width: 10px; height: 10px; background: white; border-radius: 50%; position: absolute; top: 7px; left: 7px; z-index: 2;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -20],
        className: 'custom-marker'
    });
}

// Add CSS dynamically for Leaflet Popups to match our style
const style = document.createElement('style');
style.innerHTML = `
    .leaflet-popup-content-wrapper {
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        padding: 4px;
    }
    .leaflet-popup-tip {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(style);