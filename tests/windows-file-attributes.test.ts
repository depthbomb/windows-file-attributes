import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
	getRawAttributes,
	getAttributes,
	getAttributeNames,
	setAttributes,
	addAttributes,
	removeAttributes,
	hasAttributes,
	hasAttribute,
	FileAttribute
} from '../dist';

describe('windows-file-attributes', () => {
	const testFilePath = join(tmpdir(), `._test-file-${Date.now()}.txt`);

	beforeEach(() => {
		fs.writeFileSync(testFilePath, 'Test content', 'utf-8');

		try {
			require('child_process').execSync(`attrib -R -H -S -A "${testFilePath}"`);
		} catch (error) {
			console.warn('Could not reset file attributes:', error);
		}
	});

	afterEach(() => {
		try {
			require('child_process').execSync(`attrib -R "${testFilePath}"`);
			if (fs.existsSync(testFilePath)) {
				fs.unlinkSync(testFilePath);
			}
		} catch (error) {
			console.warn('Cleanup error:', error);
		}
	});

	describe('getRawAttributes', () => {
		it('should return the raw numeric value of file attributes', async () => {
			await setAttributes(testFilePath, [FileAttribute.ARCHIVE, FileAttribute.READONLY]);

			const result = await getRawAttributes(testFilePath);

			expect(result).toBe(33);
		});
	});

	describe('getAttributes', () => {
		it('should return an array of file attribute enums', async () => {
			await setAttributes(testFilePath, [FileAttribute.ARCHIVE, FileAttribute.HIDDEN]);

			const result = await getAttributes(testFilePath);
			expect(result).toContain(FileAttribute.ARCHIVE);
			expect(result).toContain(FileAttribute.HIDDEN);
		});
	});

	describe('getAttributeNames', () => {
		it('should return an array of attribute names', async () => {
			await setAttributes(testFilePath, [FileAttribute.ARCHIVE, FileAttribute.READONLY]);

			const result = await getAttributeNames(testFilePath);
			expect(result).toContain('ARCHIVE');
			expect(result).toContain('READONLY');
		});
	});

	describe('setAttributes', () => {
		it('should set the specified attributes', async () => {
			await setAttributes(testFilePath, [
				FileAttribute.HIDDEN,
				FileAttribute.READONLY
			]);

			const attributes = await getAttributes(testFilePath);
			expect(attributes).toContain(FileAttribute.HIDDEN);
			expect(attributes).toContain(FileAttribute.READONLY);

			expect(attributes).not.toContain(FileAttribute.ARCHIVE);
		});
	});

	describe('addAttributes', () => {
		it('should add attributes to existing ones', async () => {
			await setAttributes(testFilePath, [FileAttribute.ARCHIVE]);
			await addAttributes(testFilePath, [FileAttribute.HIDDEN]);

			const attributes = await getAttributes(testFilePath);
			expect(attributes).toContain(FileAttribute.ARCHIVE);
			expect(attributes).toContain(FileAttribute.HIDDEN);
		});
	});

	describe('removeAttributes', () => {
		it('should remove specified attributes', async () => {
			await setAttributes(testFilePath, [
				FileAttribute.ARCHIVE,
				FileAttribute.HIDDEN,
				FileAttribute.READONLY
			]);

			await removeAttributes(testFilePath, [FileAttribute.HIDDEN]);

			const attributes = await getAttributes(testFilePath);
			expect(attributes).toContain(FileAttribute.ARCHIVE);
			expect(attributes).toContain(FileAttribute.READONLY);
			expect(attributes).not.toContain(FileAttribute.HIDDEN);
		});
	});

	describe('hasAttributes', () => {
		it('should return true when file has all specified attributes', async () => {
			await setAttributes(testFilePath, [
				FileAttribute.ARCHIVE,
				FileAttribute.HIDDEN,
				FileAttribute.READONLY
			]);

			const result = await hasAttributes(testFilePath, [
				FileAttribute.ARCHIVE,
				FileAttribute.HIDDEN
			]);

			expect(result).toBe(true);
		});

		it('should return false when file is missing some attributes', async () => {
			await setAttributes(testFilePath, [FileAttribute.ARCHIVE]);

			const result = await hasAttributes(testFilePath, [
				FileAttribute.ARCHIVE,
				FileAttribute.HIDDEN
			]);

			expect(result).toBe(false);
		});
	});

	describe('hasAttribute', () => {
		it('should return true when file has the specified attribute', async () => {
			await setAttributes(testFilePath, [FileAttribute.ARCHIVE]);

			const result = await hasAttribute(testFilePath, FileAttribute.ARCHIVE);
			expect(result).toBe(true);
		});

		it('should return false when file does not have the specified attribute', async () => {
			await setAttributes(testFilePath, [FileAttribute.ARCHIVE]);

			const result = await hasAttribute(testFilePath, FileAttribute.HIDDEN);
			expect(result).toBe(false);
		});
	});
});
