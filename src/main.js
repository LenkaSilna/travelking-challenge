import './scss/main.scss';

import { fetchAvailability, fetchRooms } from './js/api.js';
import {
  initCalendar,
  getSelectedDates,
  updateCalendarData,
  resetCalendarSelection,
} from './js/calendar.js';
import { displayRooms } from './js/room-display.js';
import 'flatpickr/dist/flatpickr.min.css';

document.addEventListener('DOMContentLoaded', () => {
  const checkAvailabilityBtn = document.getElementById('check-availability-btn');
  const closeModalBtn = document.getElementById('close-calendar-modal-btn');
  const calendarModal = document.getElementById('calendar-modal');
  const checkRoomsBtn = document.getElementById('check-rooms-btn');
  const resetButton = document.getElementById('reset-calendar-and-results-btn');
  const roomsContainer = document.getElementById('rooms-container');
  const selectedDatesInfo = document.getElementById('selected-dates-info');
  const loader = document.getElementById('loader');

  const showLoader = () => {
    if (loader) loader.classList.add('show');
  };

  const hideLoader = () => {
    if (loader) loader.classList.remove('show');
  };

  checkAvailabilityBtn.addEventListener('click', async () => {
    const adults = document.getElementById('adults').value;
    const children = document.getElementById('children').value;
    const dateStart = document.getElementById('date-start').value;
    const dateEnd = document.getElementById('date-end').value;

    const response = await fetchAvailability({ adults, children, dateStart, dateEnd });
    const availabilities = response._embedded.hotel_availabilities;

    updateCalendarData(availabilities);
    initCalendar();

    calendarModal.classList.add('show');

    closeModalBtn.addEventListener('click', () => {
      calendarModal.classList.remove('show');
      resetCalendarSelection();
    });
  });

  checkRoomsBtn.addEventListener('click', async () => {
    const { startDate, endDate } = getSelectedDates();

    if (startDate && endDate) {
      const adults = document.getElementById('adults').value;
      const children = document.getElementById('children').value;

      calendarModal.classList.remove('show');
      showLoader();

      try {
        const roomsData = await fetchRooms({ startDate, endDate, adults, children });

        displayRooms(roomsData);
      } catch (error) {
        console.error('Error loading rooms:', error);
        roomsContainer.innerHTML = '<p>Error loading results. Please try again.</p>';
      } finally {
        hideLoader();
      }
    } else {
      // If no valid dates are selected, show a message
      roomsContainer.innerHTML = '<p>Please select a valid date range.</p>';
    }
  });

  resetButton.addEventListener('click', () => {
    // Reset calendar
    if (typeof resetCalendarSelection === 'function') {
      resetCalendarSelection();
    }

    // Reset results container
    if (roomsContainer) {
      roomsContainer.innerHTML =
        '<p>The results have been reset. Select a new date and availability.</p>';
    }

    // Reset info about selected dates
    if (selectedDatesInfo) {
      selectedDatesInfo.textContent = 'The selection has been reset. Select a new date.';
    }
  });
});
