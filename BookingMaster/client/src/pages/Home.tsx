import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, GraduationCap, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Бронирование занятий с лучшими репетиторами
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Быстрое и простое бронирование занятий с квалифицированными преподавателями
          по различным предметам без регистрации и авторизации
        </p>
        <Link href="/booking">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-6 text-lg">
            Забронировать занятие
          </Button>
        </Link>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-center mb-4">
            <Users className="h-12 w-12 text-primary-500" />
          </div>
          <h3 className="text-lg font-semibold text-center mb-2">Опытные преподаватели</h3>
          <p className="text-gray-600 text-center">
            Преподаватели с многолетним опытом работы и высокими рейтингами
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-primary-500" />
          </div>
          <h3 className="text-lg font-semibold text-center mb-2">Разные предметы</h3>
          <p className="text-gray-600 text-center">
            Математика, физика, химия, биология, история, языки и многое другое
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-center mb-4">
            <Calendar className="h-12 w-12 text-primary-500" />
          </div>
          <h3 className="text-lg font-semibold text-center mb-2">Гибкое расписание</h3>
          <p className="text-gray-600 text-center">
            Выбирайте удобное время для занятий в любой день недели
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-center mb-4">
            <Clock className="h-12 w-12 text-primary-500" />
          </div>
          <h3 className="text-lg font-semibold text-center mb-2">Быстрое бронирование</h3>
          <p className="text-gray-600 text-center">
            Простая система бронирования без необходимости регистрации
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-primary-800 mb-4">
          Готовы начать обучение?
        </h2>
        <p className="text-primary-700 mb-6 max-w-2xl mx-auto">
          Выберите преподавателя, время занятия и заполните короткую форму.
          Мы подтвердим ваше бронирование и свяжемся с вами!
        </p>
        <Link href="/booking">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">
            Забронировать занятие сейчас
          </Button>
        </Link>
      </div>
    </div>
  );
}
