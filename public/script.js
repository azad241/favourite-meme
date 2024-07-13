let apiKey = localStorage.getItem('API_KEY') || '';
let timeout;
let jsondata;

let images = localStorage.getItem('images');
images = images ? JSON.parse(images) : {};

let lovedimages = localStorage.getItem('lovedimages');
lovedimages = lovedimages ? JSON.parse(lovedimages) : [];


async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      alert('Check the Api Key');
      throw new Error('Error fetching data: ' + response.statusText);
    }
    const data = await response.json();
    jsondata = data.memes;
    return jsondata;
  } catch (error) {
    console.error('Error getting data: ' + error);
  }
}


//check demo mode and theme name
function checkDemoAndTheme() {
  let currentURL = new URL(window.location);
  let searchParams = currentURL.searchParams;

  if (!searchParams.has('demo')) {
    const mode = localStorage.getItem('demo') || 'true';
    searchParams.set('demo', mode);
    localStorage.setItem('demo', mode);
  }
  let theme = localStorage.getItem('theme') || 'light';
  if (!searchParams.has('theme')) {

    searchParams.set('theme', theme);
  }
  {
    localStorage.setItem('theme', theme);
    //other things handled on main.js
  }
  window.history.replaceState(null, '', currentURL);
}

//if user choose theme
function initializeThemeSelector() {
  const themeRadios = document.querySelectorAll('input[name="theme-dropdown"]');
  themeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        const selectedTheme = e.target.value;
        localStorage.setItem('theme', selectedTheme);
        let currentURL = new URL(window.location);
        currentURL.searchParams.set('theme', selectedTheme);
        window.history.replaceState(null, '', currentURL);
      }
    });
  });
}

// demo true or false
function isDemo() {
  return new URL(window.location).searchParams.get('demo') !== 'false';
}

//update feed
function updateMemeItems(memes) {
  const memeDiv = document.getElementById('meme-items');
  let memehtml = '';
  memes.forEach(element => {
    let icon = 'regular';
    if (lovedimages.includes(element.url)) icon = 'solid';
    memehtml += `<div class="img relative bg-base-200 m-4 rounded-lg">
      <div class="top-5 right-5 absolute z-10 "><button onclick="assignFavMeme(${element.id})" class="fa-${icon} fa-heart fa-2xl text-red-700"></button></div>
      <img class="h-96 w-[320px] p-2 hover:scale-105 transition-transform z-0 " src="${element.url}" alt="">
    </div>`;
  });
  memeDiv.innerHTML = memehtml;
}

//realtime search function
function searchRealtime(query) {
  timeout = setTimeout(() => {
    let apiurl = `https://api.humorapi.com/memes/search?api-key=${apiKey}&number=18&keywords=${query}`;
    fetchData(apiurl).then(reponse => {
      if (reponse) {
        if (reponse.meme) jsondata = reponse.meme
        else jsondata = reponse;
        let currentURL = new URL(window.location);
        currentURL.searchParams.set('demo', 'false');
        window.history.replaceState(null, '', currentURL);
        updateMemeItems(jsondata);
      }
    });
  }, 500);
}


//handle api modal
function apiModal(query) {
  document.getElementById('saveApiKey').addEventListener('click', function () {
    const key = document.getElementById('apiKeyInput').value;
    if (key) {
      apiKey = key;
      localStorage.setItem('API_KEY', key);
      document.getElementById('apiKeyModal').removeAttribute("open");
      let currentURL = new URL(window.location);
      currentURL.searchParams.set('demo', 'false');
      window.history.replaceState(null, '', currentURL);
      document.getElementById('meme-items').innerHTML = '<p class="text-center">Start Typing</p>';
    }
  });
  if (apiKey !== '') {
    searchRealtime(apiKey, query);
  }
}


