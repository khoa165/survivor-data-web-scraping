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
      let runOnce = false;
      startingPoints.each(function (i, ele) {
        if (!runOnce) {
          // Italic tag indicates the contestant has passed away.
          const italicTagFound = $(ele).find('i').length;

          // ---------------- Name ----------------
          const nameStringData = JSON.stringify($(ele).find('a')[0].attribs);
          const nameJsonData = JSON.parse(nameStringData);

          // ---------------- Birthday ----------------
          const birthdayRef = $(this)[0].nextSibling;
          const birthdayStringData = JSON.stringify(birthdayRef.attribs);
          const birthdayJsonData = JSON.parse(birthdayStringData);

          // ---------------- Filming age ----------------
          const filmingAgeRef = birthdayRef.nextSibling;

          // ---------------- Hometown ----------------
          const hometownRef = filmingAgeRef.nextSibling;

          // ---------------- Season number ----------------
          const seasonRef = hometownRef.nextSibling;
          const seasonNumberStringData = JSON.stringify(seasonRef.attribs);
          const seasonNumberJsonData = JSON.parse(seasonNumberStringData);

          // ---------------- Season name ----------------
          const seasonNameStringData = JSON.stringify(
            $(seasonRef).find('a')[0].attribs
          );
          const seasonNameJsonData = JSON.parse(seasonNameStringData);

          // ---------------- Finish placement ----------------
          const finishPlacementRef = seasonRef.nextSibling;

          // ---------------- Days lasted ----------------
          const daysLastedRef = finishPlacementRef.nextSibling;

          // ---------------- Votes against ----------------
          const votesAgainstRef = daysLastedRef.nextSibling;

          // ---------------- Tribal wins ----------------
          const tribalWinsRef = votesAgainstRef.nextSibling;

          // ---------------- Individual wins ----------------
          const individualWinsRef = tribalWinsRef.nextSibling;

          const href = site + nameJsonData.href;
          const name = nameJsonData.title;
          const birthday = birthdayJsonData['data-sort-value'];
          const passedAway = italicTagFound ? 'true' : 'false';
          const filmingAge = parseInt(filmingAgeRef.firstChild.data.trim());
          const hometown = hometownRef.firstChild.data.trim();
          const seasonNumber = parseInt(
            seasonNumberJsonData['data-sort-value'],
            10
          );
          const seasonHref = site + seasonNameJsonData.href;
          const seasonName = seasonNameJsonData.title;
          const finishPlacement = finishPlacementRef.firstChild.data.trim();
          const daysLasted = parseInt(daysLastedRef.firstChild.data.trim());
          const votesAgainst = votesAgainstRef.firstChild.data.trim();
          const tribalWins = tribalWinsRef.firstChild.data.trim();
          const individualWins = individualWinsRef.firstChild.data.trim();

          const contestant = {
            href,
            name,
            birthday,
            passedAway,
            filmingAge,
            hometown,
            seasonNumber,
            seasonHref,
            seasonName,
            finishPlacement,
            daysLasted,
            votesAgainst,
            tribalWins,
            individualWins,
          };
          const key = nameJsonData.href.split('/wiki/')[1];

          data[key] = contestant;
          // runOnce = true;
        }
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
