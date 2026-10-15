'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');
function closeMenu() {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia('(min-width: 701px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const galleryTrack = document.querySelector('.gallery-track');
const galleryPrev = document.querySelector('.gallery-prev');
const galleryNext = document.querySelector('.gallery-next');
function updateGalleryControls() {
  galleryPrev.disabled = galleryTrack.scrollLeft <= 2;
  galleryNext.disabled = galleryTrack.scrollLeft >= galleryTrack.scrollWidth - galleryTrack.clientWidth - 2;
}
function moveGallery(direction) {
  const step = galleryTrack.querySelector('.gallery-item').getBoundingClientRect().width + 22;
  galleryTrack.scrollBy({ left: step * direction });
}
galleryPrev.addEventListener('click', () => moveGallery(-1));
galleryNext.addEventListener('click', () => moveGallery(1));
galleryTrack.addEventListener('scroll', updateGalleryControls, { passive: true });
window.addEventListener('resize', updateGalleryControls);
updateGalleryControls();

function openDialog(dialog) {
  closeMenu();
  dialog.showModal();
  document.body.classList.add('modal-open');
}
document.querySelectorAll('[data-close]').forEach(button => {
  button.addEventListener('click', () => document.getElementById(button.dataset.close).close());
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
});

const photos = [...document.querySelectorAll('.gallery-item')].map(item => ({
  src: item.querySelector('img').getAttribute('src'),
  alt: item.querySelector('img').alt,
  caption: item.querySelector('.gallery-caption > span').textContent
}));
const lightbox = document.getElementById('lightbox');
let photoIndex = 0;
function renderPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  const photo = photos[photoIndex];
  const image = document.getElementById('lightbox-image');
  image.src = photo.src;
  image.alt = photo.alt;
  document.getElementById('lightbox-caption').textContent = photo.caption;
  document.getElementById('lightbox-count').textContent = `${photoIndex + 1} / ${photos.length}`;
}
document.querySelectorAll('[data-image]').forEach(button => {
  button.addEventListener('click', () => {
    renderPhoto(Number(button.dataset.image));
    openDialog(lightbox);
  });
});
document.querySelector('.lightbox-prev').addEventListener('click', () => renderPhoto(photoIndex - 1));
document.querySelector('.lightbox-next').addEventListener('click', () => renderPhoto(photoIndex + 1));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    renderPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});

const booking = document.getElementById('booking-dialog');
const form = document.getElementById('booking-form');
const typeInput = document.getElementById('booking-type');
const interestInput = document.getElementById('booking-interest');
const dateInput = document.getElementById('booking-date');
const timeInput = document.getElementById('booking-time');
const phoneInput = document.getElementById('booking-phone');
const nameInput = document.getElementById('booking-name');
const ready = document.getElementById('booking-ready');
const error = document.getElementById('form-error');
const requestOptions = {
  appointment: ['Help me choose', 'Hair styling & treatments', 'Makeup & bridal artistry', 'Skin & glass skin treatments', 'Nail extensions & artistry', 'Eyelash extensions', 'Microblading & PMU'],
  academy: ['Help me choose a course', 'Hair Designing', 'Makeup Artistry', 'Beauty Therapy', 'Nail Extensions', 'Eyelash Extensions', 'Microblading & PMU'],
  seminar: ['Lotus Professional Miraki Glass Skin — 16 Oct 2026'],
  callback: ['Salon services', 'Academy courses', 'Free seminar', 'General enquiry']
};
function todayInIndia() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const part = type => parts.find(item => item.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
function updateBookingType(interest = '') {
  const type = typeInput.value;
  interestInput.replaceChildren(...requestOptions[type].map(value => new Option(value, value)));
  if (requestOptions[type].includes(interest)) interestInput.value = interest;
  document.getElementById('interest-label').textContent = type === 'academy' ? 'Your course' : type === 'appointment' ? 'Your treatment' : type === 'seminar' ? 'Your seminar' : 'What would you like to discuss?';
  const scheduled = type === 'appointment';
  document.getElementById('schedule-fields').hidden = !scheduled;
  dateInput.disabled = !scheduled;
  timeInput.disabled = !scheduled;
  dateInput.required = scheduled;
  timeInput.required = scheduled;
  dateInput.min = todayInIndia();
  document.getElementById('seminar-booking-note').hidden = type !== 'seminar';
  error.textContent = '';
}
function showBookingForm() {
  form.hidden = false;
  ready.hidden = true;
}
typeInput.addEventListener('change', () => updateBookingType());
document.querySelectorAll('[data-book]').forEach(button => {
  button.addEventListener('click', () => {
    showBookingForm();
    typeInput.value = button.dataset.book;
    updateBookingType(button.dataset.interest);
    openDialog(booking);
    booking.scrollTop = 0;
  });
});
phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));
nameInput.addEventListener('input', () => nameInput.setCustomValidity(''));
form.addEventListener('submit', event => {
  event.preventDefault();
  error.textContent = '';
  if (nameInput.value.trim().length < 2) {
    nameInput.setCustomValidity('Please enter your name.');
    nameInput.reportValidity();
    return;
  }
  let phone = phoneInput.value.replace(/[\s()+-]/g, '');
  if (phone.length === 12 && phone.startsWith('91')) phone = phone.slice(2);
  if (!/^[6-9]\d{9}$/.test(phone)) {
    phoneInput.setCustomValidity('Enter a valid 10-digit Indian mobile number, with or without +91.');
    phoneInput.reportValidity();
    return;
  }
  if (typeInput.value === 'appointment' && dateInput.value < todayInIndia()) {
    error.textContent = 'Please choose today or a future date.';
    dateInput.focus();
    return;
  }
  const fields = new FormData(form);
  const typeLabel = typeInput.selectedOptions[0].textContent;
  let message = `Hello SK Hair Bar!\n\nI’d like to: ${typeLabel}\nName: ${fields.get('name').trim()}\nPhone: +91 ${phone}\nInterest: ${interestInput.value}`;
  if (typeInput.value === 'appointment') {
    const date = new Date(`${dateInput.value}T12:00:00+05:30`);
    const readableDate = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    message += `\nPreferred date: ${readableDate}\nPreferred time: ${timeInput.value}`;
  }
  if (typeInput.value === 'academy') message += '\nI’m interested in the ONE + ONE COURSE FREE offer.';
  if (typeInput.value === 'seminar') message += '\nSeminar: 16 October 2026, 11 AM – 3 PM IST';
  if (fields.get('notes').trim()) message += `\nNotes: ${fields.get('notes').trim()}`;
  message += '\n\nPlease contact me to confirm the details. Thank you!';
  document.getElementById('request-summary').textContent = message;
  document.getElementById('whatsapp-link').href = `https://wa.me/916283786032?text=${encodeURIComponent(message)}`;
  form.hidden = true;
  ready.hidden = false;
  booking.scrollTop = 0;
  document.getElementById('whatsapp-link').focus();
});
document.getElementById('edit-request').addEventListener('click', () => {
  showBookingForm();
  nameInput.focus();
});
updateBookingType();
