import test from 'node:test';
import assert from 'node:assert/strict';

import { buildRegistrationQrCode, getRegistrationTypeLabel } from './registration.ts';

test('resident QR code is distinct from vendor QR code', () => {
  const residentQr = buildRegistrationQrCode('resident', 'R-1001');
  const vendorQr = buildRegistrationQrCode('vendor', 'V-2001');

  assert.equal(getRegistrationTypeLabel('resident'), 'Resident');
  assert.equal(getRegistrationTypeLabel('vendor'), 'Vendor');
  assert.match(residentQr, /^RESIDENT:/);
  assert.match(vendorQr, /^VENDOR:/);
  assert.notEqual(residentQr, vendorQr);
});
