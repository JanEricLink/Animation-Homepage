document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var taskList = document.getElementById('task-list');
    var eventListContent = document.getElementById('event-list-content');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        editable: true,
        droppable: true,
        eventReceive: function(info) {
            info.draggedEl.parentNode.removeChild(info.draggedEl);
            updateEventList();
        },
        eventChange: function(info) {
            updateEventList();
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

    // Toggle für Terminliste
    $('#toggleEventList').on('click', function() {
        $('#eventList').toggle();
        $(this).text($('#eventList').is(':visible') ? 'Termine ausblenden' : 'Termine anzeigen');
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
                        // Alle notwendigen Informationen vorhanden, Aufgabe direkt in den Kalender eintragen
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
                            taskId = new Date().getTime(); // Einfache ID-Generierung
                            calendar.addEvent({
                                id: taskId,
                                title: taskTitle,
                                start: eventStart,
                                end: eventEnd,
                                allDay: false
                            });
                        }
                        updateEventList();
                    } else {
                        // Nicht genügend Informationen, Aufgabe in der Checkliste belassen
                        if (!taskId) {
                            taskId = new Date().getTime(); // Einfache ID-Generierung
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
                            // Aufgabe bearbeiten
                            var taskElement = $(`.task[data-task-id='${taskId}']`);
                            taskElement.text(taskTitle);
                            taskElement.data('task-date', taskDate);
                            taskElement.data('task-time', taskTime);
                            taskElement.data('task-duration', taskDuration);
                        }
                    }

                    $(this).dialog("close");
                },
                "Abbrechen": function() {
                    $(this).dialog("close");
                }
            }
        });
    }

    // Event-Liste aktualisieren
    function updateEventList() {
        eventListContent.innerHTML = '';
        var events = calendar.getEvents();
        events.forEach(function(event) {
            var eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.innerHTML = `
                <span><strong>${event.title}</strong> - ${event.start.toLocaleString()}</span>
                <button class="editEvent" data-event-id="${event.id}">Bearbeiten</button>
                <button class="deleteEvent" data-event-id="${event.id}">Löschen</button>
            `;
            eventListContent.appendChild(eventItem);
        });

        // Bearbeiten von Terminen
        $('.editEvent').on('click', function() {
            var eventId = $(this).data('event-id');
            var event = calendar.getEventById(eventId);
            $('#taskId').val(event.id);
            $('#taskTitle').val(event.title);
            $('#taskDate').val(event.start.toISOString().slice(0, 10));
            $('#taskTime').val(event.start.toISOString().slice(11, 16));
            $('#taskDuration').val((event.end - event.start) / (1000 * 60 * 60));
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
                            event.setProp('title', taskTitle);
                            event.setStart(eventStart);
                            event.setEnd(eventEnd);

                            updateEventList();
                            $(this).dialog("close");
                        }
                    },
                    "Abbrechen": function() {
                        $(this).dialog("close");
                    }
                }
            });
        });

        // Löschen von Terminen
        $('.deleteEvent').on('click', function() {
            var eventId = $(this).data('event-id');
            var event = calendar.getEventById(eventId);
            event.remove();
            updateEventList();
        });
    }
});
