import { promisify } from 'node:util';
import { FileAttribute } from './FileAttribute';
import { exec as execSync } from 'node:child_process';

const exec = promisify(execSync);

const writableAttributes = [FileAttribute.ARCHIVE, FileAttribute.HIDDEN, FileAttribute.NORMAL, FileAttribute.READONLY, FileAttribute.SYSTEM] as const;

type WritableAttributes = typeof writableAttributes[number];

function getAttributesFromNumeric(numericAttributes: number): FileAttribute[] {
	const result: FileAttribute[] = [];

	for (const [,value] of Object.entries(FileAttribute)) {
		if (typeof value !== 'number') {
			continue;
		}

		if ((numericAttributes & value) === value) {
			result.push(value);
		}
	}

	return result;
}

function getAttributeNamesFromNumeric(numericAttributes: number): string[] {
	const result: string[] = [];

	for (const [name, value] of Object.entries(FileAttribute)) {
		if (typeof value !== 'number') {
			continue;
		}

		if ((numericAttributes & value) === value) {
			result.push(name);
		}
	}

	return result;
}

/**
 * Returns the raw numeric value of the file {@link path}'s attributes.
 *
 * @param path The file path to get attributes of
 */
export async function getRawAttributes(path: string): Promise<number> {
	try {
		const { stdout } = await exec(`powershell -command "(Get-Item -Path '${path}' -Force).Attributes.value__"`);

		return parseInt(stdout.trim(), 10);
	} catch (error) {
		throw new Error(`Failed to get file attributes: ${error}`);
	}
}

/**
 * Returns the numeric value of each of the file {@link path}'s attributes.
 *
 * @param path The file path to get attributes of
 */
export async function getAttributes(path: string): Promise<FileAttribute[]> {
	const numericAttributes = await getRawAttributes(path);

	return getAttributesFromNumeric(numericAttributes);
}

/**
 * Returns the name of each of the file {@link path}'s attributes.
 *
 * @param path The file path to get attribute names of
 */
export async function getAttributeNames(path: string): Promise<string[]> {
	const numericAttributes = await getRawAttributes(path);

	return getAttributeNamesFromNumeric(numericAttributes);
}

/**
 * Applies all of the provided {@link attributes} to the file {@link path}.
 *
 * Only the following attributes may be applied to files: `ARCHIVE`, `HIDDEN`, `NORMAL`, `READONLY`, `SYSTEM`
 *
 * @param path The file path to apply attributes to
 * @param attributes An array of attributes to apply to the file path
 */
export async function setAttributes(path: string, attributes: WritableAttributes[]): Promise<void> {
	const numericValue = attributes.reduce((acc, attr) => acc | attr, 0);

	try {
		await exec(`powershell -command "Set-ItemProperty -Path '${path}' -Name Attributes -Value ${numericValue}"`);
	} catch (error) {
		throw new Error(`Failed to set file attributes: ${error}`);
	}
}

/**
 * Adds the provided {@link attributes} to the file {@link path}.
 *
 * @param path The file path to add attributes to
 * @param attributes An array of attributes to add to the file path
 */
export async function addAttributes(path: string, attributes: WritableAttributes[]): Promise<void> {
	try {
		const currentAttributes = await getRawAttributes(path);
		const numericToAdd      = attributes.reduce((acc, attr) => acc | attr, 0);
		const newAttributes     = currentAttributes | numericToAdd;

		await exec(`powershell -command "Set-ItemProperty -Path '${path}' -Name Attributes -Value ${newAttributes}"`);
	} catch (error) {
		throw new Error(`Failed to add file attributes: ${error}`);
	}
}

/**
 * Removes the provided {@link attributes} from the file {@link path}.
 *
 * @param path The file path to remove attributes from
 * @param attributes An array of attributes to remove from the file path
 */
export async function removeAttributes(path: string, attributes: WritableAttributes[]): Promise<void> {
	try {
		const currentAttributes = await getRawAttributes(path);
		const numericToRemove   = attributes.reduce((acc, attr) => acc | attr, 0);
		const newAttributes     = currentAttributes & ~numericToRemove;

		await exec(`powershell -command "Set-ItemProperty -Path '${path}' -Name Attributes -Value ${newAttributes}"`);
	} catch (error) {
		throw new Error(`Failed to remove file attributes: ${error}`);
	}
}

/**
 * Returns `true` if the file {@link path} has *all* of the provided {@link attributes}, `false` otherwise.
 *
 * @param path The file path to check attributes of
 * @param attributes An array of attributes to check the file path for
 */
export async function hasAttributes(path: string, attributes: FileAttribute[]): Promise<boolean> {
	try {
		const currentAttributes = await getRawAttributes(path);
		const numericToCheck    = attributes.reduce((acc, attr) => acc | attr, 0);

		return (currentAttributes & numericToCheck) === numericToCheck;
	} catch (error) {
		throw new Error(`Failed to check file attributes: ${error}`);
	}
}

/**
 * Returns `true` if the file {@link path} has the provided {@link attribute}, `false` otherwise.
 *
 * @param path The file path to check an attribute of
 * @param attribute The attribute to check the file path for
 */
export async function hasAttribute(path: string, attribute: FileAttribute): Promise<boolean> {
	try {
		const currentAttributes = await getRawAttributes(path);

		return (currentAttributes & attribute) === attribute;
	} catch (error) {
		throw new Error(`Failed to check file attributes: ${error}`);
	}
}
