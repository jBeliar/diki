const cheerio = require('cheerio')
const axios = require('axios')

const url = 'https://www.diki.pl/slownik-angielskiego?q='

const removeSpaces = query => {
  return query.replace(/\s+/g, ' ').trim()
}

const dikiContent = async response => {
  const $ = cheerio.load(response.data)
  const dictionaryEntries = $('.diki-results-left-column .dictionaryEntity')
  const audioUrl = 'http://www.diki.pl' + $($('.dikiBackgroundBannerPlaceholder>script').get(1)).html().trim().replace("Sound.playAndThen('", "").replace("');", "")

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
                .toArray().map(d => cheerio(d).text()).join(', ')
              if (translation.length === 0) {
                translation = cheerio(translationNode).find('span.hiddenNotForChildrenMeaning')
                  .children('span.hw')
                  .toArray().map(d => cheerio(d).text()).join(', ')
              }
              translation = removeSpaces(translation)
              const trans = cheerio(translationNode)
                .find('.nativeToForeignMeanings>li>.hw')
                .toArray().map(d => cheerio(d).text())
              const sentences = $(translationNode).find('.exampleSentence')
                .map((l, sentence) => {
                  return {
                    value: removeSpaces($(sentence).clone().children().remove().end().text()),
                    url: 'https://www.diki.pl' + $(sentence).find('.audioIcon').first().attr('data-audio-url')
                  }
                }).toArray()
              if (!word.speeches) {
                if (!word.translations) { word.translations = [] }
                word.translations.push({
                  translation,
                  ...(trans.length > 0 && { trans }),
                  sentences
                })
              } else {
                speech.translations.push({
                  translation,
                  ...(trans.length > 0 && { trans }),
                  sentences
                })
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
