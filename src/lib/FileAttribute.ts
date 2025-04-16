export enum FileAttribute {
	READONLY            = 0x1,
	HIDDEN              = 0x2,
	SYSTEM              = 0x4,
	DIRECTORY           = 0x10,
	ARCHIVE             = 0x20,
	NORMAL              = 0x80,
	TEMPORARY           = 0x100,
	COMPRESSED          = 0x800,
	NOT_CONTENT_INDEXED = 0x2000,
	ENCRYPTED           = 0x4000,
}
