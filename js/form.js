import {isEscapeKey} from './utils.js';
import {sendData} from './api.js';
import {showSuccessMessage, showErrorMessage} from './message.js';

const MAX_SYMBOLS_COMMENT_LENGTH = 140;
const MAX_HASHTAGS_COUNT = 5;
const ERROR_TEXT = {
  INVALID_LENGTH:`Длина комментария не должна превышать ${MAX_SYMBOLS_COMMENT_LENGTH} символов`,
  INVALID_COUNT: `Допустимо не более ${MAX_HASHTAGS_COUNT} хэш-тегов`,
  NOT_INIQUE: 'Хэш-теги должны быть уникальными',
  INVALID_PATTERN: 'Некорректный хэш-тег',
};

const body = document.body;
const form = document.querySelector('.img-upload__form');
const pictureUploadInput = form.querySelector('.img-upload__input');
const closeButton = form.querySelector('.img-upload__cancel');
const pictureOverlay = form.querySelector('.img-upload__overlay');
const commentField = form.querySelector('.text__description');
const hashtagsField = form.querySelector('.text__hashtags');
const picturePreview = document.querySelector('.img-upload__preview img');
const submitButton = form.querySelector('.img-upload__submit');

const hashtagRegExp = /^#[a-zа-яё0-9]{1,19}$/i;

const pristine = new Pristine(form, {
  classTo: 'img-upload__field-wrapper',
  errorClass: 'img-upload--invalid',
  successClass: 'img-upload--valid',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextTag: 'div',
  errorTextClass: 'img-upload__error'
});

const closeForm =() => {
  body.classList.remove('modal-open');
  pictureOverlay.classList.add('hidden');
  closeButton.removeEventListener('click', closeForm);
  document.removeEventListener('keydown', closeFormByEscape);
  pictureUploadInput.value = '';
  pristine.reset();
};

function closeFormByEscape(evt) { //всплытие
  if(isEscapeKey(evt)) {
    const activeElement = document.activeElement.attributes.type;
    if (typeof(activeElement) !== 'undefined' && activeElement.value === 'text'){
      evt.stopPropagation();
    }
    else {
      closeForm();
    }
  }
}

pictureUploadInput.addEventListener('change', () => {
  pictureOverlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
  document.querySelector('.effect-level__slider').parentNode.classList.add('hidden');
  document.querySelector('.scale__control--value').value = '100%';
  picturePreview.removeAttribute('style');
  closeButton.addEventListener('click', closeForm);
  document.addEventListener('keydown', closeFormByEscape);
});

const validateComment = (value) => value.length <= MAX_SYMBOLS_COMMENT_LENGTH;

const validateHashtagsCount = (value) => value.trim().split(' ').length <= MAX_HASHTAGS_COUNT;

const validateHashtags = (value) => value.trim() === '' ? true : value.trim().split(' ').every((hashtag) => hashtagRegExp.test(hashtag));

const validateHashtagsUniqueness  = (value) => {
  const hashtags = value.trim().split(' ');
  const tempArr = [];
  for (let i = 0; i < hashtags.length; i++){
    if(tempArr.includes(hashtags[i])){
      return false;
    }
    else {
      tempArr.push(hashtags[i]);
    }
  }
  return true;
};

pristine.addValidator(commentField, validateComment, ERROR_TEXT.INVALID_LENGTH);
pristine.addValidator(hashtagsField, validateHashtagsCount, ERROR_TEXT.INVALID_COUNT);
pristine.addValidator(hashtagsField, validateHashtags, ERROR_TEXT.INVALID_PATTERN);
pristine.addValidator(hashtagsField, validateHashtagsUniqueness, ERROR_TEXT.NOT_INIQUE);

form.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  if (pristine.validate()) {
    submitButton.disabled = true;
    await sendData(new FormData(form))
      .then(() => {
        showSuccessMessage();
        commentField.value = '';
        hashtagsField.value = '';
      })
      .catch(() => showErrorMessage());
    submitButton.disabled = false;
    closeForm();
  }
});
