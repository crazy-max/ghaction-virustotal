/*****************************************************************************
*
* Copyright (C) 2013, Zoom Video Communications, Inc
*
* History:
*	Nov 2013 - Created - ken.ding@zoom.us
*	
*****************************************************************************/

#ifndef __ANNO_FORMAT_H__
#define __ANNO_FORMAT_H__

// ----------------------------------------------------------------------------
//	Define structures to represent visual format of drawing objects. 
// ----------------------------------------------------------------------------

#ifndef AnnoStruSize
  typedef UInt16 AnnoStruSize;
#endif

#ifndef AnnoDataSize
  typedef UInt32 AnnoDataSize;
#endif

#ifndef AnnoColor
  typedef UInt32 AnnoColor;
#endif

#ifndef AnnoMakeColor
  #define AnnoMakeColor(r,g,b) ((AnnoColor)(((UInt8)(r)|((UInt16) \
		((UInt8)(g))<<8))|(((UInt32)(UInt8)(b))<<16)))
#endif

#define AnnoGetRed(annoColor)		(annoColor & 0xff)
#define AnnoGetGreen(annoColor)		((annoColor >> 8) & 0xff)
#define AnnoGetBlue(annoColor)		((annoColor >> 16) & 0xff)


// #AARRGGBB
#ifndef AnnoColor32
  typedef UInt32 AnnoColor32;
#endif

#ifndef AnnoMakeColor32
#define AnnoMakeColor32(a, r, g, b)   ((((UInt32)(UInt8)(a))<<24)|(((UInt32)(UInt8)(r))<<16)|((UInt32)((UInt8)(g))<<8)|(UInt8)(b))
#endif

#define AnnoGetA(color)  ((color>>24) & 0xff)
#define AnnoGetR(color)  ((color>>16) & 0xff)
#define AnnoGetG(color)  ((color>> 8) & 0xff)
#define AnnoGetB(color)  (color & 0xff)

#ifndef AnnoColor32ToRgbaUInt8s
#define AnnoColor32ToRgbaUInt8s(color)  AnnoGetR(color), AnnoGetG(color), AnnoGetB(color), AnnoGetA(color)
#endif

#ifndef AnnoColor32ToRgbaFloats
#define AnnoColor32ToRgbaFloats(color)  AnnoGetR(color)/255.f, AnnoGetG(color)/255.f, AnnoGetB(color)/255.f, AnnoGetA(color)/255.f
#endif

// #RRGGBBAA
#ifndef AnnoColorRGBA32
  typedef UInt32 AnnoColorRGBA32;
#endif

#ifndef AnnoMakeColorRGBA32
#define AnnoMakeColorRGBA32(r, g, b, a)   ((((UInt32)(UInt8)(r))<<24)|(((UInt32)(UInt8)(g))<<16)|((UInt32)((UInt8)(b))<<8)|(UInt8)(a))
#endif

#define AnnoColorRGBA32GetR(color)  ((color>>24) & 0xff)
#define AnnoColorRGBA32GetG(color)  ((color>>16) & 0xff)
#define AnnoColorRGBA32GetB(color)  ((color>> 8) & 0xff)
#define AnnoColorRGBA32GetA(color)  (color & 0xff)

typedef enum tagAnnoLineDashStyle
{
    ANNO_LINE_DASH_STYLE_SOLID,
    ANNO_LINE_DASH_STYLE_DASH,
    ANNO_LINE_DASH_STYLE_DOT,
    ANNO_LINE_DASH_STYLE_DASHDOT,
    ANNO_LINE_DASH_STYLE_DASHDOTDOT,
    ANNO_LINE_DASH_STYLE_PATTERN,
    ANNO_LINE_DASH_STYLE_DEFAULT    = ANNO_LINE_DASH_STYLE_SOLID
} AnnoLineDashStyle;

typedef struct tagAnnoDashPattern
{
    AnnoLineDashStyle   dashStyle;
    Float32*            dashArray;
    Int32               arrayLen;

    tagAnnoDashPattern() 
        : dashStyle(ANNO_LINE_DASH_STYLE_DEFAULT)
        , dashArray(0)
        , arrayLen(0)
    {
    }
}AnnoDashPattern;

typedef enum tagAnnoLineJoinStyle
{
    ANNO_LINE_JOIN_STYLE_JOINMITER,
    ANNO_LINE_JOIN_STYLE_JOINROUND,
    ANNO_LINE_JOIN_STYLE_JOINBEVEL,
    ANNO_LINE_JOIN_STYLE_MITERORBEVEL,
    ANNO_LINE_JOIN_STYLE_DEFAULT	= ANNO_LINE_JOIN_STYLE_JOINROUND
} AnnoLineJoinStyle;

