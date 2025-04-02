import { v4 as uuidv4 } from 'uuid';
import {
  Teacher, InsertTeacher, 
  TimeSlot, InsertTimeSlot,
  Booking, InsertBooking
} from '@shared/schema';

export interface IStorage {
  // Teachers
  getTeachers(): Promise<Teacher[]>;
  getTeacherById(id: number): Promise<Teacher | undefined>;
  
  // TimeSlots
  getTimeSlots(): Promise<TimeSlot[]>;
  getTimeSlotsByTeacher(teacherId: number): Promise<TimeSlot[]>;
  getTimeSlotById(id: number): Promise<TimeSlot | undefined>;
  updateTimeSlot(id: number, isBooked: boolean): Promise<TimeSlot | undefined>;
  
  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  getBookingByTimeSlotId(timeSlotId: number): Promise<Booking | undefined>;
}

export class MemStorage implements IStorage {
  private teachers: Map<number, Teacher> = new Map();
  private timeSlots: Map<number, TimeSlot> = new Map();
  private bookings: Map<number, Booking> = new Map();
  private teacherIdCounter = 1;
  private timeSlotIdCounter = 1;
  private bookingIdCounter = 1;

  constructor() {
    this.initializeData();
  }

  // Initialize with 1000 teachers data
  private initializeData() {
    // Generate 1000 teachers
    const teachers: InsertTeacher[] = this.generateTeachers(1000);

    teachers.forEach(teacher => {
      const id = this.teacherIdCounter++;
      this.teachers.set(id, { ...teacher, id });
    });

    // Create time slots for each teacher
    this.generateTimeSlots();
  }

