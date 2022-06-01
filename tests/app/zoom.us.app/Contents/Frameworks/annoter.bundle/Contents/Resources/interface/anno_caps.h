/*****************************************************************************
*
* Copyright (C) 2014, Zoom Video Communications, Inc
*
* History:
*	Nov 2014 - Created - ken.ding@zoom.us
*	
*****************************************************************************/

#ifndef __ANNO_CAPS_H__
#define __ANNO_CAPS_H__

#include "anno_types.h"

// ----------------------------------------------------------------------------
//	Define the version string of this component
// ----------------------------------------------------------------------------

#define ANNO_ENGINE_VERSION_UNKNOWN		0

///////////////////////////////////////////////////////////////////////
// May 2013: version 1.0.0
//	Initial version for Windows presenter side annotation
//	Initial version for Mac presenter side annotation
//
#define ANNO_ENGINE_VERSION_1_0_0		100

///////////////////////////////////////////////////////////////////////
// May 2014: version 2.0.0
//	Added iPhone annotation support in Jan 2014
//	Added iOS whiteboard support in Jan 2014
//	Added Windows attendee side annotation
//	Added Mac attendee side annotation
//	Added PDU and objects backwards and forwards compatibility support
//
#define ANNO_ENGINE_VERSION_2_0_0		200

///////////////////////////////////////////////////////////////////////
// May 2015: version 3.0.0
//	Added screen sharing based whiteboard
//	Added shape rendering for:
//		ANNO_OBJ_TYPE_AUTO_DOUBLE_ARROW,
//		ANNO_OBJ_TYPE_AUTO_DIAMOND,
//		ANNO_OBJ_TYPE_AUTO_STAMP_ARROW,
//		ANNO_OBJ_TYPE_AUTO_STAMP_CHECK,
//		ANNO_OBJ_TYPE_AUTO_STAMP_X,
//
#define ANNO_ENGINE_VERSION_3_0_0		300

///////////////////////////////////////////////////////////////////////
// Aug 2015: version 4.0.0
//	This version is for iOS only:
//  The early supported rendering is included:
//      ANNO_OBJ_TYPE_TEXTBOX
//
//	Added shape rendering for:
//		ANNO_OBJ_TYPE_AUTO_DOUBLE_ARROW,
//		ANNO_OBJ_TYPE_AUTO_DIAMOND,
//		ANNO_OBJ_TYPE_AUTO_STAMP_ARROW,
//		ANNO_OBJ_TYPE_AUTO_STAMP_CHECK,
//		ANNO_OBJ_TYPE_AUTO_STAMP_X,
//
#define ANNO_ENGINE_VERSION_4_0_0		400

///////////////////////////////////////////////////////////////////////
// Nov 2015: version 4.1.0
//	This version is for iOS and Mac only:
//  Added the following composer capacity:
//      ANNO_OBJ_TYPE_TEXTBOX & text in Shape
//
//
#define ANNO_ENGINE_VERSION_4_1_0		410

///////////////////////////////////////////////////////////////////////
// Mar 2017: version 4.2.0
//	This version is regarding Zoom Room Touch 2.0 support of adding
//  a thickness line object
//
//	Added shape rendering for:
//		ANNO_OBJ_TYPE_THICKNESS_PEN,
//
#define ANNO_ENGINE_VERSION_4_2_0		420

///////////////////////////////////////////////////////////////////////
// April 2018: version 4.2.1
//	This version is regarding host/co-host can clear all and save annotate support of adding
//  a thickness line object
//
#define ANNO_ENGINE_VERSION_4_2_1		421

///////////////////////////////////////////////////////////////////////
// July 2018: version 4.3.0
//  Added shape rendering for:
//		ANNO_OBJ_TYPE_AUTO_STAMP_STAR,
//		ANNO_OBJ_TYPE_AUTO_STAMP_HEART,
//		ANNO_OBJ_TYPE_AUTO_STAMP_QM,
//
#define ANNO_ENGINE_VERSION_4_3_0		430

#if defined (WIN32)
  #define ANNO_ENGINE_VERSION			ANNO_ENGINE_VERSION_4_3_0
#elif defined (__MACOS__)
  #define ANNO_ENGINE_VERSION			ANNO_ENGINE_VERSION_4_3_0
#elif defined (__LINUX_CLIENT__)
  #define ANNO_ENGINE_VERSION			ANNO_ENGINE_VERSION_4_3_0
#elif defined (__IOS__)
  #define ANNO_ENGINE_VERSION			ANNO_ENGINE_VERSION_4_3_0
#elif defined (__ANDROID__)
  #define ANNO_ENGINE_VERSION			ANNO_ENGINE_VERSION_4_3_0
#else
  #define ANNO_ENGINE_VERSION			ANNO_ENGINE_VERSION_1_0_0
#endif

// ----------------------------------------------------------------------------
//	Define enumeration type contains values that identify the type of capability 
//	  information that is received from a call to GetCaps
// ----------------------------------------------------------------------------

typedef enum tagAnnoCapsType
{
	ANNOCAPS_TYPE_TOOL,
	ANNOCAPS_TYPE_RENDER
} AnnoCapsType;