//when put data on input
document.getElementById('realtimeSearch').addEventListener('input', function (event) {
  clearTimeout(timeout);
  const query = event.target.value;
  document.getElementById('meme-items').innerHTML = '<span class="loading loading-dots loading-lg"></span>';
  if (query.length > 2) {
    if (!apiKey) {
      document.getElementById('apiKeyModal').setAttribute("open", ""); //classList.add('modal-open');
      apiModal(query);
    } else {
      searchRealtime(query);
    }
  }
});

//to make string title
function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

//show labels in left sidebar
function loadFavoriteItems() {
  let fItemsContainer = document.querySelectorAll('.f-items');
  let html = '';
  if (Object.keys(images).length === 0) {
    html = `
      <div class="item flex justify-start items-center m-2 border-base-00 border-2 rounded-lg">
        <div class="skeleton h-16 w-20 rounded-none"></div>
        <p class="pl-2 font-semibold flex flex-wrap">No items</p>
      </div>`;
  } else {
    for (let label in images) {
      if (images[label].length > 0) {
        html += `
          <a href='?fav_label=${label.toLowerCase()}' class="item flex justify-start items-center m-2 no-underline border-sky-600 hover:underline border-2 rounded-lg">
            <img class="rounded-l-lg h-16 w-20" src="${images[label][0]}" alt="${label}">
            <p class="pl-2 font-semibold flex flex-wrap">${toTitleCase(label)}</p>
          </a>`;
      } else {
        html += `
          <div class="item flex justify-start items-center m-2 border-base-00 border-2 rounded-lg">
            <div class="skeleton h-16 w-20 rounded-none"></div>
            <p class="pl-2 font-semibold flex flex-wrap">${toTitleCase(label)}</p>
          </div>`;
      }
    }
  }
  fItemsContainer.forEach(container => {
    container.innerHTML = html;
  });
}
//show label in 'select label  modal'
function updateLabelList() {
  let labellistContainers = document.querySelectorAll('#labellist');
  let html = '<option disabled selected>Select a label from the list below</option>'
  for (let label in images) {
    html += `<option value="${label}">${label}</option>`
  }
  labellistContainers.forEach(container => {
    container.innerHTML = html;
  });
}


//when click on new label (save) button
document.getElementById('savenewlabel').addEventListener('click', function (event) {
  const inputElement = document.getElementById('addLabel');
  const name = inputElement.value.trim();
  if (name && name !== '') {
    if (addLabel(toTitleCase(name)) === 1) {
      inputElement.value = '';
      document.getElementById('addNewLabelModal').close();
    }
  }
});

//when click on remove button

document.getElementById('removelabelbutton').addEventListener('click', function (event) {
  const labelSelect = document.getElementsByClassName('removelabelclass')[0];
  const selectedValue = labelSelect.value;
  function removeSelectedLabel(selectedItem) {
    if (selectedItem in images) {
      lovedimages = lovedimages.filter(item => !images[selectedItem].includes(item));
      delete images[selectedItem];
      labels = localStorage.getItem('labels');
      labels = labels ? JSON.parse(labels) : [];
      labels = labels.filter(item => item != selectedItem);
      localStorage.setItem('lovedimages', JSON.stringify(lovedimages));
      localStorage.setItem('labels', JSON.stringify(labels));
      localStorage.setItem('images', JSON.stringify(images));
    }
  }
  if (selectedValue && selectedValue !== labelSelect.options[0].value){
    removeSelectedLabel(selectedValue);
  }
    document.getElementById('removelabelModal').removeAttribute("open");
    window.location.href = '/';
});

//check api key
function CheckAPI() {
  if (apiKey === '' && isDemo() === false) {
    document.getElementById('meme-items').innerHTML = `<div class="p-2 mt-5">
      <p class="text-center">You need to set an API Key from HumorAPI to get the meme feed!</p>
      <div class="flex justify-center"><button onclick="document.getElementById('apiKeyModal').setAttribute('open', '')" class="btn btn-primary font-semibold p-4 m-2">Set API KEY</button></div>
    </div>`;
    apiModal();
    return false;
  }
  else return true;
}