  // Генерация 1000 учителей
  private generateTeachers(count: number): InsertTeacher[] {
    const teachers: InsertTeacher[] = [];
    
    // Списки имен, отчеств и фамилий
    const maleFirstNames = ["Александр", "Алексей", "Андрей", "Антон", "Артем", "Борис", "Вадим", "Валентин", "Василий", "Виктор", "Виталий", "Владимир", "Владислав", "Геннадий", "Георгий", "Григорий", "Даниил", "Денис", "Дмитрий", "Евгений", "Егор", "Иван", "Игорь", "Илья", "Кирилл", "Константин", "Леонид", "Максим", "Михаил", "Никита", "Николай", "Олег", "Павел", "Петр", "Роман", "Руслан", "Сергей", "Станислав", "Степан", "Тимофей", "Федор", "Юрий", "Ярослав"];
    
    const femaleFirstNames = ["Александра", "Алена", "Алина", "Алла", "Анастасия", "Ангелина", "Анна", "Антонина", "Валентина", "Валерия", "Вера", "Вероника", "Виктория", "Галина", "Дарья", "Диана", "Евгения", "Екатерина", "Елена", "Елизавета", "Жанна", "Инна", "Ирина", "Карина", "Кира", "Кристина", "Ксения", "Лариса", "Лидия", "Любовь", "Людмила", "Маргарита", "Марина", "Мария", "Надежда", "Наталья", "Нина", "Оксана", "Ольга", "Полина", "Раиса", "Светлана", "София", "Татьяна", "Ульяна", "Юлия", "Яна"];
    
    const maleMiddleNames = ["Александрович", "Алексеевич", "Анатольевич", "Андреевич", "Антонович", "Аркадьевич", "Артемович", "Борисович", "Вадимович", "Валентинович", "Валерьевич", "Васильевич", "Викторович", "Витальевич", "Владимирович", "Вячеславович", "Геннадьевич", "Георгиевич", "Григорьевич", "Данилович", "Денисович", "Дмитриевич", "Евгеньевич", "Егорович", "Иванович", "Игоревич", "Ильич", "Кириллович", "Константинович", "Леонидович", "Максимович", "Михайлович", "Николаевич", "Олегович", "Павлович", "Петрович", "Романович", "Русланович", "Сергеевич", "Станиславович", "Степанович", "Тимофеевич", "Федорович", "Юрьевич", "Яковлевич", "Ярославович"];
    
    const femaleMiddleNames = ["Александровна", "Алексеевна", "Анатольевна", "Андреевна", "Антоновна", "Аркадьевна", "Артемовна", "Борисовна", "Вадимовна", "Валентиновна", "Валерьевна", "Васильевна", "Викторовна", "Витальевна", "Владимировна", "Вячеславовна", "Геннадьевна", "Георгиевна", "Григорьевна", "Даниловна", "Денисовна", "Дмитриевна", "Евгеньевна", "Егоровна", "Ивановна", "Игоревна", "Ильинична", "Кирилловна", "Константиновна", "Леонидовна", "Максимовна", "Михайловна", "Николаевна", "Олеговна", "Павловна", "Петровна", "Романовна", "Руслановна", "Сергеевна", "Станиславовна", "Степановна", "Тимофеевна", "Федоровна", "Юрьевна", "Яковлевна", "Ярославовна"];
    
    const lastNames = ["Иванов", "Смирнов", "Кузнецов", "Попов", "Васильев", "Петров", "Соколов", "Михайлов", "Новиков", "Федоров", "Морозов", "Волков", "Алексеев", "Лебедев", "Семенов", "Егоров", "Павлов", "Козлов", "Степанов", "Николаев", "Орлов", "Андреев", "Макаров", "Никитин", "Захаров", "Зайцев", "Соловьев", "Борисов", "Яковлев", "Григорьев", "Романов", "Воробьев", "Сергеев", "Кузьмин", "Фролов", "Александров", "Дмитриев", "Королев", "Гусев", "Киселев", "Ильин", "Максимов", "Поляков", "Сорокин", "Виноградов", "Ковалев", "Белов", "Медведев", "Антонов", "Тарасов", "Жуков", "Баранов", "Филиппов", "Комаров", "Давыдов", "Беляев", "Герасимов", "Богданов", "Осипов", "Сидоров", "Матвеев", "Титов", "Марков", "Миронов", "Крылов", "Куликов", "Карпов", "Власов", "Мельников", "Денисов", "Гаврилов", "Тихонов", "Казаков", "Афанасьев", "Данилов", "Савельев", "Тимофеев", "Фомин", "Чернов", "Абрамов", "Мартынов", "Ефимов", "Федотов", "Щербаков", "Назаров", "Калинин", "Исаев", "Чернышев", "Быков", "Маслов", "Родионов", "Коновалов", "Лазарев", "Воронин", "Климов", "Филатов", "Пономарев", "Голубев", "Кудрявцев", "Прохоров", "Наумов", "Потапов", "Журавлев", "Овчинников", "Трофимов", "Леонов", "Соболев", "Ермаков", "Колесников", "Гончаров", "Емельянов", "Никифоров", "Грачев", "Котов", "Гришин", "Ефремов", "Архипов", "Громов", "Кириллов", "Малышев", "Панов", "Моисеев", "Румянцев", "Акимов", "Кондратьев", "Бирюков", "Горбунов", "Анисимов", "Еремин", "Тихомиров", "Галкин", "Лукьянов", "Михеев", "Скворцов", "Юдин", "Белоусов", "Нестеров", "Симонов", "Прокофьев", "Харитонов", "Князев", "Цветков", "Левин", "Митрофанов", "Воронов", "Аксенов", "Софронов", "Мальцев", "Логинов", "Горшков", "Савин", "Краснов", "Майоров", "Демидов", "Елисеев", "Рыбаков", "Сафонов", "Плотников", "Демин", "Хохлов", "Фадеев", "Молчанов", "Игнатов", "Литвинов", "Ершов", "Ушаков", "Дементьев"];
    
    const femaleSuffixes = ["а", "ая", "ина", "ева", "ская"];
    
    // Список предметов
    const subjects = [
      "Математика", "Русский язык", "Литература", "Физика", "Химия", "Биология", 
      "История", "Обществознание", "География", "Информатика", "Английский язык", 
      "Немецкий язык", "Французский язык", "Испанский язык", "Китайский язык", 
      "Физкультура", "ОБЖ", "Технология", "ИЗО", "Музыка", "МХК", "Экономика", 
      "Право", "Астрономия", "Родной язык", "Родная литература", "Черчение", 
      "Алгебра", "Геометрия", "Начальные классы", "Окружающий мир", "Природоведение",
      "Естествознание", "Программирование", "Робототехника", "Экология", 
      "Психология", "Риторика", "Социология", "Философия", "Логика", "Политология", 
      "Финансовая грамотность", "Шахматы", "Театральное искусство", "Журналистика", 
      "Краеведение", "Этика", "Основы религиозных культур", "Этнография"
    ];
    
    // Генерация оценок учителей
    const ratings = ["4.0/5", "4.1/5", "4.2/5", "4.3/5", "4.4/5", "4.5/5", "4.6/5", "4.7/5", "4.8/5", "4.9/5", "5.0/5"];
    
    // Генерация всех классов от 1 до 11
    const allGrades = Array.from({ length: 11 }, (_, i) => (i + 1).toString());
    
    // Генерация 1000 учителей
    for (let i = 0; i < count; i++) {
      // Определяем пол учителя
      const isMale = Math.random() < 0.3; // 30% мужчин, 70% женщин
      
      // Генерируем ФИО
      let firstName, middleName, lastName;
      
      if (isMale) {
        firstName = maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)];
        middleName = maleMiddleNames[Math.floor(Math.random() * maleMiddleNames.length)];
        lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      } else {
        firstName = femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
        middleName = femaleMiddleNames[Math.floor(Math.random() * femaleMiddleNames.length)];
        
        // Преобразуем фамилию в женскую форму
        const maleName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const suffix = femaleSuffixes[Math.floor(Math.random() * femaleSuffixes.length)];
        
        // Если фамилия оканчивается на "ой", "ий", "ый", обрезаем окончание перед добавлением суффикса
        if (maleName.endsWith('ой') || maleName.endsWith('ий') || maleName.endsWith('ый')) {
          lastName = maleName.slice(0, -2) + suffix;
        } else {
          lastName = maleName + suffix;
        }
      }
      
