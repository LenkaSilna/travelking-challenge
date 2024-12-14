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
  const roomsContainer = document.getElementById('rooms-container'); // Kontejner pro výsledky pokojů
  const selectedDatesInfo = document.getElementById('selected-dates-info'); // Info o vybraných datech
  const loader = document.getElementById('loader');

  const showLoader = () => {
    if (loader) loader.classList.add('show');
  };

  const hideLoader = () => {
    if (loader) loader.classList.remove('show');
  };

  // Zpracování tlačítka "Zkontrolovat dostupnost"
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

  // Zpracování tlačítka "Zobrazit pokoje"
  checkRoomsBtn.addEventListener('click', async () => {
    const { startDate, endDate } = getSelectedDates();

    if (startDate && endDate) {
      const adults = document.getElementById('adults').value;
      const children = document.getElementById('children').value;

      calendarModal.classList.remove('show');
      showLoader();

      try {
        const roomsData = await fetchRooms({ startDate, endDate, adults, children });

        // Po načtení dat schovat loader a zobrazit výsledky
        displayRooms(roomsData);
      } catch (error) {
        console.error('Chyba při načítání pokojů:', error);
        roomsContainer.innerHTML = '<p>Chyba při načítání výsledků. Zkuste to prosím znovu.</p>';
      } finally {
        // Schovat loader, ať už byl požadavek úspěšný nebo ne
        hideLoader();
      }
    } else {
      // Pokud není vybráno správné datum
      roomsContainer.innerHTML = '<p>Vyberte prosím platný rozsah dat.</p>';
    }
  });

  // Zpracování tlačítka "Reset výběru a výsledků"
  resetButton.addEventListener('click', () => {
    console.log('Resetting calendar and results');

    // Reset kalendáře
    if (typeof resetCalendarSelection === 'function') {
      resetCalendarSelection();
    }

    // Reset zobrazených výsledků pokojů
    if (roomsContainer) {
      roomsContainer.innerHTML =
        '<p>Výsledky byly resetovány. Vyberte nové datum a dostupnost.</p>';
    }

    // Reset informačního prvku o vybraných datech
    if (selectedDatesInfo) {
      selectedDatesInfo.textContent = 'Výběr byl resetován. Vyberte nové datum.';
    }
  });
});
