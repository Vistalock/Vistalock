'use client';

import Link from 'next/link';
import { Shield, Check, Lock, Smartphone, TrendingUp, Users, BarChart3, Zap, CreditCard, Bell } from 'lucide-react';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                VISTALOCK
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-gray-900 font-medium">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium">
                Pricing
              </Link>
              <Link href="/register" className="text-gray-700 hover:text-gray-900 font-medium">
                Become a Merchant
              </Link>
              <Link
                href="/login"
                className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors font-medium"
              >
                Merchant Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div>
            <div className="inline-flex items-center space-x-2 text-emerald-600 mb-6">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Secure Device Control</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Sell Devices.
              <br />
              Get <span className="bg-emerald-50 text-emerald-600 px-2">Paid</span>.
              <br />
              Stay in Control.
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              The complete BNPL & Device Locking platform for Nigerian merchants.
              Automate repayments, secure your inventory, and build credit for your customers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/register"
                className="bg-emerald-600 text-white px-8 py-4 rounded-md hover:bg-emerald-700 transition-colors font-semibold text-center"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="bg-white text-gray-900 px-8 py-4 rounded-md hover:bg-gray-50 transition-colors font-semibold border-2 border-gray-200 text-center"
              >
                Sign In
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-emerald-600" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-emerald-600" />
                <span>Free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-emerald-600" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>

          {/* Right Column - Phone Mockup */}
          <div className="relative flex justify-center">
            <MobileDeviceMockup />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-emerald-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-emerald-100">Active Merchants</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-emerald-100">Devices Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">₦2B+</div>
              <div className="text-emerald-100">Loans Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-emerald-100">Recovery Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How VistaLock Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and automated device financing in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Register Device</h3>
              <p className="text-gray-600">
                Add the device to VistaLock platform and set payment terms. Install our secure agent app on the device.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Customer Pays</h3>
              <p className="text-gray-600">
                Customer makes installment payments. System automatically tracks and sends reminders for upcoming payments.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Auto Lock/Unlock</h3>
              <p className="text-gray-600">
                Device locks automatically if payment is missed. Unlocks instantly when customer pays. No manual intervention needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Your Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage device financing, from locking to analytics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Remote Device Locking</h3>
              <p className="text-gray-600 mb-4">
                Automatically lock devices when payments are missed. Set grace periods and escalation stages for fair enforcement.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Instant remote locking</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Customizable grace periods</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Auto-unlock on payment</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Notifications</h3>
              <p className="text-gray-600 mb-4">
                Automated SMS and in-app reminders keep customers informed about upcoming payments and due dates.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Payment reminders</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Overdue alerts</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Payment confirmations</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Agent Management</h3>
              <p className="text-gray-600 mb-4">
                Invite field agents, set onboarding limits, and track their performance across multiple locations.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Invite unlimited agents</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Set daily limits</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Performance tracking</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Analytics</h3>
              <p className="text-gray-600 mb-4">
                Monitor all loans, payments, and device status in real-time with comprehensive dashboards and reports.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Revenue tracking</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Device utilization</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Export reports (CSV)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Payment Plans</h3>
              <p className="text-gray-600 mb-4">
                Create custom payment schedules with flexible terms, interest rates, and down payment options.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Custom schedules</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Multiple payment methods</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Early payment discounts</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Customer Portal</h3>
              <p className="text-gray-600 mb-4">
                Customers can view their loan details, payment history, and make payments through a dedicated portal.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Self-service payments</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Payment history</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Loan statements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">Free</div>
              <p className="text-gray-600 mb-6">Perfect for trying out VistaLock</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                  <span className="text-gray-700">Up to 10 devices</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                  <span className="text-gray-700">2 agents</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                  <span className="text-gray-700">Basic analytics</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors font-semibold text-center"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-emerald-600 text-white rounded-lg p-8 relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <h3 className="text-xl font-bold mb-2">Growth</h3>
              <div className="text-3xl font-bold mb-4">₦50,000<span className="text-lg font-normal">/mo</span></div>
              <p className="text-emerald-100 mb-6">For growing businesses</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span>Up to 100 devices</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span>Unlimited agents</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full bg-white text-emerald-600 px-6 py-3 rounded-md hover:bg-gray-100 transition-colors font-semibold text-center"
              >
                Start Free Trial
              </Link>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">Custom</div>
              <p className="text-gray-600 mb-6">For large-scale operations</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                  <span className="text-gray-700">Unlimited devices</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                  <span className="text-gray-700">Unlimited agents</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                  <span className="text-gray-700">Custom integrations</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                  <span className="text-gray-700">Dedicated support</span>
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors font-semibold text-center"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Selling with Confidence?
          </h2>
          <p className="text-emerald-100 text-lg mb-8">
            Join hundreds of merchants using VistaLock to grow their business and reduce defaults
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-block bg-white text-emerald-600 px-8 py-4 rounded-md hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="inline-block bg-emerald-700 text-white px-8 py-4 rounded-md hover:bg-emerald-800 transition-colors font-semibold text-lg border-2 border-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">VISTALOCK</h3>
              <p className="text-sm">
                Secure device financing platform for Nigerian merchants. Automate repayments and reduce defaults.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/register" className="hover:text-white">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register" className="hover:text-white">Become a Merchant</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                <li><Link href="#" className="hover:text-white">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>support@vistalock.com</li>
                <li>+234 800 VISTA</li>
                <li className="pt-2">
                  <Link href="#" className="hover:text-white">Help Center</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 VistaLock. All rights reserved. Empowering Nigerian merchants with secure device financing.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
