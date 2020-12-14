import * as fs from 'promise-fs';
import * as simpleSrt from '../src/index';

describe('index.ts fromString', () => {
  it('should read a string and return valid .srt', (done) => {

    Promise.all([
        fs.readFile('./spec/data/simplified-srt.txt')
          .then(buffer => String(buffer))
          .then(str => simpleSrt.fromString(str)),
        fs.readFile('./spec/data/expected-output.srt')
        .then(buffer => String(buffer))
      ])
      .then(([ conversionResult, expectedSrt ]: [ simpleSrt.ConversionResult, string ]) => {        
        const expectedLines = expectedSrt.split(/\r?\n/);
        expect(conversionResult.success).toBe(true);
        conversionResult
          .output
          .split('\n')
          .forEach((resultLine, index) => expect(resultLine)
            .toBe(expectedLines[index], 'at index ' + index));
      })
      .then(done)
      .catch(err => done.fail(err));      
     
  });
});