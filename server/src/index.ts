import express from 'express';
import { Request, Response } from 'express';
import { Readable } from 'stream';
import csv from 'csv-parser';

interface Speaker {
  Speaker: string;
  Topic: string;
  Date: string;
  Words: string;
}

const PORT = 5000;
const app = express();

app.get('/evaluation', (req: Request, res: Response) => {
  const data: any = req.query.data;
  parseCsvData(data)
    .then((parsedData) => {
      const result: string = bundleResultsToJson(parsedData);
      res.json(result);
    })
    .catch((err: Error) => {
      console.error(err);
      res.status(500).send('Error parsing CSV data');
    });
});

const parseCsvData = (csvData: string): Promise<Speaker[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const readableStream = Readable.from(csvData);
    readableStream
      .pipe(csv({ separator: ',' }))
      .on('data', (data: { [key: string]: string }) => {
        const row: { [key: string]: string } = {};
        Object.keys(data).forEach((key: string) => {
          row[key.trim()] = data[key].trim();
        });
        results.push(row);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

function findSpeakerWithMostSpeechesByYear(arrSpeaker: Speaker[], targetYear: number): object {
  const speakerStats: { [speakerName: string]: number } = {};
  let highestSpeechCount: number = 0;
  let speakerWithMostSpeeches: string | null = null;

  arrSpeaker.forEach((objSpeaker) => {
    let speechYear = new Date(objSpeaker.Date).getFullYear();

    if (speechYear === targetYear) {
      let speakerName = objSpeaker.Speaker;
      speakerStats[speakerName] = speakerStats[speakerName] + 1 || 1;

      if (speakerWithMostSpeeches === null || speakerStats[speakerName] > highestSpeechCount) {
        highestSpeechCount = speakerStats[speakerName];
        speakerWithMostSpeeches = speakerName;
      }
    }
  });

  const result = { mostSpeeches: speakerWithMostSpeeches };
  return result;
}

function findSpeakerWithMostSpeechesByTopic(arrSpeaker: Speaker[], targetTopic: string): object {
  const speakerStats: { [speakerName: string]: number } = {};
  let highestSpeechCount: number = 0;
  let speakerWithMostSpeeches: string | null = null;

  arrSpeaker.forEach((objSpeaker) => {
    if (objSpeaker.Topic === targetTopic) {
      let speakerName = objSpeaker.Speaker;
      speakerStats[speakerName] = speakerStats[speakerName] + 1 || 1;

      if (speakerWithMostSpeeches === null || speakerStats[speakerName] > highestSpeechCount) {
        highestSpeechCount = speakerStats[speakerName];
        speakerWithMostSpeeches = speakerName;
      }
    }
  });
  const result = { mostSecurity: speakerWithMostSpeeches };
  return result;
}

function findLeastWordySpeaker(arrSpeaker: Speaker[]): object {
  const speakerStats: { [key: string]: number } = {};
  let fewestWords: number = Number.MAX_SAFE_INTEGER;
  let speakerWithFewestWords: string | null = null;

  for (const objSpeaker of arrSpeaker) {
    let speakerName = objSpeaker.Speaker;
    speakerStats[speakerName] =
      (speakerStats[speakerName] !== undefined ? speakerStats[speakerName] : 0) + parseInt(objSpeaker.Words);
  }

  for (const [speaker, wordCount] of Object.entries(speakerStats)) {
    if (wordCount < fewestWords) {
      speakerWithFewestWords = speaker;
      fewestWords = wordCount;
    }
  }
  const result = { leastWordy: speakerWithFewestWords };
  return result;
}

function bundleResultsToJson(arrSpeaker: Speaker[]): string {
  const mostSpeechesByYear: object = findSpeakerWithMostSpeechesByYear(arrSpeaker, 2013);
  const mostSpeechesByTopic: object = findSpeakerWithMostSpeechesByTopic(arrSpeaker, 'Internal Security');
  const leastWordySpeaker: object = findLeastWordySpeaker(arrSpeaker);
  const mergedObj: object = { ...mostSpeechesByYear, ...mostSpeechesByTopic, ...leastWordySpeaker };
  return JSON.stringify(mergedObj);
}

app.listen(PORT, () => console.log(`listening on port : ${PORT}`));