//add new level
function addLabel(name) {
  let labels = localStorage.getItem('labels');
  labels = labels ? JSON.parse(labels) : [];
  if (!(labels.includes(name))) labels.push(name);
  else {
    alert('Duplicate Labels...');
    return 0;
  }
  localStorage.setItem('labels', JSON.stringify(labels));
  if (!images[name]) {
    images[name] = [];
  }
  localStorage.setItem('images', JSON.stringify(images));
  loadFavoriteItems();
  updateLabelList();
  return 1;
}


//add images in label
function addImage(name, url) {
  if (url == null) {
    alert('invalid image url');
    return;
  }
  // if (images[name].includes(url)) {
  //   alert('Duplicate image.');
  //   return;
  // }
  images[name].push(url);
  localStorage.setItem('images', JSON.stringify(images));
  //updates lovedimages
  lovedimages = [];
  for (let key in images) {
    if (images.hasOwnProperty(key)) {
      lovedimages = lovedimages.concat(images[key]);
    }
  }
  localStorage.setItem('lovedimages', JSON.stringify(lovedimages));
}

//get selected label

function getSelectedLabel() {
  return new Promise((resolve) => {
    document.getElementById('labelsModal').setAttribute("open", "");
    const saveButton = document.getElementById('saveMeme');
    const labelSelect = document.getElementById('labellist');
    function handleSave() {
      const selectedValue = labelSelect.value;
      if (selectedValue && selectedValue !== labelSelect.options[0].value) {
        resolve(selectedValue);
      } else {
        resolve(null);
      }
      document.getElementById('labelsModal').removeAttribute("open");
      saveButton.removeEventListener('click', handleSave);
    }
    saveButton.addEventListener('click', handleSave);
  });
}


//get image url from jsondata to set favourite items
function getImageURL(id) {
  let url;
  let items = jsondata.filter(checkid);
  function checkid(item) {
    return item.id === id;
  }
  items.forEach(element => {
    url = element.url;
  });
  return url;
}
//assign image meme in label when clicked on love 
async function assignFavMeme(id) {
  let url;
  let button = event.target;

  if (id === 0) {
    let img = button.closest('.img').querySelector('img');
    url = img.src;
  }
  else url = getImageURL(id);

  if (lovedimages.includes(url)) {
    lovedimages = lovedimages.filter(item => item !== url);
    for (let label in images) {
      images[label] = images[label].filter(item => item !== url);
    }
    localStorage.setItem('images', JSON.stringify(images));
    localStorage.setItem('lovedimages', JSON.stringify(lovedimages));
    button.classList.replace('fa-solid', 'fa-regular');
  } else {
    let selectedLabel = await getSelectedLabel();
    if (selectedLabel) {
      button.classList.replace('fa-regular', 'fa-solid');
      addImage(selectedLabel, url);
    }
  }
  loadFavoriteItems();
}

function favLink() {
  let currentURL = new URL(window.location);
  let searchParams = currentURL.searchParams;
  if (!searchParams.has('fav_label')) {
    return 0;
  }
  const favlabel = toTitleCase(searchParams.get('fav_label'));

  function getImagesForLabel(label) {
    if (images.hasOwnProperty(label)) {
      return images[label].map(url => ({
        id: 0,
        url: url
      }));
    }
    return [];
  }
  updateMemeItems(getImagesForLabel(favlabel));

  return 1;

}

//main function
async function main() {

  loadFavoriteItems();
  updateLabelList();
  initializeThemeSelector();
  if (favLink()) return;

  checkDemoAndTheme();
  if (!isDemo()) {
    if (CheckAPI()) {
      let reponse = await fetchData(`https://api.humorapi.com/memes/search?api-key=${apiKey}&number=9`);
      if (reponse) {
        jsondata = reponse.memes;
        updateMemeItems(jsondata);
      }
    }
  } else {
    let reponse = await fetchData('/mock.json');
    if (reponse) {
      jsondata = reponse;
      updateMemeItems(jsondata);
    }
  }


}


main();
