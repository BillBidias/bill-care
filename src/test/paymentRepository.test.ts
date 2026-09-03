import { describe, expect, it } from "vitest";
import { isTrustedStripeCheckoutUrl } from "@/data/paymentRepository";

describe("Stripe checkout redirect trust boundary", () => {
  it("accepts the canonical Stripe-hosted Checkout URL", () => {
    expect(isTrustedStripeCheckoutUrl("https://checkout.stripe.com/c/pay/cs_test_123#fidkdWxOYHwnPyd1blppbHNgWjA0SDxv"))
      .toBe(true);
  });

  it.each([
    "http://checkout.stripe.com/c/pay/cs_test_123",
    "https://evilstripe.com/c/pay/cs_test_123",
    "https://checkout.stripe.com.evil.example/c/pay/cs_test_123",
    "https://stripe.com/c/pay/cs_test_123",
    "https://sub.checkout.stripe.com/c/pay/cs_test_123",
    "https://checkout.stripe.com:444/c/pay/cs_test_123",
    "https://user:pass@checkout.stripe.com/c/pay/cs_test_123",
    "not-a-url",
  ])("rejects untrusted redirect URL %s", (url) => {
    expect(isTrustedStripeCheckoutUrl(url)).toBe(false);
  });
});
