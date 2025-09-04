import * as fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { it, expect, describe, afterEach, beforeEach } from 'vitest';
import { hasAttribute, FileAttribute, setAttributes, getRawAttributes } from '../dist';

describe('path quoting and escaping', () => {
	const testFilePath = join(tmpdir(), `o'neil-test-${Date.now()}.txt`);

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

	it("should handle paths that contain single quotes when setting and getting attributes", async () => {
		await setAttributes(testFilePath, [FileAttribute.ARCHIVE, FileAttribute.READONLY]);

		const raw = await getRawAttributes(testFilePath);
		expect(raw).toBeGreaterThan(0);

		const has = await hasAttribute(testFilePath, FileAttribute.READONLY);
		expect(has).toBe(true);
	});
});
