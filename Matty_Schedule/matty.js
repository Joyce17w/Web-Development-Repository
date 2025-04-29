function updateCurrentTime() {
    const options = {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    const now = new Date();
    const dateOptions = {
        timeZone: 'America/New_York',
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    };
    document.getElementById('current-time').textContent = 
        `it's currently: ${now.toLocaleDateString('en-US', dateOptions)} ${now.toLocaleTimeString('en-US', options)}`;
}

setInterval(updateCurrentTime, 1000);
updateCurrentTime();

let alarmEnabled = false;
let nextAlarmTime = null;
let alarmTimeout = null;
const alarmSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
let importantDates = JSON.parse(localStorage.getItem('importantDates')) || [];

function handleFormKeyPress(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const saveBtn = document.getElementById('save-date-btn');
        if (saveBtn) saveBtn.click();
    }
}

saveImportantDates();

function filterPastDates() {
    const now = new Date();
    importantDates = importantDates.filter(date => {
        return new Date(date.datetime) >= now;
    });
    saveImportantDates();
    }

function showDateForm() {
    document.getElementById('date-form').style.display = 'flex';
    document.getElementById('add-date-btn').style.display = 'none';
    form.addEventListener('keypress', handleFormKeyPress);
}

function hideDateForm() {
    document.getElementById('date-form').style.display = 'none';
    document.getElementById('add-date-btn').style.display = 'block';
    form.removeEventListener('keypress', handleFormKeyPress);
    resetDateForm();
}

function addImportantDate() {
    const title = document.getElementById('date-title').value.trim();
    const location = document.getElementById('date-location').value.trim();
    const date = document.getElementById('date-date').value;
    const time = document.getElementById('date-time').value;
    
    
    const datetime = new Date(`${date}T${time || '12:00'}`);
    const dateId = Date.now(); 
    
    importantDates.push({
        id: dateId,
        title,
        location,
        datetime: datetime.toISOString()
    });
    
    saveImportantDates();
    renderImportantDates();
    hideDateForm();
}

function renderImportantDates() {
    filterPastDates(); 
    const container = document.getElementById('dates-list');
    container.innerHTML = '';
    
    if (importantDates.length === 0) {
        container.innerHTML = '<p style="color:#8b5a2b; text-align:center;">No upcoming dates</p>';
        return;
    }
    importantDates.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    if (importantDates.length === 0) {
        container.innerHTML = '<p style="color:#8b5a2b; text-align:center;">No important dates yet</p>';
        return;
    }
    
    importantDates.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    
    importantDates.forEach(date => {
        const dateObj = new Date(date.datetime);
        const dateItem = document.createElement('div');
        dateItem.className = 'date-item';
        
        const formattedDate = `${dateObj.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            timeZone: 'America/New_York'
        })} at ${dateObj.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'America/New_York'
        })}`;
        
        dateItem.innerHTML = `
            <div class="date-item-header">
                <h4>${date.title}</h4>
                <button class="edit-date" data-id="${date.id}">✏️</button>
            </div>
            ${date.location ? `
            <div class="location">
                <span class="location-icon">📍</span>
                ${date.location}
                <button class="map-btn" data-location="${encodeURIComponent(date.location)}">🗺️ take us</button>
            </div>
            ` : ''}
            <p>${formattedDate}</p>
            <button class="delete-date" data-id="${date.id}">×</button>
        `;
        container.appendChild(dateItem);
    });
    
    document.querySelectorAll('.edit-date').forEach(btn => {
        btn.addEventListener('click', (e) => editImportantDate(parseInt(e.target.dataset.id)));
    });
    
    document.querySelectorAll('.delete-date').forEach(btn => {
        btn.addEventListener('click', (e) => deleteImportantDate(parseInt(e.target.dataset.id)));
    });
    

    document.querySelectorAll('.map-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const location = e.target.dataset.location;
            window.open(`https://www.google.com/maps?q=${location}`, '_blank');
        });
    });
}

function deleteImportantDate(id) {
    importantDates = importantDates.filter(date => date.id !== id);
    saveImportantDates();
    renderImportantDates();
}


function saveEditedDate(id) {
    const title = document.getElementById('date-title').value.trim();
    const location = document.getElementById('date-location').value.trim();
    const date = document.getElementById('date-date').value;
    const time = document.getElementById('date-time').value;
    
    if (!title || !date) {
        alert('Please at least enter a title and date');
        return;
    }
    
    const datetime = new Date(`${date}T${time || '12:00'}`);
    
    const index = importantDates.findIndex(date => date.id === id);
    if (index !== -1) {
        importantDates[index] = {
            id: id, 
            title,
            location,
            datetime: datetime.toISOString()
        };
    }
    
    saveImportantDates();
    renderImportantDates();
    hideDateForm();
}

