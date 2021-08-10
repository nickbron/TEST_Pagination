import './css/styles.css';
import API from './js/fetchPictures';
import Notiflix from 'notiflix';
import cardsTpl from './templates/cards.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.css';
import Pagination from 'tui-pagination';
import 'tui-pagination/dist/tui-pagination.css';
//import { Spinner } from 'spin.js';
//import { pagination} from "pagination.js"

let lightbox = new SimpleLightbox('.gallery a');
let pageNumber;
let name;

const optionsTui = {
  // below default value of options
  totalItems: 100,
  itemsPerPage: 10,
  visiblePages: 10,
  page: 1,
  centerAlign: true,
  firstItemClassName: 'tui-first-child',
  lastItemClassName: 'tui-last-child',
  template: {
    page: '<a href="#" class="tui-page-btn">{{page}}</a>',
    currentPage: '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
    moveButton:
      '<a href="#" class="tui-page-btn tui-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</a>',
    disabledMoveButton:
      '<span class="tui-page-btn tui-is-disabled tui-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</span>',
    moreButton:
      '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
      '<span class="tui-ico-ellip">...</span>' +
      '</a>',
  },
};

const refs = {
  searchForm: document.querySelector('.search-form'),
  cards: document.querySelector('.gallery'),
  buttonLoadMore: document.querySelector('.load-more'),
};

//refs.buttonLoadMore.addEventListener('click', OnMore);
refs.searchForm.addEventListener('submit', onSearch);

async function onSearch(e) {
  //для SPINNER
  // var target = document.getElementById('search-form');
  // var spinner = new Spinner().spin();
  // target.appendChild(spinner.el);
  //-----------------------

  pageNumber = 1;
  e.preventDefault();
  name = e.currentTarget.elements.searchQuery.value;

  if (name.trim() === '') {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
    );
    return;
  }

  try {
    Notiflix.Loading.dots('Processing...');
    // Notiflix.Loading.pulse('Processing...');
    // Notiflix.Loading.hourglass('Loading...');
    const cards = await API.fetchPictures(name, pageNumber);
    Notiflix.Loading.remove();
    clearimagesContainer();

    const totalHits = cards.totalHits;
    //_____________________________________________________________________
    const container = document.getElementById('tui-pagination-container');
    const instance = new Pagination(container, optionsTui);
    // instance.reset();
    instance.setTotalItems(totalHits);
    instance.getCurrentPage(pageNumber);
    // instance.movePageTo(10);
    // instance.setItemsPerPage(5);

    instance.on('afterMove', event => {
      OnMore();
      const currentPage = event.page;
      console.log(currentPage);
    });

    //-----------------------------------------------------------------------

    if (totalHits > 0) {
      // refs.buttonLoadMore.classList.remove('is-hidden');
      renderCardsimages(cards);
      Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
      lightbox.refresh();
    } else {
      //refs.buttonLoadMore.classList.add('is-hidden');
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
      );
    }
  } catch (error) {
    console.log(error);
  }
}

function renderCardsimages(cards) {
  const markup = cardsTpl(cards);
  refs.cards.insertAdjacentHTML('beforeend', markup);
}

function clearimagesContainer() {
  refs.cards.innerHTML = '';
}

async function OnMore() {
  let count = 0;
  const cards = await API.fetchPictures(name, ++pageNumber);
  renderCardsimages(cards);
  lightbox.refresh();
  count = pageNumber * cards.hits.length;

  console.log('Общее кол-во', count);
  console.log('всего на странице', cards.totalHits);

  if (count === 0 || count >= cards.totalHits) {
    refs.buttonLoadMore.classList.add('is-hidden');
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
  }

  // плавная прокрутка страницы
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
//-=-----------------------------
