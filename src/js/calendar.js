import flatpickr from 'flatpickr';
import { format, parseISO, addDays, differenceInDays } from 'date-fns';

let availabilityData = [];
let selectedStartDate = null;
let selectedEndDate = null;
let minNightsForSelectedStart = 1;
let totalPrice = 0;
let tooltipElem = null;
let calendarInstances = [];
const isMobile = window.matchMedia('(max-width: 768px)').matches;

export function updateCalendarData(data) {
  console.log('Loaded availability data:', data);
  availabilityData = data;
}

export function initCalendar() {
  const calendar1Container = document.getElementById('calendar1-container');
  const infoElem = document.getElementById('selected-dates-info');

  if (!calendar1Container) {
    console.error('Calendar container not found!');
    return;
  }

  const showTooltip = (element, message) => {
    if (!tooltipElem) {
      tooltipElem = document.createElement('div');
      tooltipElem.classList.add('tooltip');
      document.body.appendChild(tooltipElem);
    }
    tooltipElem.textContent = message;
    const rect = element.getBoundingClientRect();
    tooltipElem.style.left = `${rect.left + window.scrollX}px`;
    tooltipElem.style.top = `${rect.top + window.scrollY - 30}px`;
    tooltipElem.style.display = 'block';
    tooltipElem.style.opacity = '1';
  };

  const hideTooltip = () => {
    if (tooltipElem) {
      tooltipElem.style.display = 'none';
      tooltipElem.style.opacity = '0';
    }
  };

  const isRangeValid = (startDate, endDate) => {
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayData = availabilityData.find((d) => d.date === dateStr);
      if (!dayData) {
        return false;
      }
      currentDate = addDays(currentDate, 1);
    }
    return true;
  };

  const calculateTotalPrice = (startDate, endDate) => {
    const totalDays = differenceInDays(endDate, startDate) + 1;
    let price = 0;

    for (let i = 0; i < totalDays; i++) {
      const dateStr = format(addDays(startDate, i), 'yyyy-MM-dd');
      const dayData = availabilityData.find((d) => d.date === dateStr);
      if (dayData) price += dayData.price;
    }
    return price;
  };

  const handleSelection = (selectedDates, dateStr, instance) => {
    if (selectedDates.length === 1) {
      // First date was selected
      const firstDate = selectedDates[0];
      const dateStr = format(firstDate, 'yyyy-MM-dd');
      const dayData = availabilityData.find((d) => d.date === dateStr);

      if (!dayData) {
        instance.clear();
        return; // Selected date is not available
      }

      selectedStartDate = dateStr;
      selectedEndDate = null;
      minNightsForSelectedStart = dayData.min_nights;

      const selectedDayElem = instance.calendarContainer.querySelector('.flatpickr-day.selected');
      if (selectedDayElem) {
        showTooltip(
          selectedDayElem,
          `Minimum length of stay: ${minNightsForSelectedStart} nights.`
        );
      }

      if (infoElem) {
        const formatteddateStr = format(parseISO(dateStr), 'EEE. d.M. yyyy');
        infoElem.textContent = `${formatteddateStr}. Choose the final day (min. ${minNightsForSelectedStart} nights).`;
      }
    } else if (selectedDates.length === 2) {
      // Second date was selected
      let [startDate, endDate] = selectedDates;

      // Allow two-way selection
      const nights = Math.abs(differenceInDays(endDate, startDate));

      // Check if range is valid
      if (
        !isRangeValid(
          startDate < endDate ? startDate : endDate,
          startDate < endDate ? endDate : startDate
        )
      ) {
        const selectedDayElem = instance.calendarContainer.querySelector('.flatpickr-day.selected');
        if (selectedDayElem) {
          showTooltip(selectedDayElem, 'The selected range includes unavailable days.');
        }
        instance.setDate([startDate]);
        return;
      }

      // Check if min nights for selected start date are met
      if (nights < minNightsForSelectedStart) {
        const selectedDayElem = instance.calendarContainer.querySelector('.flatpickr-day.selected');
        if (selectedDayElem) {
          showTooltip(
            selectedDayElem,
            `Minimální délka pobytu je ${minNightsForSelectedStart} nocí.`
          );
        }
        // Reset selection
        instance.setDate([startDate]);
        return;
      }

      // Save selected dates
      selectedStartDate = format(startDate, 'yyyy-MM-dd');
      selectedEndDate = format(endDate, 'yyyy-MM-dd');
      totalPrice = calculateTotalPrice(
        startDate < endDate ? startDate : endDate,
        startDate < endDate ? endDate : startDate
      );
      hideTooltip();

      if (infoElem) {
        const formattedStartDate = format(parseISO(selectedStartDate), 'EEE. d.M. yyyy');
        const formattedEndDate = format(parseISO(selectedEndDate), 'EEE. d.M. yyyy');
        infoElem.textContent = `${formattedStartDate} → ${formattedEndDate} | Total: ${totalPrice}€ (${nights} nights)`;
      }
    }
  };

  const firstAvailableDate =
    availabilityData.length > 0 ? parseISO(availabilityData[0].date) : new Date();

  const calendar = flatpickr(calendar1Container, {
    mode: 'range',
    dateFormat: 'Y-m-d',
    inline: true,
    defaultDate: null,
    defaultMonth: format(firstAvailableDate, 'yyyy-MM'),
    showMonths: isMobile ? 1 : 2,
    monthSelectorType: 'static',
    enableTime: false,
    disableMobile: true,
    showDaysInNextAndPreviousMonths: true,
    locale: {
      firstDayOfWeek: 1,
    },
    onDayCreate: (dObj, dStr, fp, dayElem) => {
      const dateStr = format(dayElem.dateObj, 'yyyy-MM-dd');
      const dayData = availabilityData.find((d) => d.date === dateStr);

      // Wrap day number and price in separate elements
      const dayNumber = document.createElement('span');
      dayNumber.className = 'day-number';
      dayNumber.textContent = dayElem.textContent;
      dayElem.textContent = '';
      dayElem.appendChild(dayNumber);
      const priceElem = document.createElement('span');
      priceElem.classList.add('day-price');

      if (dayData) {
        const priceElem = document.createElement('span');
        priceElem.classList.add('day-price', dayData.price_position);
        priceElem.textContent = `${dayData.price}€`;
        dayElem.appendChild(priceElem);
      } else {
        dayElem.classList.add('no-data');
        priceElem.textContent = '--';
        dayElem.appendChild(priceElem);
      }
    },
    onChange: handleSelection,
    onClose: () => hideTooltip(),
  });

  calendarInstances = [calendar];
}

export function resetCalendarSelection() {
  selectedStartDate = null;
  selectedEndDate = null;
  minNightsForSelectedStart = 1;
  totalPrice = 0;

  if (tooltipElem) {
    tooltipElem.style.display = 'none';
    tooltipElem.style.opacity = '0';
  }

  if (calendarInstances.length > 0) {
    calendarInstances.forEach((instance) => instance.clear());
  }
}

export function getSelectedDates() {
  return {
    startDate: selectedStartDate,
    endDate: selectedEndDate,
    totalPrice: totalPrice,
  };
}
