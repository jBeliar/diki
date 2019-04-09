const cheerio = require('cheerio')
const axios = require('axios')

const url = 'https://www.diki.pl/slownik-angielskiego?q='

const removeSpaces = query => {
  return query.replace(/\s+/g, ' ').trim()
}

const dikiContent = async response => {
  const $ = cheerio.load(response.data)
  const dictionaryEntries = $('.diki-results-left-column .dictionaryEntity')
  const maybyAudioUrl = $($('.dikiBackgroundBannerPlaceholder').children('script').get(1)).html().trim()
  let audioUrl = null
  if (maybyAudioUrl.startsWith('Sound.playAndThen(')) {
    audioUrl = 'http://www.diki.pl' + maybyAudioUrl.replace("Sound.playAndThen('", "").replace("');", "")
  }

  let words = []
  dictionaryEntries.each((i, dicitonaryEntry) => {
    const entrySection = cheerio(dicitonaryEntry)

    const word = { name: '' }

    let speech = { speechName: '', translations: [] }
    entrySection.children().each((j, elemm) => {
      const entry = cheerio(elemm)
      const entryType = entry.attr('class')
      switch (entryType) {
        case 'hws':
          const names = entrySection.find('.hws>h1>span.hw').toArray()
            .map(item => removeSpaces($(item).text().trim()))
          word.name = names[0]
          if (names.length > 1) {
            word.otherNames = names.slice(1)
          }
          words.push(word)
          break
        case 'partOfSpeechSectionHeader':
          const speechName = cheerio(entry).find('span').text().toUpperCase()
          speech = { speechName, translations: [] }
          if (!word.speeches) { word.speeches = [] }
          word.speeches.push(speech)
          break
        case 'vf':
          word.addition = removeSpaces(entry.text())
          break
        case 'foreignToNativeMeanings':
        case 'nativeToForeignEntrySlices':
        case 'hiddenNotForChildrenMeaning':
          entry.children('li').each(
            (k, translationNode) => {
              let translation = cheerio(translationNode)
                .children('span.hw')
                .toArray().map(d => cheerio(d).text())
              if (translation.length === 0) {
                translation = cheerio(translationNode).find('span.hiddenNotForChildrenMeaning')
                  .children('span.hw')
                  .toArray().map(d => cheerio(d).text())
              }
              translation = translation.map(tr => removeSpaces(tr))
              const trans = cheerio(translationNode)
                .find('.nativeToForeignMeanings>li>.hw')
                .toArray().map(d => cheerio(d).text())
              const sentences = $(translationNode).find('.exampleSentence')
                .map((l, sentence) => {
                  return {
                    value: removeSpaces($(sentence).clone().children().remove().end().text()),
                    url: $(sentence).find('.audioIcon').first().length > 0 ? ('https://www.diki.pl' + $(sentence).find('.audioIcon').first().attr('data-audio-url')) : null
                  }
                }).toArray()
              const translationObj = Object.assign({},
                { translation, sentences },
                trans.length > 0 ? { trans } : {}
              )
              if (!word.speeches) {
                if (!word.translations) { word.translations = [] }
                word.translations.push(translationObj)
              } else {
                speech.translations.push(translationObj)
              }
            }
          )
          break
      }
    })
  })
  return { words, audioUrl }
}

const getContent = async query => {
  const response = await axios.get(url + encodeURIComponent(query))
  return dikiContent(response)
}

exports.getContent = getContent
