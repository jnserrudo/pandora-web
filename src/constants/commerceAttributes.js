import {
  Accessibility, Dog, Baby, EarOff, Eye, ParkingCircle, Leaf,
  WheatOff, MilkOff, Coffee, Wine, Beer, Salad, Wifi, Plug,
  Thermometer, Car, Bike, Truck, ShoppingBag, Clock, Cigarette,
  PawPrint, Puzzle, Presentation, Heart, Users, Music, Tv,
  CreditCard, Smartphone, Bitcoin, HandCoins, Tags, Recycle, Globe, Rabbit
} from 'lucide-react';

export const commerceAttributes = {
  // 1. Accesibilidad e Inclusión
  wheelchair: { id: 'wheelchair', label: 'Acceso para silla de ruedas', icon: Accessibility, category: 'Accesibilidad' },
  service_dog: { id: 'service_dog', label: 'Perros de asistencia', icon: Dog, category: 'Accesibilidad' },
  baby_changer: { id: 'baby_changer', label: 'Cambiador para bebés', icon: Baby, category: 'Accesibilidad' },
  silent_hour: { id: 'silent_hour', label: 'Hora silenciosa (TEA)', icon: EarOff, category: 'Accesibilidad' },
  braille_menu: { id: 'braille_menu', label: 'Menú en Braille/Audio', icon: Eye, category: 'Accesibilidad' },
  accessible_parking: { id: 'accessible_parking', label: 'Estacionamiento accesible', icon: ParkingCircle, category: 'Accesibilidad' },

  // 2. Gastronomía y Alimentación
  vegan: { id: 'vegan', label: 'Opciones Veganas', icon: Leaf, category: 'Gastronomía' },
  vegetarian: { id: 'vegetarian', label: 'Opciones Vegetarianas', icon: Leaf, category: 'Gastronomía' },
  gluten_free: { id: 'gluten_free', label: 'Sin TACC', icon: WheatOff, category: 'Gastronomía' },
  dairy_free: { id: 'dairy_free', label: 'Sin Lactosa', icon: MilkOff, category: 'Gastronomía' },
  specialty_coffee: { id: 'specialty_coffee', label: 'Café de Especialidad', icon: Coffee, category: 'Gastronomía' },
  wine_menu: { id: 'wine_menu', label: 'Carta de Vinos', icon: Wine, category: 'Gastronomía' },
  craft_beer: { id: 'craft_beer', label: 'Cerveza Artesanal', icon: Beer, category: 'Gastronomía' },
  healthy: { id: 'healthy', label: 'Opciones Saludables', icon: Salad, category: 'Gastronomía' },

  // 3. Servicios y Comodidades Generales
  wifi: { id: 'wifi', label: 'WiFi Gratis', icon: Wifi, category: 'Comodidades' },
  plugs: { id: 'plugs', label: 'Enchufes Disponibles', icon: Plug, category: 'Comodidades' },
  ac: { id: 'ac', label: 'Climatización', icon: Thermometer, category: 'Comodidades' },
  parking: { id: 'parking', label: 'Estacionamiento', icon: Car, category: 'Comodidades' },
  bike_parking: { id: 'bike_parking', label: 'Bicicletero', icon: Bike, category: 'Comodidades' },
  delivery: { id: 'delivery', label: 'Delivery Propio', icon: Truck, category: 'Comodidades' },
  take_away: { id: 'take_away', label: 'Take Away', icon: ShoppingBag, category: 'Comodidades' },
  extended_hours: { id: 'extended_hours', label: 'Horario Extendido', icon: Clock, category: 'Comodidades' },
  smoking_area: { id: 'smoking_area', label: 'Sector Fumadores', icon: Cigarette, category: 'Comodidades' },

  // 4. Atmósfera y Público Objetivo
  pet_friendly: { id: 'pet_friendly', label: 'Pet Friendly', icon: PawPrint, category: 'Atmósfera' },
  kids_friendly: { id: 'kids_friendly', label: 'Kids Friendly', icon: Puzzle, category: 'Atmósfera' },
  coworking: { id: 'coworking', label: 'Ideal Coworking', icon: Presentation, category: 'Atmósfera' },
  romantic: { id: 'romantic', label: 'Ambiente Romántico', icon: Heart, category: 'Atmósfera' },
  groups: { id: 'groups', label: 'Ideal para Grupos', icon: Users, category: 'Atmósfera' },
  live_music: { id: 'live_music', label: 'Música en Vivo', icon: Music, category: 'Atmósfera' },
  sports_tv: { id: 'sports_tv', label: 'Transmisión Deportiva', icon: Tv, category: 'Atmósfera' },

  // 5. Pagos y Finanzas
  cards: { id: 'cards', label: 'Acepta Tarjetas', icon: CreditCard, category: 'Pagos' },
  virtual_wallet: { id: 'virtual_wallet', label: 'Billeteras Virtuales', icon: Smartphone, category: 'Pagos' },
  crypto: { id: 'crypto', label: 'Criptomonedas', icon: Bitcoin, category: 'Pagos' },
  cash_discount: { id: 'cash_discount', label: 'Descuento en Efectivo', icon: HandCoins, category: 'Pagos' },
  installments: { id: 'installments', label: 'Cuotas sin Interés', icon: Tags, category: 'Pagos' },

  // 6. Sostenibilidad y Ética
  eco_packaging: { id: 'eco_packaging', label: 'Envases Ecológicos', icon: Recycle, category: 'Sostenibilidad' },
  own_cup_discount: { id: 'own_cup_discount', label: 'Descuento x Vaso Propio', icon: Coffee, category: 'Sostenibilidad' },
  local_produce: { id: 'local_produce', label: 'Producto Local (KM 0)', icon: Globe, category: 'Sostenibilidad' },
  cruelty_free: { id: 'cruelty_free', label: 'Cruelty Free', icon: Rabbit, category: 'Sostenibilidad' },
};
