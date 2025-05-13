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
    document.getElementById('media-upload').addEventListener('change', handleMediaUpload);
    renderMediaItems();
    document.getElementById('save-date-btn').onclick = addImportantDate;
    document.getElementById('activity-log').addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-log')) {
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

let mediaItems = JSON.parse(localStorage.getItem('mattyMedia')) || [];

function handleMediaUpload(e) {
    const files = e.target.files;
    const caption = document.getElementById('media-caption').value.trim() || 'Matty Moment';
    
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
        // Check if file is an image or video
        if (!file.type.match('image.*') && !file.type.match('video.*')) {
            alert('Only images and videos are allowed!');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const mediaItem = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                type: file.type.startsWith('video') ? 'video' : 'image',
                data: event.target.result,
                caption: caption,
                date: new Date().toISOString(),
                fileType: file.type // Store the file type
            };
            
            mediaItems.push(mediaItem);
            saveMediaItems();
            renderMediaItems();
        };
        
        reader.onerror = function() {
            console.error('Error reading file');
        };
        
        reader.readAsDataURL(file);
    });
    e.target.value = '';
}

function saveMediaItems() {
    try {
        localStorage.setItem('mattyMedia', JSON.stringify(mediaItems));
    } catch (e) {
        console.error('Error saving media items:', e);
    }
}

function renderMediaItems() {
    const container = document.getElementById('media-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (mediaItems.length === 0) {
        container.innerHTML = '<p style="color:#8b5a2b; text-align:center;">No media yet! Upload some memories of Matty.</p>';
        return;
    }
    
    // Sort by date (newest first)
    mediaItems.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    mediaItems.forEach(item => {
        const mediaElement = document.createElement('div');
        mediaElement.className = 'media-item';
        
        if (item.type === 'video') {
            mediaElement.innerHTML = `
                <video controls>
                    <source src="${item.data}" type="${item.fileType || 'video/mp4'}">
                    Your browser does not support the video tag.
                </video>
                <div class="media-caption">${item.caption}</div>
                <button class="delete-media" data-id="${item.id}">×</button>
            `;
        } else {
            mediaElement.innerHTML = `
                <img src="${item.data}" alt="${item.caption}">
                <div class="media-caption">${item.caption}</div>
                <button class="delete-media" data-id="${item.id}">×</button>
            `;
        }
        
        container.appendChild(mediaElement);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-media').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteMediaItem(e.target.dataset.id);
        });
    });
}

function deleteMediaItem(id) {
    if (confirm('Delete this media item?')) {
        mediaItems = mediaItems.filter(item => item.id !== id);
        saveMediaItems();
        renderMediaItems();
    }
}

document.addEventListener('DOMContentLoaded', function() {

    
    document.getElementById('pixel-checklist-add').addEventListener('click', showPixelChecklistForm);
    document.getElementById('pixel-checklist-cancel').addEventListener('click', hidePixelChecklistForm);
    document.getElementById('pixel-checklist-form').addEventListener('submit', addPixelChecklistItem);
    
    const pixelChecklistToggle = document.getElementById('pixel-checklist-toggle');
    const pixelChecklistContent = document.getElementById('pixel-checklist-content');
    const mediaUploadInput = document.getElementById('media-upload');
    if (mediaUploadInput) {
        mediaUploadInput.addEventListener('change', handleMediaUpload);
    }
    renderMediaItems();
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
    

    if (alarmTimeout) {
        clearTimeout(alarmTimeout);
    }
    
    const alarmDelay = 1.5 * 60 * 60 * 1000; 
    nextAlarmTime = new Date(Date.now() + alarmDelay);
    
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
    
    const btn = document.getElementById('toggle-alarm');
    btn.classList.add('ringing');
    btn.textContent = '🔔 ALARMING! Click to stop';

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
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    } else {
        btn.classList.remove('alarm-active');
        btn.textContent = '🔔 Enable Alarm';
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
    
    currentActivity = null;
    activityStartTime = null;
}

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


const welcomeEntry = document.createElement('div');
welcomeEntry.className = 'log-entry';
welcomeEntry.dataset.id = 'welcome';
welcomeEntry.innerHTML = `
    <button class="delete-log" data-id="welcome">×</button>
    Click activities to start logging! 🐕
`;
activityLog.appendChild(welcomeEntry);
let savedLogs = JSON.parse(localStorage.getItem('puppyLogs')) || [];

function saveLogs() {
    const logEntries = Array.from(document.querySelectorAll('.log-entry')).map(entry => entry.innerHTML);
    savedLogs = logEntries;
    localStorage.setItem('puppyLogs', JSON.stringify(savedLogs));
}

function exportLogs() {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    const logEntries = Array.from(document.querySelectorAll('.log-entry')).map(entry => {
        return {
            id: entry.dataset.id,
            html: entry.innerHTML
        };
    });


    const tableRows = logEntries.map(entry => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = entry.html;
        const textContent = tempDiv.textContent.replace('×', '').trim();
        
        const parts = textContent.split('Started:').length > 1 ? 
            ['Started', textContent.split('Started:')[1].trim()] :
            textContent.split('Ended:').length > 1 ?
            ['Ended', textContent.split('Ended:')[1].trim()] :
            ['Note', textContent];
        
        return `
            <tr>
                <td>${formatDate(new Date())}</td>
                <td>${parts[0]}</td>
                <td>${parts[1]}</td>
            </tr>
        `;
    }).join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Matty's Activity Log - ${dateString}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
            
            body {
                font-family: 'VT323', monospace;
                background-color: #f5e9d9;
                color: #5a3921;
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
                font-size: 18px;
            }
            h1 {
                text-align: center;
                color: #8b5a2b;
                text-shadow: 2px 2px 0px #d4a76a;
                font-size: 2.5rem;
                margin-bottom: 20px;
            }
            .log-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                background-color: #f0e0c0;
                border: 3px solid #d4a76a;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 5px 5px 0px #d4a76a;
            }
            .log-table th {
                background-color: #d4a76a;
                color: #5a3921;
                padding: 12px;
                text-align: left;
                font-size: 1.3rem;
                border-bottom: 3px solid #8b5a2b;
            }
            .log-table td {
                padding: 12px;
                border-bottom: 1px solid #d4a76a;
                vertical-align: top;
            }
            .log-table tr:last-child td {
                border-bottom: none;
            }
            .log-table tr:nth-child(even) {
                background-color: #f9e5c0;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                color: #8b5a2b;
                font-size: 1rem;
            }
            @media print {
                body {
                    background-color: white;
                    color: black;
                }
                .log-table {
                    box-shadow: none;
                    border: 1px solid #ddd;
                }
            }
        </style>
    </head>
    <body>
        <h1>Matty's Activity Log</h1>
        <table class="log-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Activity</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
        <div class="footer">
            Generated on ${today.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'America/New_York'
            })} at ${today.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/New_York'
            })}
        </div>
    </body>
    </html>
    `;

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