typedef enum tagAnnoLineCapStyle
{
    ANNO_LINE_CAP_STYLE_BUTT,
    ANNO_LINE_CAP_STYLE_CAPROUND,
    ANNO_LINE_CAP_STYLE_CAPSQUARE,
    ANNO_LINE_CAP_STYLE_CAPTRIANGLE,
    ANNO_LINE_CAP_STYLE_DEFAULT		= ANNO_LINE_CAP_STYLE_CAPROUND
} AnnoLineCapStyle;

typedef enum tagAnnoLineArrowStyle
{
	ANNO_LINE_ARROW_STYLE_NONE,
	ANNO_LINE_ARROW_STYLE_VEE,
	ANNO_LINE_ARROW_STYLE_TRIANGLE,
	ANNO_LINE_ARROW_STYLE_DEFAULT = ANNO_LINE_ARROW_STYLE_NONE
} AnnoLineArrowStyle;

typedef struct tagAnnoColorLine
{
	AnnoStruSize		struSize;
	AnnoDataSize		dataSize;
	AnnoLineDashStyle   dashStyle;
    AnnoLineJoinStyle   joinStyle;
    AnnoLineCapStyle    capStyle;
    UInt32              width;		// in twips
    AnnoColor           color;
    Float32             alpha;		// 0.0 ~ 1.0. 0.0 = full transparent, 1.0 means full opaque
	// extra field
	//	...

	// extra dynamic data
	//	...
    // NOTE: since AnnoColorLine is include in a union struct and this file is included in MCM(which is not support cpp11 now), we could not provide the constructor
    // tagAnnoColorLine()
    // {
    //     struSize = sizeof(tagAnnoColorLine);
    //     dataSize = 0;
    //     dashStyle = (AnnoLineDashStyle)0;
    //     joinStyle = (AnnoLineJoinStyle)0;
    //     capStyle = (AnnoLineCapStyle)0;
    //     width = 0;
    //     color = 0;
    //     alpha = 0.0f;
    // }
} AnnoColorLine;

typedef enum tagAnnoLineFormatType
{
    ANNO_LINE_FORMAT_TYPE_NONE,
    ANNO_LINE_FORMAT_TYPE_COLOR,
    ANNO_LINE_FORMAT_TYPE_DEFAULT  = ANNO_LINE_FORMAT_TYPE_COLOR
} AnnoLineFormatType;

typedef struct tagAnnoLineFormat
{
	AnnoStruSize		struSize;
	AnnoDataSize		dataSize;
	AnnoLineFormatType  type;
	// extra field
	//	...

    union uAnnoLineData
    {
        AnnoColorLine   colorLine;
        uAnnoLineData():colorLine() {}
    } AnnoLineData;
	// extra dynamic data
	//	...

	tagAnnoLineFormat()
	{
		struSize = sizeof(tagAnnoLineFormat);
		dataSize = 0;
		type = ANNO_LINE_FORMAT_TYPE_NONE;
	}
} AnnoLineFormat;

typedef struct tagAnnoColorFill
{
	AnnoStruSize		struSize;
	AnnoDataSize		dataSize;
	AnnoColor			color;
    Float32				alpha;

	// extra field
	//	...

	// extra dynamic data
	//	...
    // NOTE: since AnnoColorFill is include in a union struct and this file is included in MCM(which is not support cpp11 now), we could not provide the constructor
    // tagAnnoColorFill()
    // {
    //     struSize = sizeof(tagAnnoColorFill);
    //     dataSize = 0;
    //     color = 0;
    //     alpha = 0.0f;
    // }
} AnnoColorFill;

typedef enum tagAnnoFillFormatType
{
    ANNO_FILL_FORMAT_TYPE_NONE,
    ANNO_FILL_FORMAT_TYPE_COLOR,
    ANNO_FILL_FORMAT_TYPE_DEFAULT  = ANNO_FILL_FORMAT_TYPE_NONE
} AnnoFillFormatType;

typedef struct tagAnnoFillFormat
{
	AnnoStruSize		struSize;
	AnnoDataSize		dataSize;
    AnnoFillFormatType  type;
	// extra field
	//	...

    union uAnnoFillData
    {
        AnnoColorFill   colorFill;
        uAnnoFillData() : colorFill() {}
    } AnnoFillData;
	// extra dynamic data
	//	...
	tagAnnoFillFormat()
	{
		struSize = sizeof(tagAnnoFillFormat);
		dataSize = 0;
		type = ANNO_FILL_FORMAT_TYPE_NONE;
	}
} AnnoFillFormat;

