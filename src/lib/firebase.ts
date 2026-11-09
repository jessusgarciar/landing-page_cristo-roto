import { initializeApp, type FirebaseApp } from 'firebase/app';
import { initializeFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig, firebaseDatabaseId } from './firebase-config';

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

function getFirestoreDb(): Firestore {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    db = initializeFirestore(firebaseApp, {}, firebaseDatabaseId);
  }
  return db;
}

function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    const firebaseApp = getFirebaseApp();
    storage = getStorage(firebaseApp);
  }
  return storage;
}

export { getFirebaseApp, getFirestoreDb, getFirebaseStorage };

export interface CarouselItem {
  id: string;
  imagePath: string;
  title: string;
  subtitle: string;
}

export interface FeaturedItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  schedule: string;
  phone: string;
  logoPath?: string;
  address?: string;
  offers: string[];
  latitude?: number;
  longitude?: number;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  imagePath?: string;
  schedule: string;
  phone: string;
  logoPath?: string;
  address?: string;
  offers: string[];
  latitude?: number;
  longitude?: number;
}

export interface Lodging {
  id: string;
  name: string;
  description: string;
  imagePath?: string;
  schedule: string;
  phone: string;
  logoPath?: string;
  address?: string;
  offers: string[];
  latitude?: number;
  longitude?: number;
}

export interface Service {
  id: string;
  icon: string;
  name: string;
  description: string;
  schedule: string;
  phone: string;
  address?: string;
  offers: string[];
  latitude?: number;
  longitude?: number;
}

export interface Question {
  id: string;
  text: string;
  isActive: boolean;
  starDistribution: number[];
  totalResponses: number;
}

export interface TuristaFoto {
  id: string;
  imagePath: string;
  format: string;
  description: string;
  approved: boolean;
  createdAt: number;
}

export interface FeedbackEntry {
  id: string;
  comment: string;
  createdAt: number;
  isRead: boolean;
}
