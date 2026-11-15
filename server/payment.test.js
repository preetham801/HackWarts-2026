import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import test from 'node:test'
import { verifyPaymentSignature } from './payment.js'

const secret = 'test-secret'
const orderId = 'order_test123'
const paymentId = 'pay_test123'
const signature = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')

test('accepts a valid Razorpay payment signature', () => {
  assert.equal(verifyPaymentSignature({ orderId, paymentId, signature, secret }), true)
})

test('rejects a signature for a different payment', () => {
  assert.equal(verifyPaymentSignature({ orderId, paymentId: 'pay_other', signature, secret }), false)
})

test('rejects a signature with an invalid length', () => {
  assert.equal(verifyPaymentSignature({ orderId, paymentId, signature: 'abc', secret }), false)
})
