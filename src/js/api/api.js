import axios from 'axios';

const HOTEL_ID = 15823;
const BASE_URL = 'https://api.travelcircus.net';

export async function fetchAvailability({ adults, children, dateStart, dateEnd }) {
  const party = encodeURIComponent(JSON.stringify({ adults: parseInt(adults), children: [] }));
  const url = `${BASE_URL}/hotels/${HOTEL_ID}/checkins?E&party=${party}&domain=de&date_start=${dateStart}&date_end=${dateEnd}`;
  const response = await axios.get(url);
  return response.data;
}

export async function fetchRooms({ startDate, endDate, adults, children }) {
  const party = encodeURIComponent(JSON.stringify({ adults: parseInt(adults), children: [] }));
  const url = `${BASE_URL}/hotels/${HOTEL_ID}/quotes?locale=de_DE&checkin=${startDate}&checkout=${endDate}&party=${party}&domain=de`;
  const response = await axios.get(url);
  return response.data;
}
