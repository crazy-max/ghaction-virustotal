/******************************************************************************
*
* Copyright (C) 2013, Zoom Video Communications, Inc
*
* History:
*	April 2013 - Created - ken.ding@zoom.us
*	
******************************************************************************/

#ifndef __ANNO_BASE_H__
#define __ANNO_BASE_H__

#include "anno_caps.h"

#ifdef __LINUX_CLIENT__
	#include <stddef.h>
#endif

#ifdef __ANDROID__
	#include <stddef.h>
	#include "anno_format.h"
	#include "anno_types.h"
#endif

// ----------------------------------------------------------------------------
//	class inheritd by AnnoBaseObserver
// ----------------------------------------------------------------------------
class CAnnoEncrypter
{
public:
	virtual int EncryptEstimate(
		IN unsigned int ssrc,
		IN const unsigned char* data,
		IN unsigned int dataLen,
		OUT unsigned char& method,
		OUT unsigned int& estimatedLen
		) { return 0; }

	virtual int EncryptData(
		IN unsigned int ssrc,
		IN const unsigned char* data,
		IN unsigned int dataLen,
		OUT unsigned char& method,
		OUT unsigned char* encryptData,
		OUT unsigned int& encryptDataLen
		) { return 0; }
};

class CAnnoDecrypter
{
public:
	virtual int DecryptEstimate(
		IN unsigned int ssrc,
		IN unsigned char method, 
		IN const unsigned char* data,
		IN unsigned int dataLen,
		OUT unsigned int& estimatedLen
		) { return 0; }

	virtual int DecryptData(
		IN unsigned int ssrc,
		IN unsigned char method, 
		IN const unsigned char* data, 
		IN unsigned int dataLen,
		OUT unsigned char* decryptData,
		OUT unsigned int& decryptDataLen
		) { return 0; }
};

class CAnnoRtpPacketSender
{
public:
	virtual int SendRtpPacket(
		IN unsigned int ssrc, 
		IN const unsigned char* data,
		IN unsigned int dataLen
		) { return 0; }
};

// ----------------------------------------------------------------------------
//	Forward declarations
// ----------------------------------------------------------------------------

class AnnoEngine;

// ----------------------------------------------------------------------------
//	AnnoBase Callbacks
// ----------------------------------------------------------------------------

