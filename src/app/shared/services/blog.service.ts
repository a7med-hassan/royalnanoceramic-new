/**
 * Blog Service — Professional Bilingual CMS
 * Supports: custom slugs, AR/EN content, video embeds, featured images
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
  setDoc
} from '@angular/fire/firestore';
import { Observable, from, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export interface BlogPost {
  id?: string;
  slug: string;            // Custom URL slug e.g. "nanoceramic-coating-guide"

  // Bilingual title & excerpt
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;

  // Bilingual rich-HTML content
  contentAr: string;
  contentEn: string;

  // Media
  image: string;           // Main featured image URL
  hasVideo?: boolean;      // Toggle for main video
  videoUrl?: string;       // YouTube embed URL (optional)

  // Taxonomy
  category: string;
  tags: string[];

  // SEO
  seoDescriptionAr?: string;
  seoDescriptionEn?: string;
  seoKeywords?: string[];

  // Meta
  author?: string;
  authorId?: string;
  date?: string | Timestamp;
  readTime?: string;
  featured: boolean;
  published: boolean;
  views?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;

  // Legacy compatibility (single-language)
  title?: string;
  excerpt?: string;
  content?: string;
  seoDescription?: string;
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private col = 'blog_posts';

  constructor(private firestore: Firestore) {}

  // ── Read ────────────────────────────────────────────────────────────────

  getAllPosts(): Observable<BlogPost[]> {
    const ref = collection(this.firestore, this.col);
    const q = query(ref, orderBy('createdAt', 'desc'));
    return from(getDocs(q)).pipe(
      map(snap => snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost))),
      catchError(err => { console.error('getAllPosts error', err); return throwError(() => err); })
    );
  }

  getPublishedPosts(): Observable<BlogPost[]> {
    const ref = collection(this.firestore, this.col);
    const q = query(ref, where('published', '==', true), orderBy('createdAt', 'desc'));
    return from(getDocs(q)).pipe(
      map(snap => snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost))),
      catchError(err => { console.error('getPublishedPosts error', err); return throwError(() => err); })
    );
  }

  /** Load by Firestore document ID (backward compat) */
  getPostById(id: string): Observable<BlogPost | null> {
    const ref = doc(this.firestore, this.col, id);
    return from(getDoc(ref)).pipe(
      map(snap => snap.exists() ? { id: snap.id, ...snap.data() } as BlogPost : null),
      catchError(err => { console.error('getPostById error', err); return throwError(() => err); })
    );
  }

  /** Load by custom slug — primary method for public URLs */
  getPostBySlug(slug: string): Observable<BlogPost | null> {
    const ref = collection(this.firestore, this.col);
    const q = query(ref, where('slug', '==', slug), where('published', '==', true), limit(1));
    return from(getDocs(q)).pipe(
      map(snap => {
        if (snap.empty) return null;
        const d = snap.docs[0];
        return { id: d.id, ...d.data() } as BlogPost;
      }),
      catchError(err => { console.error('getPostBySlug error', err); return throwError(() => err); })
    );
  }

  /**
   * Load by slug OR fall back to Firestore ID — used by BlogPostComponent.
   * This keeps old /blog/:firestoreId URLs working.
   */
  getPostBySlugOrId(slugOrId: string): Observable<BlogPost | null> {
    return this.getPostBySlug(slugOrId).pipe(
      switchMap(post => {
        if (post) return of(post);
        // Slug not found → try as Firestore document ID
        return this.getPostById(slugOrId);
      })
    );
  }

  /** Check if a slug is already taken (for dashboard validation) */
  checkSlugExists(slug: string, excludeId?: string): Observable<boolean> {
    const ref = collection(this.firestore, this.col);
    const q = query(ref, where('slug', '==', slug), limit(1));
    return from(getDocs(q)).pipe(
      map(snap => {
        if (snap.empty) return false;
        // Allow the same post to keep its own slug during edit
        if (excludeId && snap.docs[0].id === excludeId) return false;
        return true;
      }),
      catchError(() => of(false))
    );
  }

  getFeaturedPosts(count = 3): Observable<BlogPost[]> {
    const ref = collection(this.firestore, this.col);
    const q = query(ref, where('featured', '==', true), where('published', '==', true), orderBy('createdAt', 'desc'), limit(count));
    return from(getDocs(q)).pipe(
      map(snap => snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost))),
      catchError(err => throwError(() => err))
    );
  }

  // ── Write ───────────────────────────────────────────────────────────────

  createPost(post: Partial<BlogPost>, authorId: string): Observable<string> {
    const ref = collection(this.firestore, this.col);
    const now = Timestamp.now();

    const newPost: BlogPost = {
      slug:         post.slug || this.generateSlug(post.titleEn || post.titleAr || ''),
      titleAr:      post.titleAr || post.title || '',
      titleEn:      post.titleEn || post.title || '',
      excerptAr:    post.excerptAr || post.excerpt || '',
      excerptEn:    post.excerptEn || post.excerpt || '',
      contentAr:    post.contentAr || post.content || '',
      contentEn:    post.contentEn || post.content || '',
      image:        post.image || '',
      videoUrl:     post.videoUrl || '',
      category:     post.category || '',
      tags:         post.tags || [],
      seoDescriptionAr: post.seoDescriptionAr || post.seoDescription || '',
      seoDescriptionEn: post.seoDescriptionEn || post.seoDescription || '',
      seoKeywords:  post.seoKeywords || [],
      featured:     post.featured ?? false,
      published:    post.published ?? false,
      author:       post.author || 'Admin',
      authorId,
      date:         now.toDate().toISOString().split('T')[0],
      readTime:     post.readTime || '5 دقائق',
      views:        0,
      createdAt:    now,
      updatedAt:    now,
    };

    return from(addDoc(ref, newPost)).pipe(
      map(docRef => docRef.id),
      catchError(err => { console.error('createPost error', err); return throwError(() => err); })
    );
  }

  updatePost(id: string, updates: Partial<BlogPost>): Observable<void> {
    const ref = doc(this.firestore, this.col, id);
    const data = { ...updates, updatedAt: Timestamp.now() };
    return from(updateDoc(ref, data)).pipe(
      map(() => {}),
      catchError(err => { console.error('updatePost error', err); return throwError(() => err); })
    );
  }

  deletePost(id: string): Observable<void> {
    const ref = doc(this.firestore, this.col, id);
    return from(deleteDoc(ref)).pipe(
      map(() => {}),
      catchError(err => { console.error('deletePost error', err); return throwError(() => err); })
    );
  }

  togglePublish(id: string, published: boolean): Observable<void> {
    return this.updatePost(id, { published });
  }

  toggleFeatured(id: string, featured: boolean): Observable<void> {
    return this.updatePost(id, { featured });
  }

  async incrementViews(id: string): Promise<void> {
    const ref = doc(this.firestore, this.col, id);
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const views = (snap.data()['views'] || 0) + 1;
        await updateDoc(ref, { views });
      }
    } catch (e) { console.error('incrementViews error', e); }
  }

  getBlogStats(): Observable<{ total: number; published: number; draft: number; featured: number; totalViews: number }> {
    return this.getAllPosts().pipe(
      map(posts => ({
        total:      posts.length,
        published:  posts.filter(p => p.published).length,
        draft:      posts.filter(p => !p.published).length,
        featured:   posts.filter(p => p.featured).length,
        totalViews: posts.reduce((s, p) => s + (p.views || 0), 0)
      }))
    );
  }

  // ── Utility ─────────────────────────────────────────────────────────────

  /** Generate a URL-safe slug from a string */
  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\u0600-\u06FF\s]+/g, '-')   // Arabic chars → hyphen
      .replace(/[^a-z0-9-]/g, '')             // Remove non-alphanumeric
      .replace(/-+/g, '-')                    // Collapse multiple hyphens
      .replace(/^-|-$/g, '');                 // Trim leading/trailing hyphens
  }

  /** Get YouTube embed URL from various YouTube URL formats */
  getYouTubeEmbedUrl(url: string): string | null {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/\s]{11})/);
    if (!match) return null;
    return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
  }
}