typedef enum AnnoTextStyleMask
{
    ANNO_TEXT_STYLE_NONE        = 0x0000,
    ANNO_TEXT_STYLE_ITALIC      = 0x0001,
    ANNO_TEXT_STYLE_OUTLINE     = 0x0002,
    ANNO_TEXT_STYLE_STRIKEOUT   = 0x0004,
    ANNO_TEXT_STYLE_UNDERLINE   = 0x0008,
    ANNO_TEXT_STYLE_SUPERSCRIPT = 0x0010,
    ANNO_TEXT_STYLE_SUBSCRIPT   = 0x0020,
    ANNO_TEXT_STYLE_EMBOSS      = 0x0040,
    ANNO_TEXT_STYLE_SHADDOW     = 0x0080,
    ANNO_TEXT_STYLE_BOLD        = 0x0100,
	ANNO_TEXT_STYLE_DEFAULT		= ANNO_TEXT_STYLE_NONE
} AnnoTextStyleMask;
typedef unsigned int AnnoTextStyle;

#define ANNO_MAX_FONT_NAME      64  // in charactors of unicode

// Font weight table
/*
THIN:          -0.8f;
EXTRA_LIGHT:   -0.6f;
LIGHT:         -0.4f;
NORMAL:         0.0f;
MEDIUM:         0.2f;
SEMI_BOLD:      0.3f;
BOLD:           0.4f;
EXTRA_BOLD:     0.6f;
BLACK:          0.8f;
*/
#define ANNO_FONT_WEIGHT_THIN           (-0.8f)
#define ANNO_FONT_WEIGHT_EXTRA_LIGHT    (-0.6f)
#define ANNO_FONT_WEIGHT_LIGHT          (-0.4f)
#define ANNO_FONT_WEIGHT_NORMAL          (0.0f)
#define ANNO_FONT_WEIGHT_MEDIUM          (0.2f)
#define ANNO_FONT_WEIGHT_SEMI_BOLD       (0.3f)
#define ANNO_FONT_WEIGHT_BOLD            (0.4f)
#define ANNO_FONT_WEIGHT_EXTRA_BOLD      (0.6f)
#define ANNO_FONT_WEIGHT_BLACK           (0.8f)

typedef struct tagAnnoFontDescriptor
{
    AnnoStruSize		struSize;
    AnnoDataSize		dataSize;
    UInt8               size;
    AnnoColor			color;                          // font color
    Float32				alpha;                          // alpha of font
    Float32             weight;                         // -1.0 to 1.0, 0 is normal, 0.4 is bold, see font table above
    AnnoTextStyle		style;                          // font style
    Float32             baseLineOffset;                 // baseline offset for the specified superscript or subscript characters
    UInt16              name[ANNO_MAX_FONT_NAME];       // NULL ended UTF-16 string representing font name, for example: "Arial
    UInt16              nameAscii[ANNO_MAX_FONT_NAME];  // NULL ended UTF-16 string representing font name for character within the range of 0 to 127
    UInt16              nameOther[ANNO_MAX_FONT_NAME];  // NULL ended UTF-16 string representing font name for character numbers are greater than 127
    UInt16              nameComplexScript[ANNO_MAX_FONT_NAME];  // NULL ended UTF-16 string representing font name for complex scrip
	// NOTE: since AnnoFontDescriptor is include in a union struct and this file is included in MCM(which is not support cpp11 now), we could not provide the constructor
    // tagAnnoFontDescriptor()
	// {
	// 	struSize = sizeof(tagAnnoFontDescriptor);
	// 	dataSize = 0;
	// 	size = 0;
	// 	color = 0;
	// 	alpha = 0;
	// 	weight = 0;
	// 	style = ANNO_TEXT_STYLE_NONE;
	// 	baseLineOffset = 0.0f;
	// }
} AnnoFontDescriptor;

typedef enum tagAnnoFontFormatType
{
    ANNO_FONT_FORMAT_TYPE_NONE,
    ANNO_FONT_FORMAT_TYPE_COLOR,
    ANNO_FONT_FORMAT_TYPE_DEFAULT  = ANNO_FONT_FORMAT_TYPE_NONE
} AnnoFontFormatType;

typedef struct tagAnnoFontFormat
{
    AnnoFontFormatType  type;
    union uAnnoFontData
    {
        AnnoFontDescriptor colorFont;
        uAnnoFontData()
        {}
    } AnnoFontData;

	tagAnnoFontFormat()
	{
		type = ANNO_FONT_FORMAT_TYPE_NONE;
	}

} AnnoFontFormat;

typedef struct tagAnnoToolFormat
{
    AnnoLineFormat      lineFormat;
    AnnoFillFormat      fillFormat;
    AnnoFontFormat      fontFormat;
} AnnoToolFormat;

#endif // __ANNO_FORMAT_H__
