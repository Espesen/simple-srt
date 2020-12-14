import { createSrtFile } from './output';
import { ParseSimpleSrtOptions, parseSimpleSrt } from './input';

type ConversionOptions = ParseSimpleSrtOptions
export type ConversionResult = {
  success: boolean;
  output: string;
  errors: ReturnType<typeof parseSimpleSrt>['errors']
};
type FromString = (str: string, opts?: ConversionOptions) => Promise<ConversionResult>;

/**
 * Convert simplified subtitles to a valid .str format
 */
export const fromString: FromString = (str, options = {}) => {
  const parseResult = parseSimpleSrt(str, options);
  return Promise.resolve({
    success: parseResult.errors.length === 0,
    output: createSrtFile(parseResult.result),
    errors: parseResult.errors
  });
};
