let tasks = [];

function showModal(taskIndex = null) {
    const modal = document.getElementById('taskModal');
    modal.classList.add('show');
    if (taskIndex !== null) {
        const task = tasks[taskIndex];
        document.getElementById('title').value = task.title;
        document.getElementById('date').value = task.date;
        document.getElementById('time').value = task.time;
        document.getElementById('duration').value = task.duration;
        document.getElementById('description').value = task.description;
        document.getElementById('saveButton').setAttribute('data-index', taskIndex);
    } else {
        document.getElementById('title').value = '';
        document.getElementById('date').value = '';
        document.getElementById('time').value = '';
        document.getElementById('duration').value = '';
        document.getElementById('description').value = '';
        document.getElementById('saveButton').removeAttribute('data-index');
    }
}

function hideModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.remove('show');
}

function saveTask() {
    const title = document.getElementById('title').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const duration = document.getElementById('duration').value;
    const description = document.getElementById('description').value;
    
    if (title && date && time && duration) {
        const task = { title, date, time, duration, description };
        const index = document.getElementById('saveButton').getAttribute('data-index');
        if (index !== null) {
            tasks[index] = task;
        } else {
            tasks.push(task);
        }
        hideModal();
        renderTasks();
        renderCalendar();
    } else {
        alert('Bitte fülle alle erforderlichen Felder aus.');
    }
}

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
    renderCalendar();
}

function renderTasks() {
    const plannedTasks = document.getElementById('plannedTasks');
    const unplannedTasks = document.getElementById('unplannedTasks');
    plannedTasks.innerHTML = '';
    unplannedTasks.innerHTML = '';

    tasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${task.title}</strong><br>
            Datum: ${task.date} ${task.time}<br>
            Dauer: ${task.duration} Minuten<br>
            Beschreibung: ${task.description || 'Keine'}<br>
            <button onclick="showModal(${index})">Bearbeiten</button>
            <button onclick="deleteTask(${index})">Löschen</button>
        `;
        if (task.date && task.time) {
            plannedTasks.appendChild(listItem);
        } else {
            unplannedTasks.appendChild(listItem);
        }
    });
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    tasks.forEach(task => {
        if (task.date && task.time) {
            const event = document.createElement('div');
            event.className = 'calendar-event';
            event.innerHTML = `
                <strong>${task.title}</strong><br>
                Datum: ${task.date} ${task.time}<br>
                Dauer: ${task.duration} Minuten<br>
                Beschreibung: ${task.description || 'Keine'}
            `;
            calendar.appendChild(event);
        }
    });
}

document.getElementById('saveButton').addEventListener('click', saveTask);
