export default function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-gray-100 bg-opacity-80 p-4 mt-auto backdrop-blur-sm">
            <div className="container mx-auto text-center text-sm text-gray-600">
                &copy; {currentYear} Ahvaan Telecom. All rights reserved.
            </div>
        </footer>
    );
}