let currentEditingId = null;
function editImportantDate(id) {
    const dateToEdit = importantDates.find(date => date.id === id);
    if (!dateToEdit) return;
    
    const dateObj = new Date(dateToEdit.datetime);
    
    document.getElementById('date-title').value = dateToEdit.title;
    document.getElementById('date-location').value = dateToEdit.location || '';
    document.getElementById('date-date').value = dateObj.toISOString().split('T')[0];
    document.getElementById('date-time').value = dateObj.toTimeString().substring(0, 5);
    
    document.getElementById('date-form').classList.add('edit-mode');
    const saveBtn = document.getElementById('save-date-btn');
    saveBtn.textContent = 'Save';
    saveBtn.onclick = function() { saveEditedDate(id); };
    
    showDateForm();
}
function saveImportantDates() {
    localStorage.setItem('importantDates', JSON.stringify(importantDates));
}

function resetDateForm() {
    document.getElementById('date-title').value = '';
    document.getElementById('date-location').value = '';
    document.getElementById('date-date').value = '';
    document.getElementById('date-time').value = '';
    
    const saveBtn = document.getElementById('save-date-btn');
    saveBtn.textContent = 'Add';
    saveBtn.onclick = addImportantDate;
    document.getElementById('date-form').classList.remove('edit-mode');
}


document.addEventListener('DOMContentLoaded', function() {
    filterPastDates();
    renderImportantDates();
    document.getElementById('add-date-btn').addEventListener('click', showDateForm);
    document.getElementById('cancel-date-btn').addEventListener('click', hideDateForm);
    document.getElementById('save-date-btn').onclick = addImportantDate;
    document.getElementById('activity-log').addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-log')) {  // Fixed
            deleteLogEntry(e.target.dataset.id);
        }
    }
    );

    const toggleDatesBtn = document.getElementById('toggle-dates-btn');
    const datesContent = document.getElementById('dates-content');
    
    toggleDatesBtn.addEventListener('click', function() {
        const isCollapsed = datesContent.style.maxHeight === '0px' || 
                          datesContent.style.maxHeight === '';
        
        if (isCollapsed) {
            datesContent.style.maxHeight = '500px';
            datesContent.style.opacity = '1';
            toggleDatesBtn.textContent = '-';
        } else {
            datesContent.style.maxHeight = '0';
            datesContent.style.opacity = '0';
            toggleDatesBtn.textContent = '+';
        }
    });
    
    renderImportantDates();
});

let pixelChecklistItems = JSON.parse(localStorage.getItem('pixelChecklistItems')) || [];

function showPixelChecklistForm() {
    document.getElementById('pixel-checklist-form').style.display = 'flex';
    document.getElementById('pixel-checklist-add').style.display = 'none';
    document.getElementById('pixel-checklist-input').focus();
}

function hidePixelChecklistForm() {
    document.getElementById('pixel-checklist-form').style.display = 'none';
    document.getElementById('pixel-checklist-add').style.display = 'block';
    document.getElementById('pixel-checklist-input').value = '';
}

function addPixelChecklistItem(e) {
    e.preventDefault();
    const text = document.getElementById('pixel-checklist-input').value.trim();
    if (!text) return;
    
    pixelChecklistItems.push({
        id: Date.now(),
        text,
        completed: false
    });
    
    savePixelChecklistItems();
    renderPixelChecklistItems();
    hidePixelChecklistForm();
}

function renderPixelChecklistItems() {
    const container = document.getElementById('pixel-checklist-items');
    container.innerHTML = '';
    
    if (pixelChecklistItems.length === 0) {
        container.innerHTML = '<p style="color:#8b5a2b; text-align:center;">No tasks yet!</p>';
        return;
    }
    
    pixelChecklistItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `pixel-checklist-item ${item.completed ? 'completed' : ''}`;
        itemElement.innerHTML = `
            <input type="checkbox" id="pixel-check-${item.id}" ${item.completed ? 'checked' : ''}>
            <label for="pixel-check-${item.id}">${item.text}</label>
            <button class="pixel-checklist-item-delete" data-id="${item.id}">×</button>
        `;
        container.appendChild(itemElement);
        
        // Add event listeners
        const checkbox = itemElement.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => togglePixelChecklistItem(item.id));
        
        const deleteBtn = itemElement.querySelector('.pixel-checklist-item-delete');
        deleteBtn.addEventListener('click', () => deletePixelChecklistItem(item.id));
    });
}

