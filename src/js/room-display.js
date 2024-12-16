export function displayRooms(response) {
  const container = document.getElementById('rooms-container');
  container.innerHTML = '';

  if (response && response._embedded && response._embedded.hotel_quotes) {
    const roomsWrapper = document.createElement('div');
    roomsWrapper.classList.add('rooms__grid');

    response._embedded.hotel_quotes.forEach((room) => {
      const roomCard = document.createElement('div');
      roomCard.classList.add('room-card');

      // Section with image
      const imageSection = document.createElement('div');
      imageSection.classList.add('room-card__image-section');

      const pictures = room._embedded.pictures;
      if (pictures && pictures.length > 0) {
        const img = document.createElement('img');
        img.src = pictures[0].wide;
        img.alt = pictures[0].description || room.name;
        img.classList.add('room-card__image');

        let currentImageIndex = 0;

        img.addEventListener('click', () => {
          const modal = document.getElementById('image-modal');
          const modalImg = document.getElementById('modal-image');
          const prevBtn = document.getElementById('prev-image');
          const nextBtn = document.getElementById('next-image');
          const closeBtn = document.getElementById('close-image-modal');

          let currentImageIndex = 0;

          // Funcion to update image in modal
          const updateImage = (index) => {
            currentImageIndex = index;
            const currentPic = pictures[index];
            modalImg.src = currentPic.gallery_hd || currentPic.wide;
            modalImg.alt = currentPic.description || `${room.name} - image ${index + 1}`;
          };

          // Show or hide navigation buttons
          if (pictures.length > 1) {
            prevBtn.classList.add('gallery-modal__nav--show');
            nextBtn.classList.add('gallery-modal__nav--show');
          } else {
            prevBtn.classList.remove('gallery-modal__nav--show');
            nextBtn.classList.remove('gallery-modal__nav--show');
          }

          // Navigation functions
          const handlePrev = () => {
            currentImageIndex = (currentImageIndex - 1 + pictures.length) % pictures.length;
            updateImage(currentImageIndex);
          };

          const handleNext = () => {
            currentImageIndex = (currentImageIndex + 1) % pictures.length;
            updateImage(currentImageIndex);
          };

          // Close modal
          const handleClose = () => {
            modal.classList.remove('gallery-modal--show');
            document.removeEventListener('keydown', handleKeydown);
          };

          prevBtn.onclick = handlePrev;
          nextBtn.onclick = handleNext;
          closeBtn.onclick = handleClose;

          // Keyboard navigation
          const handleKeydown = (e) => {
            if (!modal.classList.contains('gallery-modal--show')) return;

            switch (e.key) {
              case 'ArrowLeft':
                if (pictures.length > 1) handlePrev();
                break;
              case 'ArrowRight':
                if (pictures.length > 1) handleNext();
                break;
              case 'Escape':
                handleClose();
                break;
            }
          };

          document.addEventListener('keydown', handleKeydown);

          // Close modal on click outside
          modal.onclick = (e) => {
            if (e.target === modal) handleClose();
          };

          // Show first image
          updateImage(0);
          modal.classList.add('gallery-modal--show');
        });

        imageSection.appendChild(img);
      }

      // Info section
      const infoSection = document.createElement('div');
      infoSection.classList.add('room-card__info-section');

      // Room title
      const title = document.createElement('h3');
      title.classList.add('room-card__title');
      title.textContent = room.name;
      infoSection.appendChild(title);

      // Room details
      const details = document.createElement('div');
      details.classList.add('room-card__details');
      details.innerHTML = `
                <span>${room.room_size_min}m² - max. ${room.max_capacity} persons</span>
            `;
      infoSection.appendChild(details);

      // Description
      if (room.description_long) {
        const description = document.createElement('p');
        description.classList.add('room-card__description');
        description.textContent = room.description_long;
        infoSection.appendChild(description);
      }

      // Amenities
      if (room._embedded.amenities && room._embedded.amenities.length > 0) {
        const amenities = document.createElement('ul');
        amenities.classList.add('room-card__amenities');
        const amenitiesList = room._embedded.amenities
          .map((a) => `<li class="room-card__amenity">${a.description}</li>`)
          .join('');
        amenities.innerHTML = amenitiesList;
        infoSection.appendChild(amenities);
      }

      // Box with price
      const priceBox = document.createElement('div');
      priceBox.classList.add('room-card__price-box');
      priceBox.innerHTML = `
                <div class="room-card__price-details">
                    <span class="room-card__price-label">Price per stay</span>
                    <span class="room-card__price-value">${room.full_formatted_price}</span>
                    <span class="room-card__price-per-person">${room.full_price_pp}€ per person</span>
                </div>
            `;
      infoSection.appendChild(priceBox);

      // Card
      roomCard.appendChild(imageSection);
      roomCard.appendChild(infoSection);
      roomsWrapper.appendChild(roomCard);
    });

    container.appendChild(roomsWrapper);
  } else {
    container.innerHTML =
      '<p>Any rooms available for selected dates. Please try different dates.</p>';
  }
}
