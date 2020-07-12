const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const url = 'https://survivor.fandom.com/wiki/List_of_Survivor_contestants';
const site = 'https://survivor.fandom.com';

module.exports = () => {
  fs.truncate('./data/contestants.json', 0, () => {});
  rp(url)
    .then((html) => {
      const $ = cheerio.load(html);
      const startingPoints = $(
        "#mw-content-text table.wikitable tbody tr th[style='text-align: left;']"
      );

      const data = {};
      let run = false;
      startingPoints.each(function (i, ele) {
        if (!run) {
          // Italic tag indicates the contestant has passed away.
          const italicTagFound = $(ele).find('i').length;

          const nameStringData = JSON.stringify($(ele).find('a')[0].attribs);
          const nameJsonData = JSON.parse(nameStringData);

          const birthdayRef = $(this)[0].nextSibling;
          const birthdayStringData = JSON.stringify(birthdayRef.attribs);
          const birthdayJsonData = JSON.parse(birthdayStringData);

          const href = site + nameJsonData.href;
          const name = nameJsonData.title;
          const birthday = birthdayJsonData['data-sort-value'];
          const passedAway = italicTagFound ? 'true' : 'false';

          const contestant = { href, name, birthday, passedAway };
          const key = nameJsonData.href.split('/wiki/')[1];

          data[key] = contestant;
          // run = true;
        }

        // fs.appendFile(
        //   './data/contestants.txt',
        //   `${name} --- ${href}\n`,
        //   (err) => {
        //     if (err) console.log(err);
        //   }
        // );
      });

      const formattedData = JSON.stringify(data, null, 2);

      fs.writeFile('./data/contestants.json', formattedData, (err) => {
        if (err) console.log(err);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