function togglePixelChecklistItem(id) {
    const item = pixelChecklistItems.find(item => item.id === id);
    if (item) {
        item.completed = !item.completed;
        savePixelChecklistItems();
        renderPixelChecklistItems();
    }
}

function deletePixelChecklistItem(id) {
    pixelChecklistItems = pixelChecklistItems.filter(item => item.id !== id);
    savePixelChecklistItems();
    renderPixelChecklistItems();
}

function savePixelChecklistItems() {
    localStorage.setItem('pixelChecklistItems', JSON.stringify(pixelChecklistItems));
}

// Add to your DOMContentLoaded event:
document.addEventListener('DOMContentLoaded', function() {
    // Existing code...
    
    // Pixel Checklist functionality
    document.getElementById('pixel-checklist-add').addEventListener('click', showPixelChecklistForm);
    document.getElementById('pixel-checklist-cancel').addEventListener('click', hidePixelChecklistForm);
    document.getElementById('pixel-checklist-form').addEventListener('submit', addPixelChecklistItem);
    
    // Checklist toggle
    const pixelChecklistToggle = document.getElementById('pixel-checklist-toggle');
    const pixelChecklistContent = document.getElementById('pixel-checklist-content');
    
    pixelChecklistToggle.addEventListener('click', function() {
        const isCollapsed = pixelChecklistContent.classList.contains('collapsed');
        
        if (isCollapsed) {
            pixelChecklistContent.classList.remove('collapsed');
            pixelChecklistToggle.textContent = '-';
        } else {
            pixelChecklistContent.classList.add('collapsed');
            pixelChecklistToggle.textContent = '+';
        }
    });
    
    renderPixelChecklistItems();
});


function setNextAlarm() {
    if (!alarmEnabled) return;
    
    // Clear any existing alarm
    if (alarmTimeout) {
        clearTimeout(alarmTimeout);
    }
    
    // Set alarm for 1.5 hours from now
    const alarmDelay = 1.5 * 60 * 60 * 1000; // 1.5 hours in milliseconds
    nextAlarmTime = new Date(Date.now() + alarmDelay);
    
    // Update display
    document.getElementById('next-alarm').textContent = 
        `💩 Time to potty: ${nextAlarmTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'America/New_York'
        })}`;
    
    alarmTimeout = setTimeout(triggerAlarm, alarmDelay);
}

function triggerAlarm() {
    if (!alarmEnabled) return;
    
    // Visual feedback
    const btn = document.getElementById('toggle-alarm');
    btn.classList.add('ringing');
    btn.textContent = '🔔 ALARMING! Click to stop';
    
    // Play sound (loop until stopped)
    alarmSound.loop = true;
    alarmSound.play();
    
    if (Notification.permission === 'granted') {
        new Notification("Matty's Reminder", {
            body: "Time for the next puppy activity check!",
            icon: "https://cdn-icons-png.flaticon.com/512/616/616408.png"
        });
    }
}

function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    
    const btn = document.getElementById('toggle-alarm');
    btn.classList.remove('ringing');
    btn.textContent = '🔔 Alarms Enabled';
    
    setNextAlarm();
}

function toggleAlarm() {
    alarmEnabled = !alarmEnabled;
    const btn = document.getElementById('toggle-alarm');
    
    if (alarmEnabled) {
        btn.classList.add('alarm-active');
        setNextAlarm();
        // Request notification permission
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    } else {
        btn.classList.remove('alarm-active');
        btn.textContent = '🔔 Enable Alarms';
        if (alarmTimeout) {
            clearTimeout(alarmTimeout);
            alarmTimeout = null;
        }
        document.getElementById('next-alarm').textContent = '💩 Time to potty: --:-- --';
    }
}

document.getElementById('toggle-alarm').addEventListener('click', function() {
    if (this.classList.contains('ringing')) {
        stopAlarm();
    } else {
        toggleAlarm();
    }
});


let currentActivity = null;
let activityStartTime = null;
const activityLog = document.getElementById('activity-log');

