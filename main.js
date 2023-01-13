const searchButton = document.querySelector('.search-button')
const input = document.querySelector('input')
const backButton = document.querySelectorAll('.back-button')
const searchPage = document.querySelector('.search-page')
const wordInfo = document.querySelector('.word-info')
const partsOfSpeech = document.querySelector('.parts-of-speech')
const definitions = document.querySelector('.definitions')
const totalDefinitions = document.querySelector('.total')
const title = document.querySelector('.title')
const phoneticsCtn = document.querySelector('.phonetics')
const list = document.querySelectorAll('.list')
const totalListItems = document.querySelectorAll('.list-items')
const thesaurus = document.querySelectorAll('.thesaurus > div')
const soundIcon = document.querySelector('.sound-icon')
const etymologyCtn = document.querySelector('.etymology')
const etymology = document.querySelector('.etymology > p')
const recentSearchList = document.querySelector('.recent-search__list')
const noRecentSearch = document.querySelector('.no-recent')
const historyListIcon = document.querySelector('.history')
const bookmarkListIcon = document.querySelector('.bookmark')
const historyCtn = document.querySelector('.history-list')
const bookmarkCtn = document.querySelector('.bookmark-list')
const settings = document.querySelector('.settings-page')
const settingsIcon = document.querySelector('.settings')
const historyList = document.querySelectorAll('.list__hb')[0]
const bookmarkList = document.querySelectorAll('.list__hb')[1]
const clearIcon = document.querySelectorAll('.clear')
const bookmarkIcon = document.querySelector('.add-bookmark')
const delBookmarkIcon = document.querySelectorAll('.list__hb .delete')
const toggleDarkMode = document.querySelector('.toggle')
const loader = document.querySelector('.loader')
const wordNotFound = document.querySelector('.not-found__ctn')
let recent = []
let bookmark = JSON.parse(localStorage.getItem('bookmark')) || []
let history = JSON.parse(localStorage.getItem('history')) || []
let currentWord = ''
let isDarkMode = false

toggleDarkMode.addEventListener('click', () => {
  if(!isDarkMode) {
    toggleDarkMode.style.marginLeft = '28px'
    toggleDarkMode.parentElement.style.backgroundColor = '#05abe3'
    isDarkMode = !isDarkMode
    enableDarkMode()
  } else {
    toggleDarkMode.style.marginLeft = 0
    toggleDarkMode.parentElement.style.backgroundColor = '#6e6e6e'
    isDarkMode = !isDarkMode
    disableDarkMode()
  }
})

settingsIcon.addEventListener('click', () => {
  settings.style.display = 'block'
  bookmarkCtn.style.display = 'none'
  historyCtn.style.display = 'none'
  searchPage.style.display = 'none'
})

bookmarkListIcon.addEventListener('click', () => {
  loadBookmark()
  bookmarkCtn.style.display = 'block'
  historyCtn.style.display = 'none'
  settings.style.display = 'none'
  searchPage.style.display = 'none'
})

bookmarkIcon.addEventListener('click', (e) => {
  if(!bookmark.includes(currentWord)) {
    bookmarkWord()
  } else {
    unBookmarkWord()
  }
})

clearIcon[0].addEventListener('click', () => {
  localStorage.removeItem('history')
  historyList.innerHTML = ''
  history = []
})

clearIcon[1].addEventListener('click', () => {
  localStorage.removeItem('bookmark')
  bookmarkList.innerHTML = ''
  bookmark = []
})

historyListIcon.addEventListener('click', () => {
  loadHistory()
  historyCtn.style.display = 'block'
  bookmarkCtn.style.display = 'none'
  settings.style.display = 'none'
  searchPage.style.display = 'none'
})

searchButton.addEventListener('click', (e) => {
  const word = input.value.trim().toLowerCase()
  searchWord(word)
})

backButton.forEach(button => {
  button.addEventListener('click', (e) => {
    recentSearchList.innerHTML = ''
    partsOfSpeech.innerHTML = ''
    definitions.innerHTML = ''
    totalListItems[0].innerHTML = ''
    totalListItems[1].innerHTML = ''
    list[0].innerHTML = ''
    list[1].innerHTML = ''
    etymology.innerHTML = ''
    historyList.innerHTML = ''
    bookmarkList.innerHTML = ''
    etymologyCtn.style.display = 'none'
    wordInfo.style.display = 'none'
    historyCtn.style.display = 'none'
    bookmarkCtn.style.display = 'none'
    settings.style.display = 'none'
    wordNotFound.style.display = 'none'
    searchPage.style.display = 'block'
    loadRecent()
  })
})

