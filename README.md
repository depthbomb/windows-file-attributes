# windows-file-attributes

A pure TypeScript library for setting and reading file attributes on Windows.

## Features

- Reading attributes of a file
- Adding attributes to a file
- Checking if a file has one or more attributes
- No dependencies
- Written entirely in TypeScript
- Great with Electron!

## Installation

```sh
npm i windows-file-attributes

# or

yarn add windows-file-attributes
```

## Some examples

```ts
import { hasAttribute, FileAttribute } from 'windows-file-attributes';

const isReadOnly = await hasAttribute('./file.txt', FileAttribute.READONLY);
console.log(isReadOnly); // boolean
```


```ts
import { getAttributeNames } from 'windows-file-attributes';

const names = await getAttributeNames('./file.txt');
console.log(names); // [READONLY, COMPRESSED, ARCHIVE]
```

```ts
import { setAttributes, FileAttribute } from 'windows-file-attributes';

await setAttributes('./file.txt', [FileAttribute.HIDDEN]);
```

Consult the TSDoc for each function for more info.
