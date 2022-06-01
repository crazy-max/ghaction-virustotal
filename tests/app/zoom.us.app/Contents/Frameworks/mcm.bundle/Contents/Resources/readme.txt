====================================================================================
  AMR Wideband Codec 3GPP TS26.173 / ITU-T G.722.2, Mar 20, 2007. Version 7.0.0, 8.0.0 and 9.0.0			
====================================================================================

These files represent the 3GPP/ITU AMR WB Speech Coder Bit-Exact C simulation.  
All code is written in ANSI-C.  The system is implemented as two separate 
programs:

        coder     Speech Encoder
        decoder   Speech Decoder
	
For encoding using the coder program, the input is a binary
speech file (*.inp) and the output is a binary encoded parameter file
(*.cod).  For decoding using the decoder program, the input is a binary
parameter file (*.cod) and the output is a binary synthesized speech
file (*.out).  

                            FILE FORMATS:
                            =============

The file format of the supplied binary data (*.inp, *.cod, *.out)
is 16-bit binary data which is read and written in 16 bit words.  
The data is therefore platform DEPENDENT.  
The files contain only data, i.e., there is no header.
The test files included in this package are "PC" format, meaning that the
least signification byte of the 16-bit word comes first in the files.

If the software is to be run on some other platform than PC,
such as an HP (HP-UX) or a Sun, then binary files will need to be modified
by swapping the byte order in the files.

The input (*.inp) and output files (*.out) are 16-bit signed binary files with 16 kHz
sampling rate with no headers.

The Speech Encoder produces bitstream files which are as follows:

For every 20 ms input speech frame, the encoded bitstream using default format
or ITU format contains the following data:

Using default format:

	Word16 TXRXFLAG
	Word16 FrameType
	Word16 Mode
	Word16 1st Databit
	Word16 2nd DataBit
	.
	.
	.
	Word16 Nth DataBit
	
Using ITU format:	

	Word16 SyncWord
	Word16 DataLen
	Word16 1st Databit
	Word16 2nd DataBit
	.
	.
	.
	Word16 Nth DataBit

where the TXRXFLAG tells whether the frame is input from the speech encoder or
from the output of the channel decoder.
For Speech encoder the Flag is 0x6B21 and for channel decoder the flag is 0x6B20

The frametype tells whether the frame is speech, SID_FIRST, SID_UPDATE etc.
The frame types are the same than used in the existing ETSI AMR narrow band codec.
For more details on these frametype, refer to the AMR NB documentation.

The mode can be from 0 to 8, corresponding bit rated from 6.6 kbit/s to 23.85 kbit/s.
Finally, there is N databits where the N is the number of bits per frame for each 
mode. So for 6.6 kbit/s mode, there are 132 databits.
Each bit is presented in the default format as follows: Bit 0 = -127, Bit 1 = 127.
end in the ITU format as follows: Bit 0 = 0x007f, Bit 1 = 0x0081.

The SyncWord from the encoder is always 0x6b21. If decoder receives SyncWord as 0x6b20
it indicates that the current frame was received in error (bad frame).

The DataLen parameter gives the number of speech data bits in the frame. For example using
dxt, DataLen for NO_DATA frames is zero, Each bit is presented as follows: Bit 0 = -127, Bit 1 = 127.

When using the MIME file storage format the encoded bitstream file starts with
9-byte magic number "#!AMR-WB\n", followed by the following data for each 20 ms
input speech frame

	UWord8 Frame header
	UWord8 1st speech data octet
	.
	.
	.
	UWord8 Nth speech data octet

where the frame header includes mode information and the quality bit, and the
speech data octets contain the packed and sorted encoded speech bits. See RFC3267
(sections 5.1 and 5.3) for the details of this format. 

			INSTALLING THE SOFTWARE
			=======================

Installing the software on the PC:

First unpack the testv.zip and the c-code.zip into your directory. After that you 
should have the following structure:

<your_dir>
	<testv>
		*.bat
		*.inp
		*.cod
		*.out
	<c-code>
		makefile.gcc
		*.c
		*.h
		*.tab
	
	readme.txt


The package include makefile for gcc, which have been tested with gcc in 
Windows NT msdos-box. 

The code can be compiled in the dos-prompt by entering the directory c-code
and typing the command: make -f makefile.gcc (assuming you have gcc installed)

It is probably quite straightforward to use the same make file with other 
systems having gcc or a standard ANSI-C compiler with only small modifications.

The codec has been also successfully compiled with the 
Microsoft Visual C++ version 6.0.

                       RUNNING THE SOFTWARE
                       ====================

The usage of the "coder" program is as follows:

   Usage:

   coder  [-dtx] [-itu | -mime] <mode> <speech_file>  <bitstream_file>

The DTX is activated by typing the optional switch "-dtx". By default, the DTX is not active.
The ITU bit stream format is activated by typing the optional switch "-itu".
Alternatively, the MIME file storage format output can be activated by using
optional switch "-mime". By default, neither the ITU nor the MIME format is active.
The mode is from 0 to 8 correspond the following bit-rates:
0 = 6.6 kbit/s, 1 = 8.85 kbit/s, 2 = 12.65 kbit/s, 3 = 14.25 kbit/s, 4 = 15.85 kbit/s
5 = 18.25 kbit/s, 6 = 19.85 kbit/s, 7 = 23.05 kbit/s, 8 = 23.85 kbit/s


The usage of the "decoder" program is as follows:

   Usage:

   decoder  [-itu | -mime] <bitstream_file>  <synth_file>
   
The ITU bit stream format is activated by typing the optional switch "-itu".
Alternatively, the MIME file storage format can be activated by using the
switch "-mime". By default, neither the ITU nor the MIME format is active.



                       TESTING THE SOFTWARE
                       ====================

There are two verification scripts for PC:

	test_enc.bat for Speech Encoder 
	test_dec.bat for Speech Decoder

Both test all the 9 speech codec modes with DTX enabled using the default bitstream format.
The compare commands at the end of this file should yield no differences.



