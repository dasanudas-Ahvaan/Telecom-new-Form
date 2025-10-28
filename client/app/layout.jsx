import './globals.css'; // Your global styles (Tailwind is usually imported here)
import Navbar from './components/Navbar'; // Import Navbar
import Footer from './components/Footer'; // Import Footer

// Updated metadata
export const metadata = {
  title: 'Ahvaan Telecom Registration',
  description: 'Online registration system for Ahvaan Telecom',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Apply background and flex column layout to the body */}
      <body className="bg-[url('/logos/background.jpg')] bg-cover bg-fixed bg-center min-h-screen flex flex-col">
        <Navbar /> {/* Navbar at the top */}

        {/* Main content area that grows to push footer down */}
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          {children} {/* Page content renders here */}
        </main>

        <Footer /> {/* Footer at the bottom */}
      </body>
    </html>
  );
}