function formatTime(date) {
    const options = {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    return date.toLocaleTimeString('en-US', options);
}


function formatDate(date) {
    const options = {
        timeZone: 'America/New_York',
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

function startActivity(activityName) {
    const now = new Date();
    const logId = Date.now();
    if (currentActivity) {
        endCurrentActivity();
    }

    currentActivity = activityName;
    activityStartTime = now;

    const startEntry = document.createElement('div');
    startEntry.className = 'log-entry';
    startEntry.dataset.id = logId;
    startEntry.innerHTML = `
        <button class="delete-log" data-id="${logId}">×</button>
        <strong>${formatDate(now)}</strong><br>
        🐾 <strong>[${formatTime(now)}]</strong> Started: <strong>${activityName}</strong>
    `;
    activityLog.prepend(startEntry);
}

function endCurrentActivity() {
    if (!currentActivity) return;
    
    const now = new Date();
    const logId = Date.now();
    
    
    const durationMs = now - activityStartTime;
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const durationSecs = Math.floor((durationMs % (1000 * 60)) / 1000);
    
    let durationText = '';
    if (durationHours > 0) {
        durationText = `${durationHours}h ${durationMins}m`;
    } else if (durationMins > 0) {
        durationText = `${durationMins}m ${durationSecs}s`;
    } else {
        durationText = `${durationSecs}s`;
    }
    
    // Create log entry for end
    const endEntry = document.createElement('div');
    endEntry.className = 'log-entry';
    endEntry.dataset.id = logId;
    endEntry.innerHTML = `
        <button class="delete-log" data-id="${logId}">×</button>
        <strong>${formatDate(now)}</strong><br>
        🐶 <strong>[${formatTime(now)}]</strong> Ended: <strong>${currentActivity}</strong><br>
        ⏱️ Duration: <strong>${durationText}</strong> (Started at ${formatTime(activityStartTime)})
    `;
    activityLog.prepend(endEntry);
    
    // Reset current activity
    currentActivity = null;
    activityStartTime = null;
}

// End current activity if page is closed
window.addEventListener('beforeunload', function() {
    if (currentActivity) {
        endCurrentActivity();
    }
});

function deleteLogEntry(logId) {
    if (!confirm('Delete this activity log?')) return;
    const logElement = document.querySelector(`.log-entry[data-id="${logId}"]`);
    if (logElement) logElement.remove();

    savedLogs = JSON.parse(localStorage.getItem('puppyLogs')) || [];
    savedLogs = savedLogs.filter(entry => {
        const entryIdMatch = entry.match(/data-id="([^"]+)"/);
        return !entryIdMatch || entryIdMatch[1] !== logId.toString();
    });
    
    localStorage.setItem('puppyLogs', JSON.stringify(savedLogs));
}


// Sample initial log entry
const welcomeEntry = document.createElement('div');
welcomeEntry.className = 'log-entry';
welcomeEntry.dataset.id = 'welcome';
welcomeEntry.innerHTML = `
    <button class="delete-log" data-id="welcome">×</button>
    Click activities to start logging! 🐕
`;
activityLog.appendChild(welcomeEntry);
let savedLogs = JSON.parse(localStorage.getItem('puppyLogs')) || [];

// Add this function to save logs to localStorage
function saveLogs() {
    const logEntries = Array.from(document.querySelectorAll('.log-entry')).map(entry => entry.innerHTML);
    savedLogs = logEntries;
    localStorage.setItem('puppyLogs', JSON.stringify(savedLogs));
    alert('Logs saved successfully!');
}

// Add this function to export logs as a styled sheet
function exportLogs() {
    // Get current date for filename
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    // Create HTML content with the same styling
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Matty's Activity Log - ${dateString}</title>
        <style>
            body {
                font-family: 'VT323', monospace;
                background-color: #f5e9d9;
                color: #5a3921;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                font-size: 20px;
            }
            h1 {
                text-align: center;
                color: #8b5a2b;
                text-shadow: 2px 2px 0px #d4a76a;
                font-size: 2.5rem;
            }
            .log-container {
                background-color: #f0e0c0;
                border: 3px solid #d4a76a;
                border-radius: 5px;
                padding: 15px;
                margin-top: 20px;
                box-shadow: 5px 5px 0px #d4a76a;
            }
            .log-title {
                font-weight: bold;
                margin-bottom: 10px;
                font-size: 1.5rem;
            }
            .log-entry {
                margin-bottom: 10px;
                padding: 8px;
                border-bottom: 1px dotted #d4a76a;
            }
            @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        </style>
    </head>
    <body>
        <h1>Matty's Activity Log</h1>
        <div class="log-container">
            <div class="log-title">Full History (${dateString})</div>
            ${savedLogs.join('')}
        </div>
    </body>
    </html>
    `;
    
    
    // Create download link
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matty-activity-log-${dateString}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Update your beforeunload event to save logs automatically
window.addEventListener('beforeunload', function() {
    if (currentActivity) {
        endCurrentActivity();
    }
    saveLogs(); // Auto-save when leaving
});

function cleanOldLogs(daysToKeep = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    
    savedLogs = savedLogs.filter(entry => {
        const entryDate = new Date(entry.split('<strong>')[1].split('</strong>')[0]);
        return entryDate >= cutoff;
    });
    
    localStorage.setItem('puppyLogs', JSON.stringify(savedLogs));
    renderActivityLogs();
}