class ANNO_DLLEXPORT AnnoBaseObserver 
	: public CAnnoEncrypter
	, public CAnnoDecrypter
	, public CAnnoRtpPacketSender
{
public:
	//
	// Callback to upper layer to notify state change
	// @eventType: see definition of AnnoEventType
	// @wParam & @lParam
	//
	//	eventType							wParam                                      lParam
	//	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//	ANNO_EVENT_ROOT_WND					window handle                               not used
	//
	//	ANNO_EVENT_TOOL_CHANGED				current selected tool, in AnnoToolType      not used
	//
	//	ANNO_EVENT_CAN_UNDO_REDO			1: canUndo;									1: canRedo; 
	//										0: otherwise								0: otherwise
	//
	//	ANNO_EVENT_HAS_ANNOTATION			1: has;										not used
	//										0: has not                           
	//
	//	ANNO_EVENT_REMOTE_DRAW_FINISHED:	not used                                    LOWORD: x position of last drawing point
	//																					HIWORD: y position of last drawing point
	//
	//  ANNO_EVENT_LOCAL_DRAWING_STATE      1: ready to draw or drawing is in progress  not used
    //                                      0: not in drawing mode (mouse mode)
	//
    //	ANNO_EVENT_KEYBOARD_STATE           1: show;									pointer to AnnoBaseKeyboardInfo
	//										0: hide                             
	//
    //	ANNO_EVENT_WB_WINDOW_STATE          see enum AnnoWhiteboardEvent;				pointer or handle of wb window
	//										
	//
	//  ANNO_EVENT_DRAW_CHANGED				not used									not used
	//
	//
	//	ANNO_EVENT_REMOTE_DRAWING_TO_START  not used 									not used 
	//										
	//
    //  ANNO_EVENT_APPLE_STYLUS_DETECTED    not used                                    not used
    //
    //
	//	ANNO_EVENT_ZR_WINDOW_CHANGED		not used									not used
	//
	//
	//	ANNO_EVENT_REQUEST_ANNOTATOR_NAME	appId										not used
	//
	//
	//  ANNO_EVENT_SNAPSHOT_CHANGED			not used									not used
	//
	//
	//	ANNO_EVENT_CONTENT_SAVING_STATE		1: pdf saving start							not used
	//										0: pdf saving end					
	//
	//  ANNO_EVENT_ZR_TAP_DETECTED			not used									not used
	//
	//
	//	ANNO_EVENT_TOOL_STATE_CHANGED		the tool type, in AnnoToolType				the tool state, in AnnoToolState
	virtual int OnAnnoBaseEvent(
		IN	const AnnoEventType eventType, 
		IN	const WPARAM wParam, 
		IN	const LPARAM lParam
		) = 0;
	
	virtual int OnWhiteboardError(uint32_t errorCode)
	{ 
		return 0; 
	}

	//
	// Callback to upper layer to send annotation data to specified remote node
	// @targetId:	node ID of desitination to receive the PDU. 
	//				targetId == 0:	the PDU will be broadcast to all users except itself in current session
	//				otherwise:		the PDU will be sent to the specified node in current session
	// @data:		the annotation data
	// @size:		size of annoataiton data in bytes
	//
	virtual int SendAnnoPdu(
		IN	const NODEID targetId,
		IN	const unsigned char* data,	// observer must not release the memory
		IN	const size_t size
		) = 0;

	virtual int SendWbContent(const AnnoContent* content) 
	{ 
		return 0; 
	}

	virtual int SendWbMonitorInfo(const WbMonitorInfo* info)
	{ 
		return 0; 
	}
	
protected:
	virtual ~AnnoBaseObserver() {}
};

// ----------------------------------------------------------------------------
//	AnnoBase
// ----------------------------------------------------------------------------

class ANNO_DLLEXPORT AnnoBase
{
public:
	//
	// Retrieve this interface by passing into the previously created engine 
	// and increase reference count
	static AnnoBase* GetInterface(
		IN AnnoEngine* annoEngine
		);

	//
	// Release this interface and decrease referenced count
	virtual int Release(
		) = 0;

	//
	// Start an annotation session
	virtual int AnnoStartup(
		IN	const AnnoStartupInput& annoStartupInput,
		IN	const AnnoConfig annoConfig
		) = 0;

	//
	// Shut down the annotation session
	virtual int AnnoShutdown(
		) = 0;

	//
	// Pause the annotation
	virtual int AnnoPause(
		) = 0;

	//
	// Resume the annotation
	virtual int AnnoResume(
		) = 0;

	//
	// Call this method to pass mouse, keyboard, touch events into annotation session
	// Return same as OS value //TODO - kend
	virtual int OnAnnoInput(
		IN	const AnnoInput& annoInput,
		IN OUT bool& handled
		) = 0;
    
    //
    // Call this method to set user name (used by arrow)
	virtual int SetUserName(
        IN const wchar_t* userName		// NULL ended unicode string
        ) = 0;
    
    //
    // Call this method to enable/diable touch input for ios
    // disableTouch = true ------>  Touch input forbidden
    // disabletouch = false ----->  Touch input enabled
    virtual int DisableAnnoTouch(
        IN const bool disableTouch
        ) = 0;
    
