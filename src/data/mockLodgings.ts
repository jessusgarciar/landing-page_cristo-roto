import type { Lodging } from '../lib/firebase';

export const mockLodgings: Lodging[] = [
  {
    id: 'h1',
    name: 'Cabañas Cristo Roto',
    description: 'Cabañas familiares rodeadas de naturaleza, ideales para descansar después de visitar el santuario.',
    imagePath: '/assets/images/carrusel_img1.webp',
    schedule: 'Recepción 8:00 am - 9:00 pm',
    phone: '465-742-0501',
    address: 'San Jose de Gracia, Aguascalientes',
    offers: ['Cabañas familiares', 'Estacionamiento', 'Terraza con vista'],
  },
  {
    id: 'h2',
    name: 'Hotel La Presa',
    description: 'Habitaciones cómodas para disfrutar un fin de semana tranquilo cerca de la presa.',
    imagePath: '/assets/images/carrusel_img3.webp',
    schedule: 'Atención 24 horas',
    phone: '465-742-0502',
    address: 'Centro de San Jose de Gracia',
    offers: ['Habitaciones privadas', 'WiFi', 'Desayuno regional'],
  },
  {
    id: 'h3',
    name: 'Posada El Mirador',
    description: 'Hospedaje sencillo y acogedor para familias y visitantes que buscan una estancia local.',
    imagePath: '/assets/images/restaurante1.webp',
    schedule: 'Check-in 2:00 pm - 10:00 pm',
    phone: '465-742-0503',
    address: 'Camino al Cristo Roto',
    offers: ['Habitaciones familiares', 'Agua caliente', 'Área de descanso'],
  },
];
