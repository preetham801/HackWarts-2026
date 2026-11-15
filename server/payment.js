import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyPaymentSignature({ orderId, paymentId, signature, secret }) {
  const expected = createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest()

  let actual
  try {
    actual = Buffer.from(signature, 'hex')
  } catch {
    return false
  }

  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
