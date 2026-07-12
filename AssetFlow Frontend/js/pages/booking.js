// ============================================
// AssetFlow — Resource Booking (Screen 6)
// ============================================

const BookingPage = {
  selectedResourceId: null,
  calendarRef: null,

  render(container, params = {}) {
    const bookableAssets = Store.getBookableAssets();
    this.selectedResourceId = params.assetId || (bookableAssets[0]?.id || null);

    container.innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <div class="page-header-left">
            <h2>Resource Booking</h2>
            <p class="text-secondary text-sm">Book shared resources by time slot</p>
          </div>
          <button class="btn btn-primary" id="newBookingBtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            New Booking
          </button>
        </div>

        <div class="booking-layout">
          <!-- Resource List -->
          <div>
            <h4 class="text-sm font-semibold mb-3 text-tertiary" style="text-transform:uppercase;letter-spacing:0.05em;">Resources</h4>
            <div class="resource-list" id="resourceList">
              ${bookableAssets.map(a => `
                <div class="resource-card ${a.id === this.selectedResourceId ? 'selected' : ''}" data-resource="${a.id}">
                  <h4>${Utils.escapeHtml(a.name)}</h4>
                  <p>${Utils.escapeHtml(a.location || '—')}</p>
                  <span class="${Utils.getBadgeClass(a.status)}" style="margin-top:4px;display:inline-block;">${Utils.formatStatus(a.status)}</span>
                </div>
              `).join('')}
              ${bookableAssets.length === 0 ? '<p class="text-tertiary text-sm p-3">No bookable resources. Mark assets as "Bookable" in Asset Registration.</p>' : ''}
            </div>
          </div>

          <!-- Calendar & Bookings -->
          <div>
            <div id="bookingCalendar" class="mb-6"></div>

            <div class="card">
              <div class="card-header">
                <h3>My Bookings</h3>
              </div>
              <div id="myBookingsTable"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Resource selection
    container.querySelectorAll('.resource-card').forEach(card => {
      card.addEventListener('click', () => {
        this.selectedResourceId = card.dataset.resource;
        container.querySelectorAll('.resource-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.refreshCalendar();
      });
    });

    this.refreshCalendar();
    this.renderMyBookings();

    document.getElementById('newBookingBtn')?.addEventListener('click', () => this.openBookingModal());
  },

  refreshCalendar() {
    if (!this.selectedResourceId) return;
    const bookings = Store.getBookingsByAsset(this.selectedResourceId).map(b => {
      const user = Store.getById('users', b.userId);
      return { ...b, title: `${Utils.formatTime(b.startTime)}–${Utils.formatTime(b.endTime)} ${user?.name || ''}` };
    });

    this.calendarRef = Calendar.render('bookingCalendar', {
      events: bookings,
      onDayClick: (date) => this.openBookingModal(date),
      onEventClick: (event) => this.showBookingDetail(event)
    });
  },

  renderMyBookings() {
    const user = Auth.getCurrentUser();
    const myBookings = Store.find('bookings', b => b.userId === user.id).sort((a, b) => {
      if (a.date !== b.date) return a.date > b.date ? -1 : 1;
      return a.startTime > b.startTime ? -1 : 1;
    });

    DataTable.render('myBookingsTable', {
      data: myBookings,
      pageSize: 5,
      columns: [
        { key: 'assetId', label: 'Resource', render: (r) => {
          const asset = Store.getById('assets', r.assetId);
          return Utils.escapeHtml(asset?.name || '—');
        }},
        { key: 'date', label: 'Date', render: (r) => Utils.formatDate(r.date) },
        { key: 'startTime', label: 'Time', render: (r) => `${Utils.formatTime(r.startTime)} – ${Utils.formatTime(r.endTime)}` },
        { key: 'purpose', label: 'Purpose', render: (r) => Utils.escapeHtml(Utils.truncate(r.purpose, 30)) },
        { key: 'status', label: 'Status', render: (r) => `<span class="${Utils.getBadgeClass(r.status)}">${r.status}</span>` }
      ],
      actions: [
        { label: 'Cancel', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
          visible: (r) => r.status === 'Upcoming',
          onClick: (r) => {
            Modal.confirm('Cancel Booking', 'Are you sure you want to cancel this booking?', () => {
              Store.update('bookings', r.id, { status: 'Cancelled' });
              ActivityLogger.log(Auth.getCurrentUser().id, 'BOOKING_CANCELLED', 'booking', r.id, 'Booking cancelled');
              Toast.info('Booking cancelled');
              Router.navigate('/booking');
            });
          }
        }
      ]
    });
  },

  openBookingModal(presetDate = null) {
    const bookableAssets = Store.getBookableAssets();
    const content = `<div id="bookingFormContainer"></div><div id="overlapError"></div>`;
    Modal.open('New Booking', content);

    FormBuilder.render('bookingFormContainer', {
      values: {
        assetId: this.selectedResourceId || '',
        date: presetDate || Utils.today()
      },
      fields: [
        { key: 'assetId', label: 'Resource', type: 'select', required: true, options: bookableAssets.map(a => ({ value: a.id, label: `${a.name} (${a.location || ''})` })) },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'startTime', label: 'Start Time', type: 'time', required: true },
        { key: 'endTime', label: 'End Time', type: 'time', required: true },
        { key: 'purpose', label: 'Purpose', type: 'text', required: true, placeholder: 'e.g. Sprint Planning' },
        { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional details...' }
      ],
      submitLabel: 'Book Resource',
      onSubmit: (data) => {
        const errorEl = document.getElementById('overlapError');

        // Validate times
        if (data.startTime >= data.endTime) {
          errorEl.innerHTML = '<div class="conflict-banner"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg><p>End time must be after start time.</p></div>';
          return;
        }

        // Check overlaps
        const existingBookings = Store.getBookingsByDate(data.assetId, data.date);
        const overlap = existingBookings.find(b =>
          Utils.isOverlapping(data.date, data.startTime, data.endTime, b.date, b.startTime, b.endTime)
        );

        if (overlap) {
          const conflictUser = Store.getById('users', overlap.userId);
          errorEl.innerHTML = `
            <div class="conflict-banner" style="margin-top:12px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
              <p>Time conflict! This resource is booked ${Utils.formatTime(overlap.startTime)}–${Utils.formatTime(overlap.endTime)} by ${Utils.escapeHtml(conflictUser?.name || 'someone')} for "${Utils.escapeHtml(overlap.purpose)}". Please choose a different time.</p>
            </div>
          `;
          return;
        }

        // Create booking
        const asset = Store.getById('assets', data.assetId);
        const booking = Store.create('bookings', {
          ...data,
          userId: Auth.getCurrentUser().id,
          status: 'Upcoming'
        });

        NotificationEngine.create(Auth.getCurrentUser().id, 'BOOKING_CONFIRMED', `Your booking for ${asset.name} on ${Utils.formatDate(data.date)} at ${Utils.formatTime(data.startTime)} is confirmed.`);
        ActivityLogger.log(Auth.getCurrentUser().id, 'BOOKING_CREATED', 'booking', booking.id, `Booked ${asset.name} on ${Utils.formatDate(data.date)} ${Utils.formatTime(data.startTime)}–${Utils.formatTime(data.endTime)}`);
        Toast.success('Booking confirmed!');
        Modal.close();
        Router.navigate('/booking');
      }
    });
  },

  showBookingDetail(booking) {
    const asset = Store.getById('assets', booking.assetId);
    const user = Store.getById('users', booking.userId);

    const content = `
      <div class="asset-info-grid">
        <div class="info-item"><span class="info-label">Resource</span><span class="info-value">${Utils.escapeHtml(asset?.name || '—')}</span></div>
        <div class="info-item"><span class="info-label">Booked By</span><span class="info-value">${Utils.escapeHtml(user?.name || '—')}</span></div>
        <div class="info-item"><span class="info-label">Date</span><span class="info-value">${Utils.formatDate(booking.date)}</span></div>
        <div class="info-item"><span class="info-label">Time</span><span class="info-value">${Utils.formatTime(booking.startTime)} – ${Utils.formatTime(booking.endTime)}</span></div>
        <div class="info-item"><span class="info-label">Purpose</span><span class="info-value">${Utils.escapeHtml(booking.purpose || '—')}</span></div>
        <div class="info-item"><span class="info-label">Status</span><span class="info-value"><span class="${Utils.getBadgeClass(booking.status)}">${booking.status}</span></span></div>
      </div>
      ${booking.notes ? `<div class="mt-4"><span class="info-label">Notes</span><p class="text-sm mt-1">${Utils.escapeHtml(booking.notes)}</p></div>` : ''}
    `;

    const actions = [];
    if (booking.status === 'Upcoming' && booking.userId === Auth.getCurrentUser().id) {
      actions.push({ label: 'Cancel Booking', class: 'btn-danger', onClick: () => {
        Store.update('bookings', booking.id, { status: 'Cancelled' });
        Toast.info('Booking cancelled');
        Modal.close();
        Router.navigate('/booking');
      }});
    }
    actions.push({ label: 'Close', class: 'btn-secondary', onClick: () => Modal.close() });

    Modal.open('Booking Details', content, { actions });
  },

  destroy() { this.calendarRef = null; }
};
