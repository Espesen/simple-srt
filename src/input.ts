import { SrtDataItem } from "./output";

export const DEFAULT_INTERVAL_BEFORE_NEXT_CAPTION = 750;
const DEFAULT_LAST_CAPTION_DURATION = 5000;

export enum errorMessages {
  INVALID_TIME = 'INVALID_TIME',
  TIME_RANGE = 'TIME_RANGE',
  OVERLAPPING_TIMES = 'OVERLAPPING_TIMES'
}

type ParseError = {
  atIndex: number
  originalString: string,
  errorType: errorMessages
}

type ParseResult = {
  result: SrtDataItem[],
  errors: ParseError[]
};

type SplitResult = {
  timeString: string,
  textLines: string[],
  originalString: string
}[];

const splitItems: (str: string) => SplitResult = str => {
  const itemBreakRegex = /\r?\n\r?\n/;
  const lineBreakRegex = /\r?\n/;
  const splitLines: (str: string) => string[] = src => src.split(lineBreakRegex);
  return str.split(itemBreakRegex)
    .map(item => ({
      timeString: splitLines(item)[0],
      textLines: splitLines(item).slice(1),
      originalString: item
    }));
};

const convertTime: (timeString: string | undefined) => number = timeString => {
  if (!timeString) {
    return 0;
  }
  const msRegex = /[.,](\d{3})$/;
  const msMatch = timeString.match(msRegex);
  const milliSeconds = msMatch ? Number(msMatch[1]) : 0;
  timeString = timeString.replace(msRegex, '');
  const hoursMatch = timeString.match(/^(\d|\d{2})[:.]\d{2}[:.]\d{2}/);
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const restMatch = timeString.replace(msRegex, '').match(/(\d|\d{2})[:.](\d{2})$/);
  const minutes = restMatch ? Number(restMatch[1]) : 0;
  const seconds = restMatch ? Number(restMatch[2]) : 0;
  return hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliSeconds;
};

type StartAndEndTimes = { startTime: number, endTime: number }
const parseTimeString: (timeString: string) => StartAndEndTimes = str => {
  const parts = str.split(/\s?-+>\s?/).map(part => part.trim());
  return {
    startTime: convertTime(parts[0]),
    endTime: convertTime(parts[1])
  };
};

export interface ParseSimpleSrtOptions {
  /** in milliseconds */
  captionInterval?: number
}

export const parseSimpleSrt: (
  contents: string,
  options?: ParseSimpleSrtOptions
) => ParseResult = (simpleSrt, options = {}) => {

  const intervalBeforeNextCaption = options.captionInterval || DEFAULT_INTERVAL_BEFORE_NEXT_CAPTION;
  const errors: ParseError[] = [];

  interface DataItemWithOriginalString extends SrtDataItem {
    originalString: string
  }
  
  const result: DataItemWithOriginalString[] = splitItems(simpleSrt)
    .map((item, index) => Object.assign(
      parseTimeString(item.timeString),
      {
        number: index + 1,
        text: item.textLines.join('\n'),
        originalString: item.originalString
      }))
    // add end times
    .map((item, index, array) => item.endTime ?
      item :
      Object.assign(item, { 
        endTime: index < array.length - 1 ?
          array[index + 1].startTime - intervalBeforeNextCaption :
          item.startTime + DEFAULT_LAST_CAPTION_DURATION
      }));

  result.forEach((item, index, array) => {
    const pushError: (type: errorMessages) => void = errorType => errors.push({
      atIndex: index,
      originalString: item.originalString,
      errorType
    });

    if (!item.startTime) {
      pushError(errorMessages.INVALID_TIME);
    } else if (item.endTime && item.endTime <= item.startTime) {
      pushError(errorMessages.TIME_RANGE);
    } else if (index > 0 && item.startTime < array[index - 1].endTime) {
      pushError(errorMessages.OVERLAPPING_TIMES);
    }
  });

  return {
    result: errors.length ? [] : result,
    errors
  };
};