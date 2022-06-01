/*****************************************************************************
*
* Copyright (C) 2013, Zoom Video Communications, Inc
*
* History:
*	April 2013 - Created - ken.ding@zoom.us
*	
*****************************************************************************/

#ifndef __ANNO_H__
#define __ANNO_H__

#include "buildtime_client_config.h"
#include "anno_types.h"
#include "anno_format.h"
#include "anno_caps.h"
#include "anno_base.h"

// ----------------------------------------------------------------------------
//	Forward declarations
// ----------------------------------------------------------------------------

class AnnoBase;

// ----------------------------------------------------------------------------
//	AnnoEngine - factory methods
// ----------------------------------------------------------------------------

class ANNO_DLLEXPORT AnnoEngine                                               
{
public:
	static AnnoEngine* Create(
		);

	static bool Delete(
		IN OUT AnnoEngine*& annoEngine
		);

	virtual int GetInterface(
		IN OUT AnnoBase** annoBase
		) = 0;

	virtual int Delete(
		) = 0;
};

// ----------------------------------------------------------------------------
//	AnnoEngine - "C" methods
// ----------------------------------------------------------------------------

#if defined (WIN32)
  #define ANNO_EXPORT _stdcall
#elif defined (__MACOS__) || defined (__IOS__)
  #define ANNO_EXPORT __attribute__((visibility("default")))
#elif defined (__ANDROID__)
  #define ANNO_EXPORT __attribute__((visibility("default"))) 
#elif defined(__LINUX_CLIENT__)
  #define ANNO_EXPORT __attribute__((visibility("default")))
#else
#define ANNO_EXPORT
#endif

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

//
// Call this method to retrieve version number of this interface
//
int ANNO_EXPORT AnnoEngineGetVersion(
	IN OUT unsigned long& version
	);

int ANNO_EXPORT AnnoEngineCreate(
		IN OUT AnnoEngine** annoEngine
		);

#ifdef __cplusplus
}
#endif // __cplusplus

#endif // __ANNO_H__
