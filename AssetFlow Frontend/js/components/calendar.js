// ============================================
// AssetFlow — Calendar Component
// ============================================

const Calendar = {
  render(containerId, config = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const state = {
      year: config.year || new Date().getFullYear(),
      month: config.month || new Date().getMonth(),
      events: config.events || [],
      onDayClick: config.onDayClick || null,
      onEventClick: config.onEventClick || null
    };

    const renderCalendar = () => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      const firstDay = new Date(state.year, state.month, 1).getDay();
      const daysInMonth = new Date(state.year, state.month + 1, 0).getDate();
      const daysInPrevMonth = new Date(state.year, state.month, 0).getDate();
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      let calendarDays = '';

      // Previous month days
      for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        calendarDays += `<div class="calendar-day other-month"><div class="calendar-day-number">${day}</div></div>`;
      }

      // Current month days
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${state.year}-${String(state.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;
        const dayEvents = state.events.filter(e => e.date === dateStr);

        calendarDays += `
          <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
            <div class="calendar-day-number">${d}</div>
            ${dayEvents.slice(0, 3).map(e => `
              <div class="calendar-event booking-${(e.status || 'upcoming').toLowerCase()}" data-event-id="${e.id}" title="${Utils.escapeHtml(e.title || e.purpose || '')}">
                ${Utils.escapeHtml(Utils.truncate(e.title || e.purpose || 'Booking', 20))}
              </div>
            `).join('')}
            ${dayEvents.length > 3 ? `<div class="calendar-event" style="background:var(--bg-elevated);color:var(--text-tertiary);font-size:9px;">+${dayEvents.length - 3} more</div>` : ''}
          </div>
        `;
      }

      // Next month days
      const totalCells = firstDay + daysInMonth;
      const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for (let i = 1; i <= remaining; i++) {
        calendarDays += `<div class="calendar-day other-month"><div class="calendar-day-number">${i}</div></div>`;
      }

      container.innerHTML = `
        <div class="calendar">
          <div class="calendar-header">
            <button class="btn btn-icon btn-ghost" id="${containerId}_prev">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <h4>${months[state.month]} ${state.year}</h4>
            <button class="btn btn-icon btn-ghost" id="${containerId}_next">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <div class="calendar-grid">
            ${days.map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
            ${calendarDays}
          </div>
        </div>
      `;

      // Bind events
      document.getElementById(`${containerId}_prev`).addEventListener('click', () => {
        state.month--;
        if (state.month < 0) { state.month = 11; state.year--; }
        renderCalendar();
      });
      document.getElementById(`${containerId}_next`).addEventListener('click', () => {
        state.month++;
        if (state.month > 11) { state.month = 0; state.year++; }
        renderCalendar();
      });

      // Day click
      if (state.onDayClick) {
        container.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
          day.addEventListener('click', (e) => {
            if (e.target.closest('.calendar-event')) return;
            state.onDayClick(day.dataset.date);
          });
        });
      }

      // Event click
      if (state.onEventClick) {
        container.querySelectorAll('.calendar-event[data-event-id]').forEach(ev => {
          ev.addEventListener('click', (e) => {
            e.stopPropagation();
            const event = state.events.find(evt => evt.id === ev.dataset.eventId);
            if (event) state.onEventClick(event);
          });
        });
      }
    };

    renderCalendar();

    return {
      refresh(newEvents) {
        state.events = newEvents;
        renderCalendar();
      },
      setMonth(year, month) {
        state.year = year;
        state.month = month;
        renderCalendar();
      }
    };
  }
};
