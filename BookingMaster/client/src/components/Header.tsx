import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/booking" className="text-2xl font-semibold text-primary-600 hover:text-primary-700">
              Тетрика
            </Link>
          </div>
          <div className="flex">
            <Link href="/admin" className="text-neutral-700 hover:text-primary-500 text-sm">
              Панель администратора
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