function disableDarkMode() {
  document.body.style.backgroundColor = '#fff'
  document.querySelector('.app').style.backgroundColor = '#fff'
  searchPage.firstElementChild.style.color = '#000'
  searchPage.children[2].firstElementChild.style.color = '#000'
  historyCtn.children[1].style.color = '#000'
  bookmarkCtn.children[1].style.color = '#000'
  wordInfo.children[1].firstElementChild.style.color = '#000'
  wordInfo.children[3].firstElementChild.style.color = '#000'
  wordInfo.children[3].lastElementChild.style.color = '#000'
  wordInfo.children[4].firstElementChild.firstElementChild.style.color = '#000'
  wordInfo.children[4].firstElementChild.nextElementSibling.firstElementChild.style.color = '#000'
  wordInfo.children[5].firstElementChild.style.color = '#000'
  wordInfo.children[5].firstElementChild.nextElementSibling.style.color = '#000'
  settings.children[1].style.color = '#000'
}


function enableDarkMode() {
  document.body.style.backgroundColor = '#000'
  document.querySelector('.app').style.backgroundColor = '#000'
  searchPage.firstElementChild.style.color = '#fff'
  searchPage.children[2].firstElementChild.style.color = '#fff'
  historyCtn.children[1].style.color = '#fff'
  bookmarkCtn.children[1].style.color = '#fff'
  wordInfo.children[1].firstElementChild.style.color = '#fff'
  wordInfo.children[3].firstElementChild.style.color = '#fff'
  wordInfo.children[3].lastElementChild.style.color = '#fff'
  wordInfo.children[4].firstElementChild.firstElementChild.style.color = '#fff'
  wordInfo.children[4].firstElementChild.nextElementSibling.firstElementChild.style.color = '#fff'
  wordInfo.children[5].firstElementChild.style.color = '#fff'
  wordInfo.children[5].firstElementChild.nextElementSibling.style.color = '#fff'
  settings.children[1].style.color = '#fff'
}

function searchWord(word) {
  currentWord = word
  checkBookmark(word)
  if(word) {
    searchPage.style.display = 'none'
    loader.style.display = 'grid'
    fetchWordData(word)
    if(!recent.includes(word)) {
      if(recent.length === 5) {
        recent.shift()
      }
      recent.push(word)
    }
    if(!history.includes(word)) {
      history.push(word)
      localStorage.setItem('history', JSON.stringify(history))
    }
  }
}

