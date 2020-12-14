import { createSrtFile, SrtDataItem } from './../src/output';
import * as fs from 'promise-fs';

describe('output.ts', () => {

  describe('createSrtFile', () => {

    let exampleFileContents: string;

    const exampleSrtItems: SrtDataItem[] = [
      {
        number: 1,
        startTime: 2 * 60000 + 17440,
        endTime: 2 * 60000 + 20375,
        text: 'Senator, we\'re making\nour final approach into Coruscant.'
      },
      {
        number: 2,
        startTime: 2 * 60000 + 20476,
        endTime: 2 * 60000 + 22501,
        text: 'Very good, Lieutenant.'
      }
    ];

    beforeEach((done) => {
      fs.readFile('./spec/data/example.srt')
        .then(buffer => exampleFileContents = String(buffer))
        .then(() => done())
        .catch(err => done.fail(err));        
    });

    it('should generate output', () => {
      const createdLines = createSrtFile(exampleSrtItems).split(/\r?\n/);
      const expectedLines = exampleFileContents.split(/\r?\n/);
      createdLines.forEach((line, index) => expect(line)
        .toBe(expectedLines[index], 'at index ' + index));
    });
  });
});