      // Выбираем случайный предмет
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      
      // Генерируем email
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@tetrika.ru`;
      
      // Генерируем классы, с которыми работает учитель
      const numberOfGrades = Math.floor(Math.random() * 7) + 3; // от 3 до 9 классов
      const grades = this.getRandomElements(allGrades, numberOfGrades).sort((a, b) => parseInt(a) - parseInt(b)).join(', ');
      
      // Генерируем рейтинг
      const rating = ratings[Math.floor(Math.random() * ratings.length)];
      
      // Генерируем количество отзывов
      const reviewCount = Math.floor(Math.random() * 50) + 10; // от 10 до 59 отзывов
      
      // Генерируем аватар
      const gender = isMale ? 'men' : 'women';
      const avatarId = Math.floor(Math.random() * 99) + 1;
      const avatar = `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`;
      
      // Генерируем доступность
      const isAvailable = Math.random() < 0.8; // 80% учителей доступны
      
      // Создаем учителя
      const teacher = {
        name: `${lastName} ${firstName} ${middleName}`,
        subject,
        email,
        grades,
        rating: rating as string | null,
        reviewCount: reviewCount as number | null,
        avatar,
        isAvailable: isAvailable as boolean | null
      };
      
      teachers.push(teacher);
    }
    
    return teachers;
  }

  private generateTimeSlots() {
    // Days of the week
    const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    
    // Даты для следующей недели 2025 года (фиксированный период)
    const dates = [
      '2025-04-07', // Monday
      '2025-04-08', // Tuesday
      '2025-04-09', // Wednesday
      '2025-04-10', // Thursday
      '2025-04-11', // Friday
      '2025-04-12', // Saturday
      '2025-04-13'  // Sunday
    ];
    
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
    
    // For each teacher
    this.teachers.forEach((teacher, teacherId) => {
      // For each day
      daysOfWeek.forEach((day, dayIndex) => {
        // Учителя, как правило, ведут меньше уроков в выходные
        const isWeekend = dayIndex >= 5; // Saturday or Sunday
        const maxSlotsPerDay = isWeekend ? 3 : 5;
        
        // Generate 1-5 random slots per day
        const slotsPerDay = Math.floor(Math.random() * maxSlotsPerDay) + 1;
        const selectedHours = this.getRandomElements(hours, slotsPerDay);
        
        selectedHours.forEach(hour => {
          // Определяем, будет ли это стандартный или овербукинг-слот
          const isOverbooking = Math.random() < 0.3; // 30% слотов будут овербукингом
          
          const startTime = `${hour}:00`;
          // Для обычных слотов - 60 минут, для овербукинга - 45 минут
          const endTime = isOverbooking ? `${hour}:45` : `${hour + 1}:00`;
          
          // Randomly mark some slots as booked (for demonstration)
          const isBooked = Math.random() < 0.2;
          
          const timeSlot = {
            teacherId,
            dayOfWeek: day,
            date: dates[dayIndex],
            startTime,
            endTime,
            isBooked: isBooked as boolean | null,
            subject: teacher.subject,
            isOverbooking: isOverbooking as boolean | null
          };
          
          const id = this.timeSlotIdCounter++;
          this.timeSlots.set(id, { ...timeSlot, id });
        });
      });
    });
  }

  private getRandomElements<T>(arr: T[], n: number): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result.slice(0, n);
  }

  // Teacher methods
  async getTeachers(): Promise<Teacher[]> {
    return Array.from(this.teachers.values());
  }

  async getTeacherById(id: number): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  // TimeSlot methods
  async getTimeSlots(): Promise<TimeSlot[]> {
    return Array.from(this.timeSlots.values());
  }

  async getTimeSlotsByTeacher(teacherId: number): Promise<TimeSlot[]> {
    return Array.from(this.timeSlots.values()).filter(
      slot => slot.teacherId === teacherId
    );
  }

  async getTimeSlotById(id: number): Promise<TimeSlot | undefined> {
    return this.timeSlots.get(id);
  }

  async updateTimeSlot(id: number, isBooked: boolean): Promise<TimeSlot | undefined> {
    const timeSlot = this.timeSlots.get(id);
    if (!timeSlot) return undefined;
    
    const updatedTimeSlot = { ...timeSlot, isBooked };
    this.timeSlots.set(id, updatedTimeSlot);
    return updatedTimeSlot;
  }

  // Booking methods
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const booking = { 
      ...bookingData, 
      id, 
      createdAt: new Date(),
      parentName: bookingData.parentName || null,
      comments: bookingData.comments || null
    };
    this.bookings.set(id, booking as Booking);
    
    // Mark the time slot as booked
    await this.updateTimeSlot(bookingData.timeSlotId, true);
    
    return booking as Booking;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBookingByTimeSlotId(timeSlotId: number): Promise<Booking | undefined> {
    return Array.from(this.bookings.values()).find(
      booking => booking.timeSlotId === timeSlotId
    );
  }
}

export const storage = new MemStorage();