typedef enum tagAnnoCapsToolType
{
	ANNOCAPS_TOOL,
	ANNOCAPS_TOOL_PEN,
	ANNOCAPS_TOOL_HIGHLIGHTER,
	ANNOCAPS_TOOL_SPOTLIGHT,
	ANNOCAPS_TOOL_ARROW,
	ANNOCAPS_TOOL_TEXTBOX,
	ANNOCAPS_TOOL_PICTURE,
	ANNOCAPS_TOOL_ERASER,
	ANNOCAPS_TOOL_BRUSH_ERASER,
	ANNOCAPS_TOOL_PICKER,
	ANNOCAPS_TOOL_SELECTOR,
	ANNOCAPS_TOOL_AUTO_LINE,
	ANNOCAPS_TOOL_AUTO_ARROW1,
	ANNOCAPS_TOOL_AUTO_ARROW2,
	ANNOCAPS_TOOL_AUTO_RECTANGLE,
	ANNOCAPS_TOOL_AUTO_ROUNDEDRECTANGLE,
	ANNOCAPS_TOOL_AUTO_ELLIPSE,
    ANNOCAPS_TOOL_AUTO_DOUBLE_ARROW,
    ANNOCAPS_TOOL_AUTO_RECTANGLE_SEMI_FILL,
    ANNOCAPS_TOOL_AUTO_RECTANGLE_FILL,
    ANNOCAPS_TOOL_AUTO_ROUNDEDRECTANGLE_SEMI_FILL,
    ANNOCAPS_TOOL_AUTO_ROUNDEDRECTANGLE_FILL,
    ANNOCAPS_TOOL_AUTO_ELLIPSE_SEMI_FILL,
    ANNOCAPS_TOOL_AUTO_ELLIPSE_FILL,
    ANNOCAPS_TOOL_AUTO_STAMP_ARROW,
    ANNOCAPS_TOOL_AUTO_STAMP_CHECK,
    ANNOCAPS_TOOL_AUTO_STAMP_X,
	ANNOCAPS_TOOL_AUTO_STAMP_STAR,
	ANNOCAPS_TOOL_AUTO_STAMP_HEART,
	ANNOCAPS_TOOL_AUTO_STAMP_QM
} AnnoCapsToolType;

typedef struct tagAnnoCapsTool
{
	AnnoCapsToolType	annoCapsToolType;
	bool				supported;
} AnnoCapsTool;

typedef enum tagAnnoCapsRenderType
{
	ANNOCAPS_RENDER,
	ANNOCAPS_RENDER_PEN,
	ANNOCAPS_RENDER_HIGHLIGHTER,
	ANNOCAPS_RENDER_SPOTLIGHT,
	ANNOCAPS_RENDER_ARROW,
	ANNOCAPS_RENDER_TEXTBOX,
	ANNOCAPS_RENDER_PICTURE,
	ANNOCAPS_RENDER_AUTOSHAPE_LINE,
	ANNOCAPS_RENDER_AUTOSHAPE_ARROW1,
	ANNOCAPS_RENDER_AUTOSHAPE_ARROW2,
	ANNOCAPS_RENDER_AUTOSHAPE_RECTANGLE,
	ANNOCAPS_RENDER_AUTOSHAPE_ROUNDEDRECTANGLE,
	ANNOCAPS_RENDER_AUTOSHAPE_ELLIPSE,
    ANNOCAPS_RENDER_AUTO_DOUBLE_ARROW,
    ANNOCAPS_RENDER_AUTO_RECTANGLE_SEMI_FILL,
    ANNOCAPS_RENDER_AUTO_RECTANGLE_FILL,
    ANNOCAPS_RENDER_AUTO_ROUNDEDRECTANGLE_SEMI_FILL,
    ANNOCAPS_RENDER_AUTO_ROUNDEDRECTANGLE_FILL,
    ANNOCAPS_RENDER_AUTO_ELLIPSE_SEMI_FILL,
    ANNOCAPS_RENDER_AUTO_ELLIPSE_FILL,
    ANNOCAPS_RENDER_AUTO_STAMP_ARROW,
    ANNOCAPS_RENDER_AUTO_STAMP_CHECK,
    ANNOCAPS_RENDER_AUTO_STAMP_X
} AnnoCapsRenderType;

typedef struct tagAnnoCapsRender
{
	AnnoCapsRenderType	annoCapsRenderType;
	bool				supported;
} AnnoCapsRender;

// ----------------------------------------------------------------------------
//	Features configurations
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// Enabling this marco: AppShare presenter will send PDU to remote
// Disabling this macro: otherwise
// ----------------------------------------------------------------------------

//#define APPSHARE_PRESENTER_SEND_PDU

// ----------------------------------------------------------------------------
//	Testing defines
// ----------------------------------------------------------------------------

#if defined _DEBUG || defined DEBUG
// #define ANNO_SDK_TEST_SCENARIOS 1
// #define TEST_REQUEST_IMAGE_DATA_DEMO
#endif

typedef enum tagAnnoScenarioTest
{
	ANNOSCENARIO_CONNECTOR,
	ANNOSCENARIO_ROTATED_SHAPE,
	ANNOSCENARIO_ROTATED_LINE,
	ANNOSCENARIO_NEW_ATTRIBUTE,
	ANNOSCENARIO_NEW_OBJECT,
} AnnoScenarioTest;

#endif // __ANNO_CAPS_H__
