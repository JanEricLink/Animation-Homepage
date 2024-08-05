document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        editable: true,
        droppable: true,
        eventReceive: function(info) {
            // Entferne das Element aus der Checkliste, wenn es in den Kalender gezogen wird
            info.draggedEl.parentNode.removeChild(info.draggedEl);
        }
    });

    calendar.render();

    // Aufgaben zum Drag-and-Drop vorbereiten
    $('.task').draggable({
        revert: true,
        revertDuration: 0,
        helper: 'clone',
        start: function() {
            // setData um die Aufgabe zu identifizieren
            var taskId = $(this).data('task-id');
            $(this).data('event', {
                title: $(this).text(),
                id: taskId,
                duration: '01:00', // Standarddauer für eine Aufgabe
                allDay: false
            });
        }
    });

    // Den Kalender als Droppable-Element definieren
    $('#calendar').droppable({
        accept: '.task',
        drop: function(event, ui) {
            var eventObj = ui.helper.data('event');
            calendar.addEvent(eventObj);
        }
    });
});
