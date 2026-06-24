/**
 * Gallery Service
 * 
 * خدمة متكاملة لإدارة المعرض مع Firestore
 */

import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  setDoc,
  writeBatch
} from '@angular/fire/firestore';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export interface GalleryImage {
  id?: string;
  src: string; // Image URL/link
  alt: string;
  title: string;
  description?: string;
  category: string;
  serviceType: string;
  serviceTypeAr: string;
  collectionId?: string; // ID for grouping photos by car
  collectionName?: string; // Name of the car collection
  sortOrder?: number; // For sorting within collection
  isActive: boolean;
  uploadedAt: string | Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CarCollection {
  id?: string;
  name: string;
  description?: string;
  thumbnail?: string; // Optional: A main image for the collection
  isActive: boolean;
  sortOrder?: number; // For custom sorting of collections
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// Type for creating a new collection (without timestamps - they're added by the service)
export type CreateCarCollectionInput = Omit<CarCollection, 'id' | 'createdAt' | 'updatedAt'>;

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private imagesCollection = 'gallery';
  private collectionsCollection = 'gallery_collections';

  constructor(private firestore: Firestore) {}

  /**
   * Get all active gallery images
   */
  getAllImages(): Observable<GalleryImage[]> {
    const imagesRef = collection(this.firestore, this.imagesCollection);
    const q = query(
      imagesRef,
      where('isActive', '==', true),
      orderBy('uploadedAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as GalleryImage[];
      }),
      catchError((error) => {
        console.error('Error fetching gallery images:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get images by collection ID
   */
  getImagesByCollection(collectionId: string): Observable<GalleryImage[]> {
    const imagesRef = collection(this.firestore, this.imagesCollection);
    const q = query(
      imagesRef,
      where('collectionId', '==', collectionId),
      where('isActive', '==', true),
      orderBy('sortOrder', 'asc')
    );

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as GalleryImage[];
      }),
      catchError((error) => {
        console.error('Error fetching collection images:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single image by ID
   */
  getImageById(imageId: string): Observable<GalleryImage | null> {
    const imageRef = doc(this.firestore, this.imagesCollection, imageId);
    return from(getDoc(imageRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          return {
            id: snapshot.id,
            ...snapshot.data(),
          } as GalleryImage;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching image:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Add a new gallery image
   */
  addImage(image: GalleryImage): Observable<string> {
    const imagesRef = collection(this.firestore, this.imagesCollection);
    
    // Convert uploadedAt to Timestamp if needed
    let uploadedAtTimestamp: Timestamp;
    if (image.uploadedAt) {
      if (image.uploadedAt instanceof Timestamp) {
        uploadedAtTimestamp = image.uploadedAt;
      } else if (typeof image.uploadedAt === 'string') {
        uploadedAtTimestamp = Timestamp.fromDate(new Date(image.uploadedAt));
      } else {
        uploadedAtTimestamp = Timestamp.now();
      }
    } else {
      uploadedAtTimestamp = Timestamp.now();
    }
    
    const imageData = {
      ...image,
      uploadedAt: uploadedAtTimestamp,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      sortOrder: image.sortOrder || 0,
    };

    return from(addDoc(imagesRef, imageData)).pipe(
      map((docRef) => docRef.id),
      catchError((error) => {
        console.error('Error adding image:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing image
   */
  updateImage(imageId: string, image: Partial<GalleryImage>): Observable<void> {
    const imageRef = doc(this.firestore, this.imagesCollection, imageId);
    const updateData = {
      ...image,
      updatedAt: Timestamp.now(),
    };

    // Convert uploadedAt to Timestamp if it's a string
    if (updateData.uploadedAt && typeof updateData.uploadedAt === 'string') {
      updateData.uploadedAt = Timestamp.fromDate(new Date(updateData.uploadedAt));
    }

    return from(updateDoc(imageRef, updateData)).pipe(
      catchError((error) => {
        console.error('Error updating image:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete an image
   */
  deleteImage(imageId: string): Observable<void> {
    const imageRef = doc(this.firestore, this.imagesCollection, imageId);
    return from(deleteDoc(imageRef)).pipe(
      catchError((error) => {
        console.error('Error deleting image:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get all car collections (for admin - includes inactive)
   */
  getAllCollections(includeInactive: boolean = false): Observable<CarCollection[]> {
    const collectionsRef = collection(this.firestore, this.collectionsCollection);
    let q;
    
    if (includeInactive) {
      // For admin: get all collections
      q = query(
        collectionsRef,
        orderBy('sortOrder', 'asc')
      );
    } else {
      // For public: get only active collections
      q = query(
        collectionsRef,
        where('isActive', '==', true),
        orderBy('sortOrder', 'asc')
      );
    }

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as CarCollection[];
      }),
      catchError((error) => {
        console.error('Error fetching collections:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a single collection by ID
   */
  getCollectionById(collectionId: string): Observable<CarCollection | null> {
    const collectionRef = doc(this.firestore, this.collectionsCollection, collectionId);
    return from(getDoc(collectionRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          return {
            id: snapshot.id,
            ...snapshot.data(),
          } as CarCollection;
        }
        return null;
      }),
      catchError((error) => {
        console.error('Error fetching collection:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Add a new car collection
   */
  addCollection(carCollection: CreateCarCollectionInput): Observable<string> {
    const collectionsRef = collection(this.firestore, this.collectionsCollection);
    const collectionData = {
      ...carCollection,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      sortOrder: carCollection.sortOrder || 0,
    };

    return from(addDoc(collectionsRef, collectionData)).pipe(
      map((docRef) => docRef.id),
      catchError((error) => {
        console.error('Error adding collection:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update a collection
   */
  updateCollection(collectionId: string, carCollection: Partial<CarCollection>): Observable<void> {
    const collectionRef = doc(this.firestore, this.collectionsCollection, collectionId);
    const updateData = {
      ...carCollection,
      updatedAt: Timestamp.now(),
    };

    return from(updateDoc(collectionRef, updateData)).pipe(
      catchError((error) => {
        console.error('Error updating collection:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a collection
   */
  deleteCollection(collectionId: string): Observable<void> {
    const collectionRef = doc(this.firestore, this.collectionsCollection, collectionId);
    return from(deleteDoc(collectionRef)).pipe(
      catchError((error) => {
        console.error('Error deleting collection:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update sort order for multiple images
   */
  updateImageSortOrder(updates: { id: string; sortOrder: number }[]): Observable<void> {
    const batch = writeBatch(this.firestore);
    
    updates.forEach((update) => {
      const imageRef = doc(this.firestore, this.imagesCollection, update.id);
      batch.update(imageRef, {
        sortOrder: update.sortOrder,
        updatedAt: Timestamp.now(),
      });
    });

    return from(batch.commit()).pipe(
      catchError((error) => {
        console.error('Error updating sort order:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update sort order for multiple collections
   */
  updateCollectionSortOrder(updates: { id: string; sortOrder: number }[]): Observable<void> {
    const batch = writeBatch(this.firestore);
    
    updates.forEach((update) => {
      const collectionRef = doc(this.firestore, this.collectionsCollection, update.id);
      batch.update(collectionRef, {
        sortOrder: update.sortOrder,
        updatedAt: Timestamp.now(),
      });
    });

    return from(batch.commit()).pipe(
      catchError((error) => {
        console.error('Error updating collection sort order:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Initialize collections collection (creates the collection by adding a placeholder document)
   * This is useful for ensuring the collection exists in Firestore
   */
  initializeCollectionsCollection(): Observable<void> {
    const collectionsRef = collection(this.firestore, this.collectionsCollection);
    
    // Check if collection already has documents
    return from(getDocs(collectionsRef)).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          // Collection doesn't exist or is empty, create a placeholder
          const placeholderDoc = doc(collectionsRef);
          const placeholderData = {
            name: '_placeholder',
            description: 'This is a placeholder document to initialize the collection',
            isActive: false,
            sortOrder: -9999,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };
          
          return from(setDoc(placeholderDoc, placeholderData)).pipe(
            map(() => {
              console.log('Collections collection initialized successfully');
            }),
            catchError((error) => {
              console.error('Error initializing collections collection:', error);
              return throwError(() => error);
            })
          );
        } else {
          console.log('Collections collection already exists');
          return of(void 0);
        }
      }),
      catchError((error) => {
        console.error('Error checking collections collection:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Bulk seed collections and images from a simple config
   * Each entry contains a stable collectionId/name and array of image URLs
   */
  bulkSeedCollectionsAndImages(seedData: { collectionId: string; collectionName: string; images: string[] }[]): Observable<void> {
    const collectionsRef = collection(this.firestore, this.collectionsCollection);
    const imagesRef = collection(this.firestore, this.imagesCollection);

    const ops: Observable<any>[] = [];

    seedData.forEach((entry, entryIndex) => {
      const collDoc = doc(collectionsRef, entry.collectionId);
      const collectionPayload = {
        name: entry.collectionName,
        description: '',
        thumbnail: entry.images[0] || '',
        isActive: true,
        sortOrder: entryIndex,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      } as any;
      ops.push(from(setDoc(collDoc, collectionPayload, { merge: true })));

      entry.images.forEach((imgUrl, imgIndex) => {
        const imagePayload: GalleryImage = {
          src: imgUrl,
          alt: '',
          title: '',
          description: '',
          category: 'gallery',
          serviceType: '',
          serviceTypeAr: '',
          collectionId: entry.collectionId,
          collectionName: entry.collectionName,
          sortOrder: imgIndex,
          isActive: true,
          uploadedAt: Timestamp.now(),
        };
        ops.push(this.addImage(imagePayload));
      });
    });

    // Execute sequentially to respect Firestore limits
    return ops.reduce((acc, curr) => acc.pipe(switchMap(() => curr)), of(void 0)).pipe(
      catchError((error) => {
        console.error('Error seeding gallery:', error);
        return throwError(() => error);
      }),
      map(() => void 0)
    );
  }
}

