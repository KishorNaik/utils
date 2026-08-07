import { test } from 'node:test';
import assert from 'node:assert';

const angularCoreVersion = require('@angular/core/package.json').version;

function parseVersion(version: string): number[] {
	return version.split('.').map((part) => Number.parseInt(part, 10));
}

function compareVersions(left: number[], right: number[]): number {
	for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
		const leftPart = left[index] ?? 0;
		const rightPart = right[index] ?? 0;

		if (leftPart > rightPart) return 1;
		if (leftPart < rightPart) return -1;
	}

	return 0;
}

test('Angular core should be patched to a non-vulnerable release', () => {
	assert.ok(
		compareVersions(parseVersion(angularCoreVersion), parseVersion('19.2.26')) >= 0,
		`Expected @angular/core >= 19.2.26 but found ${angularCoreVersion}`
	);
});