    //
    // Call this method to set the canvas color and alpha for drawing
	//	canvasColor	-	the background color for drawing, ignored if canvasAlpha = 0.0f
	//	canvasAlpha -	0.0f - annotation mode; 1.0f - whiteboard mode
	// originalColor	current need to be replace annotates' color
	// targetColor		target color
    virtual int SetAnnoCanvas(
        IN const AnnoColor canvasColor,
        IN const Float32 canvasAlpha,
		IN const AnnoColor originalColor,
		IN const AnnoColor targetColor
        ) = 0;

    //
    // Call this method to retrieve canvas color and alpha settings
    virtual int GetAnnoCanvas(
        OUT	AnnoColor& canvasColor,
        OUT	Float32& canvasAlpha
        ) = 0;

	//
	// Call this method to change the annotation window in case of 
	//	* presenter's sharing area changes due to user moves shared window
	//	* attendee's rendering window changes due to render window resizes or moves
	//
	// For as presenter: 
	//	AnnoWindow.wndDrawing:		NULL
	//	AnnoWindow.rectBounding:	the bounding rectangle that user can draw inside
	//	AnnoWindow.zoomFactor:		always 1.0 (100%)
	// For ds and as attendee:
	//	AnnoWindow.wndDrawing:		the drawing/rendering window
	//	AnnoWindow.rectBounding:	the bounding rectangle related to wndDrawing
	//	AnnoWindow.zoomFactor:		the zooming factor
	virtual int SetAnnoWindow(
		IN	const AnnoWindow& annoWindow
		) = 0;

	virtual int SetAnnoWbWindow(
		IN	const AnnoWindow& annoWindow
		) = 0;

	//
	// Call this method to change the annotation window in case of 
	//	* presenter's sharing area changes due to user moves shared window
	//  * attendee should never call this method, call above method instead.
	// This method is provided to Windows presenter side multiple monitors which support high DPI.
	//  Mac could use this method later if supporting high DPI
	//
	virtual int SetAnnoWindowMultiMonitor(
		IN	const AnnoWindowMultiMonitor& annoWindowMultiMonitor
		) = 0;

	// just for presenter: set the snapshot size info for camra share/ direct share/hdmi share, whitch need the backing store snapshot
	virtual int SetAnnoCaptureSize(
		IN	const AnnoSize& captureSize
		) = 0;

    //
	// Call this method to OVERRIDE the default tool format including line, fill formats.
	// If this method is not called, built-in format will be used
    virtual int SetAnnoToolFormat(
        IN  const AnnoToolType annoToolType,
        IN  const AnnoRect& annoToolRect,         // if non-zero, drawing will be placed in this rectangle or bounded by the size
        IN  const AnnoToolFormat& annoToolFormat
        ) = 0;

	//
	// Call this method to retrieve current tool format for selected tool.
    virtual int GetAnnoToolFormat(
        IN  const AnnoToolType annoToolType,
        OUT AnnoRect& annoToolRect,
        OUT AnnoToolFormat& annoToolFormat
        ) = 0;

	//
	// Call this method to OVERRIDE the cursor resource for annotaiton picker tool.
	// If this method is not called, built-in cursors will be used
	virtual int SetAnnoCursor(
		IN	const AnnoToolType annoToolType, 
		IN	const unsigned long annoToolCursor
		) = 0;

	//
	// Call this method to OVERRIDE the pen, highlighter, arrow, etc color.
	// If this method is not called, built-in colors will be used
	virtual int SetAnnoColor(
		IN	const AnnoColorIndex annoColorIndex,
		IN	const AnnoColor& annoColor 
		) = 0;

	//
	// Call this method to retrieve current annotation color for selected tool. 
	// This method is useful to draw the menu/toolbar icon using current color
	virtual int GetAnnoColor(
		IN	const AnnoColorIndex annoColorIndex,
		OUT	AnnoColor& annoColor
		) = 0;

	//
	// Call this method in responding to user's picking of annotaton tool.
	virtual int SetAnnoTool(
		IN	const AnnoToolType annoToolType
		) = 0;

