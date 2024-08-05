let tasks = [];
let currentTaskId = null;

document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid', 'interaction', 'timeGrid'],
        editable: true,
        selectable: true,
        events: tasks.map(task => ({
            id: task.id,
            title: task.title,
            start: `${task.date}T${task.time}`,
            end: `${task.date}T${task.time}`,
            description: task.description
        })),
        eventClick: function(info) {
            currentTaskId = info.event.id;
            const task = tasks.find(t => t.id === info.event.id);
            if (task) {
                document.getElementById('title').value = task.title;
                document.getElementById('date').value = task.date;
                document.getElementById('time').value = task.time;
                document.getElementById('duration').value = task.duration || '';
                document.getElementById('description').value = task.description || '';
                document.getElementById('saveButton').setAttribute('data-id', task.id);
                showModal();
            }
        },
        select: function(info) {
            currentTaskId = null;
            document.getElementById('title').value = '';
            document.getElementById('date').value = info.startStr.split('T')[0];
            document.getElementById('time').value = info.startStr.split('T')[1];
            document.getElementById('duration').value = '';
            document.getElementById('description').value = '';
            document.getElementById('saveButton').removeAttribute('data-id');
            showModal();
        }
    });

    calendar.render();

    document.getElementById('saveButton').addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const title = document.getElementById('title').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const duration = document.getElementById('duration').value;
        const description = document.getElementById('description').value;

        if (title && date && time) {
            const newTask = {
                id: id || new Date().getTime().toString(),
                title,
                date,
                time,
                duration,
                description
            };

            if (id) {
                tasks = tasks.map(task => task.id === id ? newTask : task);
            } else {
                tasks.push(newTask);
            }

            calendar.getEvents().forEach(event => event.remove());
            calendar.addEventSource(tasks.map(task => ({
                id: task.id,
                title: task.title,
                start: `${task.date}T${task.time}`,
                end: `${task.date}T${task.time}`,
                description: task.description
            })));

            renderTasks();
            hideModal();
        } else {
            alert('Bitte fülle alle erforderlichen Felder aus.');
        }
    });
});

function showModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.add('show');
}

function hideModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.remove('show');
}

function renderTasks() {
    const plannedTasks = document.getElementById('plannedTasks');
    const unplannedTasks = document.getElementById('unplannedTasks');
    plannedTasks.innerHTML = '';
    unplannedTasks.innerHTML = '';

    tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${task.title}</strong><br>
            Datum: ${task.date} ${task.time}<br>
            Dauer: ${task.duration || 'Keine'} Minuten<br>
            Beschreibung: ${task.description || 'Keine'}<br>
            <button onclick="showModal('${task.id}')">Bearbeiten</button>
            <button onclick="deleteTask('${task.id}')">Löschen</button>
        `;
        if (task.date && task.time) {
            plannedTasks.appendChild(listItem);
        } else {
            unplannedTasks.appendChild(listItem);
        }
    });
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    document.querySelector(`#calendar .fc-event[data-id="${id}"]`).remove();
    renderTasks();
}
