import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      {/* 1. Changed 'bg-amber-50' to 'bg-transparent' to let the global CSS background show through.
        2. Keep the height calculation so the page remains full screen.
      */}
      <main className="bg-transparent h-[calc(100vh)]"> 
        {children}
      </main>
    </>
  );
}