	//
	// Call this method to retrieve current selected annotation tool. 
	// This method is useful to check/uncheck the toolbar/menu items
	virtual int GetAnnoTool(
		OUT	AnnoToolType& annoToolType
		) = 0;

    //
    // Call this method to retrieve the state of current selected annotation tool.
    virtual int GetAnnoToolState(
        IN	const AnnoToolType annoToolType,
        OUT	AnnoToolState& annoToolState
        ) = 0;

	//
	// Call this method to reset the state of current selected annotation tool
    
     virtual int ConfirmDetectionText(
		IN NODEID recognIndex
		) = 0;
    
	//
	// Call this method to undo a undoable action
	virtual int Undo(
		) = 0;

	//
	// Call this method to redo a redoable action
	virtual int Redo(
		) = 0;

	//
	// Call this method to clear user's annotation
	virtual int EraseUser(
		IN NODEID appId
		) = 0;

	//
	// Call this method to clear all others' annotation except for the appId's
	virtual int EraseOthers(
		IN NODEID appId
		) = 0;

	//
	// Call this method to clear all annotation
	virtual int EraseAll(
		) = 0;

	//
	// Call this method to draw current active annotation page to the GC, 
	// which is usually responding to OnPaint on Windows, or drawRect on Mac
	virtual int DrawAnnoPage(
		IN	const AnnoGc annoGc
		) = 0;

	//
	// Register observer
	virtual int RegisterObserver(
		IN	const AnnoBaseObserver& observer
		) = 0;

	//
	// Deregister observer
    virtual int DeregisterObserver(
		IN	const AnnoBaseObserver& observer
		) = 0;

	//
	// Call this method to set the version of this interface of the remote composition server.
	//	@version:	a number indicating remote annotation component's version
	// 
	virtual int SetRemoteComposerVersion(
		IN	const unsigned long version
		) = 0;

	//
	// Call this method to query capability of this component
	// @version:	the version of annotation module to retrieve capabilities
	// @type:		the type of capabilities to retrieve, defined by ANNOCAPS_TYPE 
	//				enumeration type
	// @info:		a pointer to a buffer that contains data that specifies the 
	//				specific condition on which to retrieve the cap
	// @data:		a pointer to a buffer that is filled with capabilities of the 
	//				type that is specified by the Type
	// @size:		the size, in bytes, of the buffer at data
	virtual int GetCaps(
		IN	const unsigned long version,
		IN	const AnnoCapsType type,
		IN	const void* info,
		IN	void* data,
		IN OUT const size_t size
		) = 0;

	//
	// Call this method to last error code
    virtual int LastError(
		) = 0;

	//
	// Call this method to pass remote annotation data into this session
	virtual int OnAnnoPduReceived(
		IN	const unsigned char* data,	// caller must release the memory
		IN	const size_t size
		) = 0;

	// 3.6 - April 2015
	//
	// Call this method to create a new whiteboard
	virtual int NewWhiteboard(
		IN	const AnnoStartupInput& annoStartupInput,
		IN	const WbConfig& wbConfig
		) = 0;

	//	// Call this method to close the current whiteboard
	virtual int CloseWhiteboard(
		) = 0;

	// Call this method to load image file to current whiteboard page
	virtual int OpenLocalFile(
		IN const wchar_t* filePath
		) = 0;

	//
	// Call this method to save current snapshot of shared region to file or memory
	// @saveInfo:		all save information
	//
    virtual int SaveAnnotation(
        IN  const void* pSaveInfo
        ) = 0;


#if ANNO_SDK_TEST_SCENARIOS
    //
    // Call this method to test when another client creates a connector.
    //
    virtual void TestScenario(AnnoScenarioTest annoScenario) = 0;
#endif

    //
    // Call this method to load bitmaps to the annotate
    // @bitmapList:		all bitmaps list.
    // 
    virtual int LoadBitmapList(
        IN  const void* pList
        ) = 0;

