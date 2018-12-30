# Diki

Simple tool for searching in [Diki](https://www.diki.pl/) dictionary (eng<-->pol) using web scraping (cheerio) and returning as JSON format.

## Instalation
```
npm install diki
```

## Usage

Example:
```javascript
const { getContent } = require('diki')

getContent('last')
  .then(console.log)
```

Result:  

```javascript
{
  "words": [
    {
      "name": "great gt.",
      "speeches": [
        {
          "speechName": "PRZYMIOTNIK",
          "translations": [
            {
              "translation": "wielki, ogromny (na dużą skalę, w dużym zakresie)"
            },
            {
              "translation": "świetny, wspaniały, wielki"
            },
            {
              "translation": "ważny, doniosły"
            },
            {
              "translation": "wielki (używany w tytułowaniu osób)"
            },
            {
              "translation": "hojny, wielki (np. gest)"
            },
            {
              "translation": "doskonały (mający najwyższe umiejętności)"
            },
            {
              "translation": "wielki, potężny (bardzo duży)"
            },
            {
              "translation": "wielki (robiący dużo czegoś)"
            },
            {
              "translation": "wielki (o nadzwyczaj dużych przedstawicielach gatunków zwierząt, roślin)"
            }
          ]
        },
        {
          "speechName": "RZECZOWNIK",
          "translations": [
            {
              "translation": "wielki (znana osoba)"
            }
          ]
        },
        {
          "speechName": "WYKRZYKNIK",
          "translations": [
            {
              "translation": "no świetnie (używane w sytuacji zawodu czymś)"
            }
          ]
        },
        {
          "speechName": "PRZYSŁÓWEK",
          "translations": [
            {
              "translation": "świetnie, wspaniale"
            }
          ]
        }
      ]
    },
    {
      "name": "Great!",
      "speeches": [
        {
          "speechName": "WYKRZYKNIK",
          "translations": [
            {
              "translation": "Świetnie!"
            }
          ]
        }
      ]
    },
    {
      "name": "great-",
      "speeches": [
        {
          "speechName": "PREFIKS",
          "translations": [
            {
              "translation": "pra-"
            }
          ]
        }
      ]
    }
  ],
  "audioUrl": "http://www.diki.pl/images-common/en/mp3/great.mp3"
}

```