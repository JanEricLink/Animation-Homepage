document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var taskList = document.getElementById('task-list');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        editable: true,
        droppable: true,
        eventReceive: function(info) {
            info.draggedEl.parentNode.removeChild(info.draggedEl);
            updateTaskList();
        },
        eventChange: function(info) {
            updateTaskList();
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
        openTaskDialog(taskId, taskTitle, $(this).data('task-date'), $(this).data('task-time'), $(this).data('task-duration'));
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
                            var event = calendar.getEventById(taskId);
                            if (event) {
                                event.setProp('title', taskTitle);
                                event.setStart(eventStart);
                                event.setEnd(eventEnd);
                            }
                        } else {
                            taskId = new Date().getTime();
                            calendar.addEvent({
                                id: taskId,
                                title: taskTitle,
                                start: eventStart,
                                end: eventEnd,
                                allDay: false
                            });
                        }
                    } else {
                        if (!taskId) {
                            taskId = new Date().getTime();
                            var taskElement = $('<div>', {
                                class: 'task',
                                text: taskTitle,
                                'data-task-id': taskId,
                                'data-task-date': taskDate,
                                'data-task-time': taskTime,
                                'data-task-duration': taskDuration
                            });
                            taskList.appendChild(taskElement[0]);
                        } else {
                            var taskElement = $(`.task[data-task-id='${taskId}']`);
                            taskElement.text(taskTitle);
                            taskElement.data('task-date', taskDate);
                            taskElement.data('task-time', taskTime);
                            taskElement.data('task-duration', taskDuration);
                        }
                    }

                    updateTaskList();
                    $(this).dialog("close");
                },
                "Abbrechen": function() {
                    $(this).dialog("close");
                }
            }
        });
    }

    // Aufgaben- und Eventliste aktualisieren und sortieren
    function updateTaskList() {
        taskList.innerHTML = '';

        // Ungeplante Aufgaben
        $('.task').each(function() {
            var taskElement = $(this);
            taskList.appendChild(taskElement[0]);
        });

        // Geplante Aufgaben (im Kalender)
        var events = calendar.getEvents();
        events.forEach(function(event) {
            var taskElement = $('<div>', {
                class: 'task',
                text: event.title,
                'data-task-id': event.id,
                'data-task-date': event.start.toISOString().slice(0, 10),
                'data-task-time': event.start.toISOString().slice(11, 16),
                'data-task-duration': (event.end - event.start) / (1000 * 60 * 60)
            });

            var editButton = $('<button>', {
                class: 'editEvent',
                text: 'Bearbeiten',
                'data-event-id': event.id
            });

            var deleteButton = $('<button>', {
                class: 'deleteEvent',
                text: 'Löschen',
                'data-event-id': event.id
            });

            taskElement.append(editButton).append(deleteButton);
            taskList.appendChild(taskElement[0]);
        });

        // Drag-and-Drop für Aufgaben
        $('.task').draggable({
            helper: 'clone',
            revert: 'invalid',
            start: function(event, ui) {
                $(ui.helper).css('width', '300px');
            }
        });

        // Drop in den Kalender
        calendarEl.addEventListener('drop', function(event) {
            var droppedTask = $(event.target).closest('.task');
            if (droppedTask.length) {
                var taskId = droppedTask.data('task-id');
                var taskTitle = droppedTask.text();
                var taskDate = droppedTask.data('task-date') || new Date().toISOString().slice(0, 10);
                var taskTime = droppedTask.data('task-time') || '09:00';
                var taskDuration = droppedTask.data('task-duration') || 1;

                var eventStart = taskDate + 'T' + taskTime;
                var eventEnd = new Date(new Date(eventStart).getTime() + taskDuration * 60 * 60 * 1000).toISOString();

                calendar.addEvent({
                    id: taskId,
                    title: taskTitle,
                    start: eventStart,
                    end: eventEnd,
                    allDay: false
                });

                droppedTask.remove();
                updateTaskList();
            }
        });
    }
});
