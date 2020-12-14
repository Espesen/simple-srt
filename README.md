# simple-srt

Convert simplified subtitle files to valid .srt file format.

### simplified format

```
02:17
Senator, we're making
our final approach into Coruscant.

02:20 --> 02:22,500
Very good, Lieutenant.
```

Compared to normal .srt:
* index numbering is omitted
* hour can be omitted (good for short videos)
* endtime can be omitted in which case te caption end time will be shortly before next caption's start time
* milliseconds can be omitted

NB: Empty line between captions is required!