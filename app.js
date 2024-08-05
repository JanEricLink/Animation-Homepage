document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var taskList = document.getElementById('task-list');
    var plannedTaskList = document.getElementById('event-list-content');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        editable: true,
        droppable: true,
        eventReceive: function(info) {
            info.draggedEl.parentNode.removeChild(info.draggedEl);
            updateTaskLists();
        },
        eventChange: function(info) {
            updateTaskLists();
        }
    });

    calendar.render();

    // Neue Aufgabe hinzufügen
    $('#newTaskButton').on('click', function() {
        openTaskDialog();
    });

    // Aufgaben per Doppelklick bearbeiten
    $(document).on('dblclick', '.task', function() {
        var taskId = $(this).data('task-id');
        var taskTitle = $(this).text();
        var taskDate = $(this).data('task-date');
        var taskTime = $(this).data('task-time');
        var taskDuration = $(this).data('task-duration');
        openTaskDialog(taskId, taskTitle, taskDate, taskTime, taskDuration);
    });

    // Drag-and-Drop für Aufgaben in den Kalender
    $(document).on('dragstart', '.task', function(event) {
        event.originalEvent.dataTransfer.setData('text/plain', $(this).data('task-id'));
    });

    $(calendarEl).on('drop', function(event) {
        event.preventDefault();
        var taskId = event.originalEvent.dataTransfer.getData('text/plain');
        var taskElement = $(`.task[data-task-id='${taskId}']`);

        var taskTitle = taskElement.text();
        var taskDate = taskElement.data('task-date');
        var taskTime = taskElement.data('task-time');
        var taskDuration = taskElement.data('task-duration');

        if (taskTitle && taskDate && taskTime) {
            var eventStart = taskDate + 'T' + taskTime;
            var eventEnd = new Date(new Date(eventStart).getTime() + taskDuration * 60 * 60 * 1000).toISOString();

            // Füge den Termin zum Kalender hinzu
            calendar.addEvent({
                id: taskId,
                title: taskTitle,
                start: eventStart,
                end: eventEnd,
                allDay: false
            });

            // Entferne die Aufgabe aus der Aufgabenliste
            taskElement.remove();
            updateTaskLists();
        }
    });

    $(calendarEl).on('dragover', function(event) {
        event.preventDefault();
    });

    // Funktion zum Öffnen des Bearbeitungsdialogs
    function openTaskDialog(taskId = null, taskTitle = '', taskDate = '', taskTime = '', taskDuration = 1) {
        $('#taskId').val(taskId);
        $('#taskTitle').val(taskTitle);
        $('#taskDate').val(taskDate);
        $('#taskTime').val(taskTime);
        $('#taskDuration').val(taskDuration);

        $('#editDialog').dialog({
            modal: true,
            width: 400,
            title: taskId ? 'Aufgabe bearbeiten' : 'Neue Aufgabe',
            buttons: {
                "Speichern": function() {
                    var taskId = $('#taskId').val();
                    var taskTitle = $('#taskTitle').val();
                    var taskDate = $('#taskDate').val();
                    var taskTime = $('#taskTime').val();
                    var taskDuration = $('#taskDuration').val();

                    if (taskTitle && taskDate && taskTime) {
                        var eventStart = taskDate + 'T' + taskTime;
                        var eventEnd = new Date(new Date(eventStart).getTime() + taskDuration * 60 * 60 * 1000).toISOString();

                        if (taskId) {
                            // Aufgabe bearbeiten
                            var event = calendar.getEventById(taskId);
                            if (event) {
                                event.setProp('title', taskTitle);
                                event.setStart(eventStart);
                                event.setEnd(eventEnd);
                                $(`.task[data-task-id='${taskId}']`).remove(); // Entferne die Aufgabe aus der Liste
                            } else {
                                // Aufgabe in Kalender hinzufügen, wenn sie als unbestimmte Aufgabe existiert
                                calendar.addEvent({
                                    id: taskId,
                                    title: taskTitle,
                                    start: eventStart,
                                    end: eventEnd,
                                    allDay: false
                                });
                            }
                        } else {
                            // Neue Aufgabe hinzufügen
                            taskId = new Date().getTime(); // Einfache ID-Generierung
                            calendar.addEvent({
                                id: taskId,
                                title: taskTitle,
                                start: eventStart,
                                end: eventEnd,
                                allDay: false
                            });

                            // Füge die Aufgabe zur Liste hinzu
                            var taskElement = $('<div>', {
                                class: 'task',
                                text: taskTitle,
                                'data-task-id': taskId,
                                'data-task-date': taskDate,
                                'data-task-time': taskTime,
                                'data-task-duration': taskDuration,
                                draggable: true
                            });
                            taskElement.appendTo(taskList);
                        }
                        updateTaskLists();
                    } else {
                        // Nicht genügend Informationen, Aufgabe in der Checkliste belassen
                        if (!taskId) {
                            taskId = new Date().getTime(); // Einfache ID-Generierung
                            var taskElement = $('<div>', {
                                class: 'task incomplete-task',
                                text: taskTitle,
                                'data-task-id': taskId,
                                'data-task-date': taskDate,
                                'data-task-time': taskTime,
                                'data-task-duration': taskDuration,
                                draggable: true
                            });
                            taskElement.appendTo(taskList);
                        } else {
                            // Aufgabe bearbeiten
                            var taskElement = $(`.task[data-task-id='${taskId}']`);
                            taskElement.text(taskTitle);
                            taskElement.data('task-date', taskDate);
                            taskElement.data('task-time', taskTime);
                            taskElement.data('task-duration', taskDuration);
                        }
                        $(this).dialog("close");
                    }
                },
                "Abbrechen": function() {
                    $(this).dialog("close");
                }
            },
            open: function() {
                if (!taskId) {
                    $('#taskTitle').focus(); // Fokussiere auf das Titel-Feld beim Erstellen neuer Aufgaben
                }
            }
        });
    }

    // Aufgabe in der Liste aktualisieren
    function updateTaskLists() {
        // Leere die Listen
        taskList.innerHTML = '';
        plannedTaskList.innerHTML = '';

        // Aufgaben aus dem Kalender holen
        var events = calendar.getEvents();
        events.forEach(function(event) {
            var eventItem = document.createElement('div');
            eventItem.className = 'task';
            eventItem.textContent = event.title;
            eventItem.dataset.taskId = event.id;
            eventItem.dataset.taskDate = event.startStr.split('T')[0];
            eventItem.dataset.taskTime = event.startStr.split('T')[1].split(':')[0] + ':' + event.startStr.split('T')[1].split(':')[1];
            eventItem.dataset.taskDuration = (new Date(event.endStr) - new Date(event.startStr)) / 3600000; // Dauer in Stunden
            plannedTaskList.appendChild(eventItem);
        });

        // Offene Aufgaben in der Liste anzeigen
        var taskElements = document.querySelectorAll('.task.incomplete-task');
        taskElements.forEach(function(taskElement) {
            taskList.appendChild(taskElement);
        });
    }
});
