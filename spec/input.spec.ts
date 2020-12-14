import { parseSimpleSrt, DEFAULT_INTERVAL_BEFORE_NEXT_CAPTION, errorMessages } from './../src/input';
import { SrtDataItem } from './../src/output';
import * as fs from 'promise-fs';

describe('input.ts', () => {

  describe('parseSimpleSrt', () => {

    let exampleFileContents: string;

    const expectedResult: SrtDataItem[] = [
      {
        number: 1,
        startTime: 2 * 60000 + 17000,
        endTime: 2 * 60000 + 20000 - DEFAULT_INTERVAL_BEFORE_NEXT_CAPTION,
        text: 'Senator, we\'re making\nour final approach into Coruscant.'
      },
      {
        number: 2,
        startTime: 2 * 60000 + 20000,
        endTime: 2 * 60000 + 22500,
        text: 'Very good, Lieutenant.'
      }
    ];

    beforeEach((done) => {
      fs.readFile('./spec/data/simplified-srt.txt')
        .then(buffer => exampleFileContents = String(buffer))
        .then(() => done())
        .catch(err => done.fail(err));        
    });

    it('should parse simple srt with default options', () => {

      const parseResult = parseSimpleSrt(exampleFileContents);

      expect(parseResult.errors.length).toBe(0, 'should be no errors');
      expect(parseResult.result.length)
        .toBe(expectedResult.length, 'should return all data items');

      const resultNumbers = parseResult.result.map(item => item.number);

      expect(resultNumbers
        .reduce((acc, curr) => curr === acc + 1 ? curr : -1, 0)
        ).toBe(expectedResult.length, 'should add ascending numbering starting from 1');

      const startTimes = expectedResult.map(item => item.startTime);
      startTimes.forEach((time, index) => expect(parseResult.result[index].startTime)
        .toBe(time, 'startTime at index ' + index + ' is wrong'));

      const endTimes = expectedResult.map(item => item.endTime);
      endTimes.forEach((time, index) => expect(parseResult.result[index].endTime)
        .toBe(time, 'endTime at index ' + index + ' is wrong'));
    });

    it('should parse times forgivingly', () => {

      const timeTests: { time: string, expected: number }[] = [
        { time: '01:02', expected: 62 * 1000 },
        { time: '01:02:02', expected: 3600 * 1000 + 2 * 60000 + 2000 },
        { time: '01:02.100', expected: 62100 },
        { time: '5.04', expected: 5 * 60000 + 4000 }
      ];

      const generateSimpleSrtString: (startTime: string) => string = str => str +
        '\n' + 'foo';

      timeTests.forEach(testCase => {
        const result = parseSimpleSrt(generateSimpleSrtString(testCase.time));
        expect(result.result[0].startTime).toBe(testCase.expected, 'original was ' + testCase.time);
      });
    });

    describe('errors', () => {

      it('should show invalid time error', () => {
        const simpleSrt = '_invalid_time_line\nCaptions';
        const result = parseSimpleSrt(simpleSrt);
        expect(result.result.length).toBe(0, 'by default, should return no results if there are errors');
        expect(result.errors.length).toBe(1, 'should return error');
        expect(result.errors[0] && result.errors[0].atIndex).toBe(0);
        expect(result.errors[0] && result.errors[0].errorType).toBe(errorMessages.INVALID_TIME);
        expect(result.errors[0] && result.errors[0].originalString).toBe(simpleSrt);
      });
    });

    describe('options', () => {

      it('should change default gap between subtitles', () => {
        const captionInterval = 500;
        const result = parseSimpleSrt(exampleFileContents, { captionInterval });
        expect(result.result[0].endTime).toBe(
          result.result[1].startTime - captionInterval,
          'should override defaulta caption interval'
        );
      });
      
    });
  });

  

});