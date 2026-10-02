/**
 * PublicLayout — wraps all public pages with Navbar + Footer.
 * Adds top-padding to account for fixed navbar (h-16).
 */

import Navbar from '../components/shared/Navbar'
import Footer from '../components/shared/Footer'

const PublicLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-16">
      {children}
    </main>
    <Footer />
  </div>
)

export default PublicLayout