function fetchWordData(word) {
  fetch(`
    https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${word}`).then(res => {
      return res.json()
    }).then(res => {
       loadEtymology(res.remaining.sections)
    })
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`).then(res => {
    return res.json()
  }).then(res => {
    loader.style.display = 'none'
    if(!res[0]) {
      wordNotFound.style.display = 'block'
      wordInfo.style.display = 'none'
    } else {
      loadPartsOfSpeech(res[0].meanings)
      loadDefinitions(res[0].meanings)
      loadWord(res[0].word, res[0].phonetics)
      wordInfo.style.display = 'block'
    }
  })
}

function loadPartsOfSpeech(meanings) {
  meanings.forEach((meaning, i) => {
    const div = document.createElement('div')
    const innerText = document.createTextNode(meaning.partOfSpeech)
    div.appendChild(innerText)
    div.classList.add('part-of-speech')
    partsOfSpeech.append(div)
    if(i === 0) div.classList.add('active')
  })
  displayPartOfSpeech(meanings)
}

function loadDefinitions(meanings, index = 0) {
  const allDefinitions = meanings[index].definitions
  allDefinitions.forEach((definition, i) => {
    const div = document.createElement('div')
    const span = document.createElement('span')
    const p1 = document.createElement('p')
    const p2 = document.createElement('p')
    spanInnerText = document.createTextNode(`${i + 1}.`)
    p1InnerText = document.createTextNode(definition.definition)
    p2InnerText = document.createTextNode(definition.example)
    span.appendChild(spanInnerText)
    p1.appendChild(p1InnerText)
    if(definition.example) {
      p2.appendChild(p2InnerText)
    }
    div.classList.add('word-definition')
    span.classList.add('index')
    p1.classList.add('meaning')
    p2.classList.add('example')
    div.append(span)
    div.append(p1)
    div.append(p2)
    definitions.append(div)
    totalDefinitions.textContent = allDefinitions.length
  })
  thesaurus[0].style.display = 'none'
  thesaurus[1].style.display = 'none'
  loadThesaurus(meanings[index].antonyms, meanings[index].synonyms)
}

function loadWord(word, phonetics) {
  let text = ''
  title.textContent = word
  phonetics.forEach(phonetic => {
    text += phonetic.text ? `${phonetic.text} ` : ''
    phoneticsCtn.textContent = text
  })
  loadAudio(phonetics)
}

function loadThesaurus(antonyms, synonyms) {
  if(antonyms.length) {
    antonyms.forEach(antonym => {
      const li = document.createElement('li')
      const liInnerText = document.createTextNode(antonym)
      li.appendChild(liInnerText)
      list[0].append(li)
    })
    totalListItems[0].textContent = antonyms.length
    thesaurus[0].style.display = 'block'
  }
  
  if(synonyms.length) {
    synonyms.forEach(synonym => {
      const li = document.createElement('li')
      const liInnerText = document.createTextNode(synonym)
      li.appendChild(liInnerText)
      list[1].appendChild(li)
    })
    totalListItems[1].textContent = synonyms.length
    thesaurus[1].style.display = 'block'
  }
}

function displayPartOfSpeech(meanings) {
  const pos = [...partsOfSpeech.children]
  pos.forEach(div => {
    div.addEventListener('click', (e) => {
      definitions.innerHTML = ''
      list[0].innerHTML = ''
      list[1].innerHTML = ''
      pos.forEach(div => {
        div.classList.remove('active')
      })
      e.target.classList.add('active')
      loadDefinitions(meanings, pos.indexOf(e.target))
    })
  })
}

function loadAudio(phonetics) {
  let audioUrl = ''
  if(phonetics.length) {
    phonetics.forEach(phonetic => {
      if(phonetic.audio) {
        audioUrl = phonetic.audio
      }
    })
    soundIcon.addEventListener('click', () => {
      const audio = new Audio(audioUrl)
      audio.play()
    })
  }
}

function loadEtymology(sections) {
  sections.forEach(section => {
    if(section.line === 'History' || section.line === 'Etymology' || section.line === 'Etymology and Terminolgy') {
      etymologyCtn.style.display = 'block'
      etymology.innerHTML = section.text
    }
  })
}

function loadRecent() {
  if(recent.length) {
    noRecentSearch.style.display = 'none'
  }
  recent.forEach((word, i) => {
    if(i < 5) {
      const li = document.createElement('li')
      const innerText = document.createTextNode(word)
      li.appendChild(innerText)
      recentSearchList.append(li)
    }
  })
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem('history')) || []
  history.forEach(word => {
    const li = document.createElement('li')
    const innerText = document.createTextNode(word)
    li.classList.add('list__hb--item')
    li.appendChild(innerText)
    li.addEventListener('click', () => {
      historyCtn.style.display = 'none'
      searchWord(word)
    })
    if(isDarkMode) {
      li.classList.add('list__hb--dark-mode')
    }
    historyList.append(li)
  })
}

function checkBookmark(word) {
  if(bookmark.includes(word)) {
    document.querySelector('.add-bookmark > span').innerHTML = '<i class="fa-solid fa-bookmark"></i>'
  } else {
    document.querySelector('.add-bookmark > span').innerHTML = '<i class="fa-regular fa-bookmark"></i>'
  }
}

function bookmarkWord() {
  bookmark.push(currentWord)
  localStorage.setItem('bookmark', JSON.stringify(bookmark))
  document.querySelector('.add-bookmark > span').innerHTML = '<i class="fa-solid fa-bookmark"></i>'
}

function unBookmarkWord() {
  const index = bookmark.indexOf(currentWord)
  bookmark.splice(index, 1)
  localStorage.setItem('bookmark', JSON.stringify(bookmark))
  document.querySelector('.add-bookmark > span').innerHTML = '<i class="fa-regular fa-bookmark"></i>'
}

function loadBookmark() {
  const bookmark = JSON.parse(localStorage.getItem('bookmark')) || []
  bookmark.forEach(word => {
    const li = document.createElement('li')
    const span1 = document.createElement('span')
    const span2 = document.createElement('span')
    const innerText = document.createTextNode(word)
    span2.className = 'delete'
    span2.innerHTML = '<i class="fa-solid fa-xmark"></i>'
    span2.addEventListener('click', (e) => {
      const word = span2.previousElementSibling.textContent
      delBookmarkedWord(word)
      console.log(word)
    })
    span1.addEventListener('click', (e) => {
      bookmarkCtn.style.display = 'none'
      searchWord(word)
    })
    span1.appendChild(innerText)
    li.className = 'list__hb--item'
    li.append(span1)
    li.append(span2)
    if(isDarkMode) {
      li.classList.add('list__hb--dark-mode')
      span2.classList.add('delete--dark-mode')
    }
    bookmarkList.append(li)
  })
}

function delBookmarkedWord(bm_word) {
  bookmark.forEach(word => {
    if(word === bm_word) {
      const index = bookmark.indexOf(word)
      bookmark.splice(index, 1)
      localStorage.setItem('bookmark', JSON.stringify(bookmark))
      bookmarkList.removeChild(bookmarkList.children[index])
    }
  })
}