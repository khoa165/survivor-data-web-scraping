const fs = require('fs');

const winners_name = [
  'Richard_Hatch',
  'Tina_Wesson',
  'Ethan_Zohn',
  'Vecepia_Towery',
  'Brian_Heidik',
  'Jenna_Morasca',
  'Sandra_Diaz-Twine',
  'Amber_Mariano',
  'Chris_Daugherty',
  'Tom_Westman',
  'Danni_Boatwright',
  'Aras_Baskauskas',
  'Yul_Kwon',
  'Earl_Cole',
  'Todd_Herzog',
  'Parvati_Shallow',
  'Bob_Crowley',
  'JT_Thomas',
  'Natalie_White',
  'Fabio_Birza',
  'Rob_Mariano',
  'Sophie_Clarke',
  'Kim_Spradlin-Wolfe',
  'Denise_Stapley',
  'John_Cochran',
  'Tyson_Apostol',
  'Tony_Vlachos',
  'Natalie_Anderson',
  'Mike_Holloway',
  'Jeremy_Collins',
  'Michele_Fitzgerald',
  'Adam_Klein',
  'Sarah_Lacina',
  'Ben_Driebergen',
  'Wendell_Holland',
  'Nick_Wilson',
  'Chris_Underwood',
  'Tommy_Sheehan',
];

const writeWinnersData = (list) => {
  const data = {};
  let runOnce = false; // Debug purpose.
  winners_name.forEach((winnerName) => {
    if (!runOnce) {
      const winner = processData(list, winnerName);
      data[winnerName] = winner;
      // runOnce = true;
    }
  });

  const formattedData = JSON.stringify(data, null, 2);

  fs.truncate('./data/draft-winners.json', 0, () => {});
  fs.writeFile('./data/draft-winners.json', formattedData, (err) => {
    if (err) console.log(err);
  });
};

const processData = (list, winnerName) => {
  const {
    avatar,
    survivorWikiHref,
    name,
    birthday,
    passedAway,
    numberSeasons,
    seasonsStat,
  } = list[winnerName];
  const {
    hometown: originalHometown,
    seasonName: originalSeasonName,
    seasonNumber: originalSeasonNumber,
  } = seasonsStat[0];

  let totalVotesAgainst = 0;
  let totalTribalWins = 0;
  let totalIndividualWins = 0;
  let totalDaysLasted = 0;
  let averagePlacement = 0;
  let seasons = '';
  let winningSeason;
  let winningSeasonNumber;
  let secondWinningSeason;
  let secondWinningSeasonNumber;
  let runnerUpSeason;
  let runnerUpSeasonNumber;
  let secondRunnerUpSeason;
  for (let i = 0; i < numberSeasons; i++) {
    let {
      seasonName,
      seasonNumber,
      votesAgainst,
      tribalWins,
      individualWins,
      daysLasted,
      finishPlacement,
    } = seasonsStat[i];
    if (votesAgainst === 'N/A') {
      votesAgainst = 0;
    }
    if (tribalWins === 'N/A') {
      tribalWins = 0;
    }
    if (individualWins === 'N/A') {
      individualWins = 0;
    }
    totalVotesAgainst += votesAgainst;
    totalTribalWins += tribalWins;
    totalIndividualWins += individualWins;
    totalDaysLasted += daysLasted;

    if (numberSeasons === 1) {
      seasons = seasonName; // 1 season
    } else {
      if (i === numberSeasons - 1) {
        seasons += `& ${seasonName}`; // last season
      } else if (i === numberSeasons - 2) {
        seasons += `${seasonName} `; // second to last season
      } else {
        seasons += `${seasonName}, `;
      }
    }

    if (finishPlacement === 'Sole Survivor') {
      if (!winningSeason) {
        winningSeason = seasonName;
        winningSeasonNumber = seasonNumber;
      } else {
        secondWinningSeason = seasonName;
        secondWinningSeasonNumber = seasonNumber;
      }

      finishPlacement = 1;
    } else if (finishPlacement === 'Runner-Up') {
      runnerUpSeason = seasonName;
      runnerUpSeasonNumber = seasonNumber;
      finishPlacement = 2;
    } else if (finishPlacement === '2nd Runner-Up') {
      secondRunnerUpSeason = seasonName;
      runnerUpSeasonNumber = seasonNumber;
      finishPlacement = 3;
    } else {
      finishPlacement = parseInt(finishPlacement.match(/\d+/)[0]);
    }
    averagePlacement += finishPlacement;
  }

  averagePlacement = averagePlacement / numberSeasons;
  averagePlacement = Math.round(averagePlacement * 10) / 10;

  const winner = {
    avatar,
    survivorWikiHref,
    name,
    birthday,
    passedAway,
    numberSeasons,
    originalHometown,
    originalSeasonName,
    originalSeasonNumber,
    totalVotesAgainst,
    totalTribalWins,
    totalIndividualWins,
    totalDaysLasted,
    seasons,
    averagePlacement,
    winningSeason,
    winningSeasonNumber,
  };

  if (runnerUpSeason) {
    winner['runnerUpSeason'] = runnerUpSeason;
    winner['runnerUpSeasonNumber'] = runnerUpSeasonNumber;
  }
  if (secondRunnerUpSeason) {
    winner['secondRunnerUpSeason'] = secondRunnerUpSeason;
    winner['runnerUpSeasonNumber'] = runnerUpSeasonNumber;
  }
  if (secondWinningSeason) {
    winner['secondWinningSeason'] = secondWinningSeason;
    winner['secondWinningSeasonNumber'] = secondWinningSeasonNumber;
  }

  // console.log(list[winnerName]);
  // console.log(winner);

  return winner;
};

module.exports = () => {
  fs.readFile('./data/contestants.json', (err, data) => {
    if (err) console.log(err);
    const list = JSON.parse(data);
    writeWinnersData(list);
  });
};
