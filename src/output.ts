export interface SrtDataItem {
  number: number;
  /** in milliseconds */
  startTime: number;
  /** in milliseconds */
  endTime: number;
  text: string;
}

export const createSrtFile = (captions: SrtDataItem[]): string => {
  
  const convertTime: (time: number) => string = time => {
    const hours = '0' + Math.floor(time / (60 * 60 * 1000)).toString().slice(-2);
    const rest = new Date(time)
      .toISOString()
      .slice(-10)
      .replace('.', ',')
      .replace(/Z$/, '');
    return [ hours, rest ].join(':');    
  };

  const createChunk: (dataItem: SrtDataItem) => string = dataItem => {
    let result = '';
    result += dataItem.number.toString() + '\n';
    result += convertTime(dataItem.startTime) + ' --> ' + convertTime(dataItem.endTime) + '\n';
    result += dataItem.text + '\n';
    return result;
  };

  return captions
    .map(item => createChunk(item))
    .join('\n')
    .slice(0, -1);
};