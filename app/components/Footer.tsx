import Link from 'next/link'
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-[#22c55e] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-semibold mb-5">About Us</h3>
            <p className="text-white/90 leading-relaxed">
              Using advanced AI technology, we help you identify and
              learn about any plant instantly. Perfect for gardeners,
              botanists, and plant enthusiasts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-5">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/90 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="border-b border-transparent hover:border-white pb-1">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/90 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="border-b border-transparent hover:border-white pb-1">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/90 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="border-b border-transparent hover:border-white pb-1">Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/90 hover:text-white transition-colors duration-300 flex items-center">
                  <span className="border-b border-transparent hover:border-white pb-1">Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-5">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-white/90">
                <FaEnvelope className="mr-3 text-white/80" />
                <span>plantidentifier@gmail.com</span>
              </li>
              <li className="flex items-center text-white/90">
                <FaPhone className="mr-3 text-white/80" />
                <span>(+91) 8849297987</span>
              </li>
              <li className="flex items-center text-white/90">
                <FaMapMarkerAlt className="mr-3 text-white/80" />
                <span>Garden City</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 text-center">
          <p className="text-white/90">© {new Date().getFullYear()} Plant Identifier. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer