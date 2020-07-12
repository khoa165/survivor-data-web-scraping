const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const url = 'https://survivor.fandom.com/wiki/List_of_Survivor_contestants';
const site = 'https://survivor.fandom.com';

const parseContestants = ($, startingPoints, data) => {
  let runOnce = false; // Debug purpose.
  startingPoints.each(function (i, ele) {
    if (!runOnce) {
      // Italic tag indicates the contestant has passed away.
      const italicTagFound = $(ele).find('i').length;

      // ---------------- Avatar ----------------
      const avatarRef = $($(this)[0].previousSibling).find('a')[0];
      const avatarStringData = JSON.stringify(avatarRef.attribs);
      const avatarJsonData = JSON.parse(avatarStringData);

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

      // ---------------- Total wins ----------------
      const totalWinsRef = individualWinsRef.nextSibling;

      const avatar = avatarJsonData.href;
      const survivorWikiHref = site + nameJsonData.href;
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
      const totalWins = parseInt(totalWinsRef.firstChild.data.trim());

      // Basic info. Stay the same for every season.
      const contestant = {
        avatar,
        survivorWikiHref,
        name,
        birthday,
        passedAway,
      };

      // Contestant stat for current season.
      const contestantPerSeasonInfo = {
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
        totalWins,
      };

      // Contestant name separated by underscore.
      const key = nameJsonData.href.split('/wiki/')[1].replace(/\./g, '');

      // If contestant already exists, add info of current season.
      // Else, add this season as first season.
      // For both case, increment number seasons.
      if (data.hasOwnProperty(key)) {
        const previousNumberSeasons = data[key]['numberSeasons'];
        const currentSeasonIndex = previousNumberSeasons;
        const seasonsStat = data[key]['seasonsStat'];
        seasonsStat[currentSeasonIndex] = contestantPerSeasonInfo;
        data[key]['numberSeasons'] = previousNumberSeasons + 1;
      } else {
        data[key] = contestant;
        data[key]['seasonsStat'] = {};
        data[key]['seasonsStat'][0] = contestantPerSeasonInfo;
        data[key]['numberSeasons'] = 1;
      }

      // runOnce = true;
    }
  });
};

module.exports = () => {
  fs.truncate('./data/contestants.json', 0, () => {});
  rp(url)
    .then((html) => {
      const $ = cheerio.load(html);
      const firstAppearance = $(
        "#mw-content-text table.wikitable tbody tr th[style='text-align: left;']"
      );
      const secondAppearance = $(
        "#mw-content-text table.wikitable tbody tr th[style='text-align: left; background-color:#ace1af;']"
      );
      const thirdAppearance = $(
        "#mw-content-text table.wikitable tbody tr th[style='text-align: left; background-color:#ffe6bd;']"
      );
      const fourthAppearance = $(
        "#mw-content-text table.wikitable tbody tr th[style='text-align: left; background-color:#c8c8dc;']"
      );
      const fifthAppearance = $(
        "#mw-content-text table.wikitable tbody tr th[style='text-align: left; background-color:#f59d8c;']"
      );

      const data = {};

      parseContestants($, firstAppearance, data);
      parseContestants($, secondAppearance, data);
      parseContestants($, thirdAppearance, data);
      parseContestants($, fourthAppearance, data);
      parseContestants($, fifthAppearance, data);

      const formattedData = JSON.stringify(data, null, 2);

      fs.writeFile('./data/contestants.json', formattedData, (err) => {
        if (err) console.log(err);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