	//
	// Call this method to set whiteboard window frame for zoomroom
	// @x:	left pos of window
	// @y:	right pos of window
	// @cx:	width of window
	// @xy:	height of window
	virtual int SetWBWindowFrame( //int x, int y, int cx, int cy
		IN const int x,
		IN const int y,
		IN const int cx,
		IN const int cy
		) = 0;

	//
	//Call this method to show/hide annotator name 
	//
	virtual int SetShowAnnotatorName(
		IN	bool bShow
		) = 0;

	//
	// Call this method to set annotator name
	//
	virtual int SetAnnotatorName(
		IN const NODEID userId,
		IN const wchar_t* userName		// NULL ended unicode string
		) = 0;

	//
	// Call this method to create new page for whiteboard
	//
	virtual int NewPage(
		) = 0;

	//
	// Call this method to close page for whiteboard
	// @userId:	page id of window
	//
	virtual int ClosePage(
		IN const NODEID pageId	
		) = 0;

	//
	// Call this method to switch to previous page for whiteboard
	//
	virtual int PrevPage(
		) = 0;

	//
	// Call this method to switch to next page for whiteboard
	//
	virtual int NextPage(
		) = 0;
		
	//
	// Call this method to switch whiteborad page
	// 
	virtual int SwitchPage(
		IN const NODEID pageId
		) = 0;

	//
	// Call this method to get page bitmap for pageId
	// @index:	 page index
	// @data:	 bitmap pointer
	// @pageId:	 page id of page
	// @bgColor: blackground color of page
	virtual int GetPageSnapshot(
		IN const unsigned int index, 
		OUT void* bitmap,
		OUT NODEID& pageId, 
		OUT AnnoColor& bgColor
		) = 0;

	// Call this method to get bitmapInfo
	// @bmInfo: bitmapInfo
	virtual int GetAnnoBitmapInfo(
		OUT AnnoBitmapInfo& bmInfo
		) = 0;

	// Call this method to get the latest snapshot bitmap data pointer
	// @bmData: pointer to location of snapshot bitmap bit values
	virtual int GetAnnoBitmapData(
		OUT UInt8** bmData
		) = 0;

	// Call this method to synch attendee annoter page info 
	// 
	virtual int SynchPageInfo(
		) = 0;
	
	// Call this method to set new AppId
	virtual int AmendAppId( 
		NODEID appId
		) = 0;

	// Call this method to set translate text
	virtual void SetTranslateText(
		IN const void* translateInfo
		) = 0;

    virtual int ConfigGesture(
        IN bool enableGesture
        ) = 0;
		
	virtual void SetAndroidJni(
		IN const void* androidJniInfo
	) = 0;

	virtual int ReceiveRTPPacket(
		IN const unsigned char* data, 
		IN unsigned int dataLen,
		IN unsigned int recvTimeMs
		) = 0;

	virtual int ReceivedPagePackageRsp(
		IN const void* packageRsp
		) = 0;

	virtual int ReceivedImageData(
		IN void* data
		) = 0;

	virtual int OpenCloudWhiteboard(
		IN const AnnoStartupInput& annoStartupInput, 
		IN const CloudWBConfig& cloud_wb_config
		) = 0;

	virtual int CloseCloudWhiteboard(
		) = 0;
    
	virtual int SetCloudWbInfo(
		IN const void* wbInfo
		) = 0;

    virtual int StartWbCapture(
        ) = 0;
    
    virtual int StopWbCapture(
        ) = 0;
	
	virtual int RespondWbAsyncReq(
		IN const void* response
		) = 0;

	virtual int SaveCloudWhiteboard(
		IN const void* pSaveInfo
		) = 0;

	virtual int SetShareSheetVisible(
		IN bool bDisable
		) = 0;

	virtual int SetExportDisable(
		IN bool bDisable
		) = 0;


};

#endif // __ANNO_BASE_H__
