const radiusButton = document.getElementById('radius-button');
const radiusMenu = document.querySelector('.radius-menu');
const radiusLabel = document.getElementById('radius-label');
const radiusOptions = radiusMenu.querySelectorAll('button[role="option"]');
const scooterToggle = document.getElementById('scooter-toggle');
const destinationInput = document.getElementById('destination-input');
const template = document.getElementById('suggestions-template');
const mapInnerRadius = document.querySelector('.map-radius--inner');
const mapOuterRadius = document.querySelector('.map-radius--outer');

const suggestions = [
  '강남역 11번 출구',
  '잠실 롯데월드타워',
  '서울숲 입구',
  '홍대입구역 9번 출구'
];

let suggestionLayer;

function toggleRadiusMenu(forceState) {
  const willOpen = typeof forceState === 'boolean' ? forceState : !radiusMenu.classList.contains('is-open');
  radiusMenu.classList.toggle('is-open', willOpen);
  radiusButton.setAttribute('aria-expanded', willOpen.toString());
}

radiusButton.addEventListener('click', () => {
  toggleRadiusMenu();
});

radiusButton.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    toggleRadiusMenu(true);
    radiusOptions[0].focus();
  }
});

radiusOptions.forEach((option) => {
  option.addEventListener('click', () => {
    radiusOptions.forEach((opt) => opt.removeAttribute('aria-selected'));
    option.setAttribute('aria-selected', 'true');
    const minutes = Number(option.dataset.radius);
    radiusLabel.textContent = `${minutes}분 반경`;

    const sizeMultiplier = minutes / 10;
    mapInnerRadius.style.width = `${120 * sizeMultiplier}px`;
    mapInnerRadius.style.height = `${120 * sizeMultiplier}px`;
    mapOuterRadius.style.width = `${220 * sizeMultiplier}px`;
    mapOuterRadius.style.height = `${220 * sizeMultiplier}px`;

    toggleRadiusMenu(false);
  });
});

document.addEventListener('click', (event) => {
  if (!radiusButton.contains(event.target) && !radiusMenu.contains(event.target)) {
    toggleRadiusMenu(false);
  }
});

scooterToggle.addEventListener('click', () => {
  const isActive = scooterToggle.classList.toggle('is-active');
  scooterToggle.setAttribute('aria-pressed', isActive.toString());
  scooterToggle.style.boxShadow = isActive ? '0 8px 20px rgba(37, 99, 235, 0.35)' : 'none';
  mapInnerRadius.style.borderColor = isActive ? 'rgba(37, 99, 235, 0.5)' : 'rgba(148, 163, 184, 0.4)';
  mapInnerRadius.style.boxShadow = isActive
    ? '0 0 24px rgba(37, 99, 235, 0.4) inset'
    : '0 0 24px rgba(148, 163, 184, 0.2) inset';
});

function ensureSuggestionLayer() {
  if (suggestionLayer) return suggestionLayer;
  suggestionLayer = template.content.firstElementChild.cloneNode(true);
  destinationInput.parentElement.appendChild(suggestionLayer);
  suggestions.forEach((label) => {
    const item = document.createElement('li');
    item.tabIndex = 0;
    item.textContent = label;
    item.addEventListener('mousedown', (event) => {
      event.preventDefault();
      destinationInput.value = label;
      hideSuggestions();
    });
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        destinationInput.value = label;
        hideSuggestions();
      }
    });
    suggestionLayer.appendChild(item);
  });
  return suggestionLayer;
}

function showSuggestions() {
  ensureSuggestionLayer().classList.add('is-visible');
}

function hideSuggestions() {
  if (!suggestionLayer) return;
  suggestionLayer.classList.remove('is-visible');
}

destinationInput.addEventListener('focus', showSuggestions);

destinationInput.addEventListener('input', () => {
  const query = destinationInput.value.trim();
  ensureSuggestionLayer().querySelectorAll('li').forEach((item) => {
    const matches = item.textContent.includes(query);
    item.style.display = matches || !query ? 'block' : 'none';
  });
  showSuggestions();
});

destinationInput.addEventListener('blur', () => {
  setTimeout(hideSuggestions, 120);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    hideSuggestions();
    toggleRadiusMenu(false);
  }
});
