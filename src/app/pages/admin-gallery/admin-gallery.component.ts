import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
  protectionInfo: string;
  protectionType: string;
  features: string[];
  category: string;
  serviceType: string;
  serviceTypeAr: string;
  isActive: boolean;
  uploadedAt: string;
}

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-gallery.component.html',
  styleUrls: ['./admin-gallery.component.scss'],
})
export class AdminGalleryComponent implements OnInit {
  galleryImages: GalleryImage[] = [];
  filteredImages: GalleryImage[] = [];
  searchTerm: string = '';
  selectedCategory: string = 'all';
  showUploadForm: boolean = false;
  selectedFiles: FileList | null = null;
  uploadProgress: number = 0;
  isUploading: boolean = false;

  newImage: Partial<GalleryImage> = {
    alt: '',
    category: 'ceramic',
    serviceType: 'Nano Ceramic',
    serviceTypeAr: 'نانو سيراميك',
    isActive: true,
  };

  categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'ceramic', label: 'Ceramic Coating' },
    { value: 'protection', label: 'Protection' },
    { value: 'detailing', label: 'Detailing' },
    { value: 'interior', label: 'Interior' },
  ];

  serviceTypes = [
    { value: 'Nano Ceramic', label: 'Nano Ceramic', labelAr: 'نانو سيراميك' },
    { value: 'Nano Graphene', label: 'Nano Graphene', labelAr: 'نانو جرافين' },
    {
      value: 'Paint Protection',
      label: 'Paint Protection',
      labelAr: 'حماية الطلاء',
    },
    {
      value: 'Window Tinting',
      label: 'Window Tinting',
      labelAr: 'تظليل النوافذ',
    },
    {
      value: 'Interior Protection',
      label: 'Interior Protection',
      labelAr: 'حماية الداخلية',
    },
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadGalleryImages();
    this.removeSpecificImagesOnLoad();
  }

  private loadGalleryImages(): void {
    const savedImages = localStorage.getItem('galleryImages');

    if (savedImages) {
      try {
        this.galleryImages = JSON.parse(savedImages);
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
        this.galleryImages = [];
      }
    } else {
      this.galleryImages = [];
    }

    this.filterImages();
  }

  private saveGalleryImages(): void {
    localStorage.setItem('galleryImages', JSON.stringify(this.galleryImages));
  }

  filterImages(): void {
    this.filteredImages = this.galleryImages.filter((image) => {
      const matchesSearch =
        image.alt.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        image.serviceType
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        image.serviceTypeAr.includes(this.searchTerm);
      const matchesCategory =
        this.selectedCategory === 'all' ||
        image.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  onSearchChange(): void {
    this.filterImages();
  }

  onCategoryChange(): void {
    this.filterImages();
  }

  showUploadImageForm(): void {
    this.newImage = {
      alt: '',
      category: 'ceramic',
      serviceType: 'Nano Ceramic',
      serviceTypeAr: 'نانو سيراميك',
      isActive: true,
    };
    this.selectedFiles = null;
    this.showUploadForm = true;
  }

  onFileSelected(event: any): void {
    this.selectedFiles = event.target.files;
  }

  deleteImage(image: GalleryImage): void {
    if (confirm(`Are you sure you want to delete "${image.alt}"?`)) {
      this.galleryImages = this.galleryImages.filter(
        (img) => img.id !== image.id
      );
      this.saveGalleryImages();
      this.filterImages();
    }
  }

  toggleImageStatus(image: GalleryImage): void {
    image.isActive = !image.isActive;
    this.saveGalleryImages();
  }

  onServiceTypeChange(): void {
    const selectedService = this.serviceTypes.find(
      (s) => s.value === this.newImage.serviceType
    );
    if (selectedService) {
      this.newImage.serviceTypeAr = selectedService.labelAr;
    }
  }

  uploadImages(): void {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      alert('Please select at least one image file');
      return;
    }

    if (!this.newImage.alt || !this.newImage.serviceType) {
      alert('Please fill in all required fields');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(uploadInterval);
        this.processUploadedFiles();
      }
    }, 200);
  }

  private processUploadedFiles(): void {
    if (!this.selectedFiles) return;

    let processedCount = 0;
    const totalFiles = this.selectedFiles.length;

    Array.from(this.selectedFiles).forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(
          `File ${file.name} is not an image. Please select only image files.`
        );
        return;
      }

      // Create a preview URL for the uploaded file
      const reader = new FileReader();

      reader.onload = (e) => {
        const imageAlt =
          this.newImage.alt +
          (this.selectedFiles!.length > 1 ? ` ${index + 1}` : '');

        const newImage: GalleryImage = {
          id: Date.now().toString() + index,
          src: e.target?.result as string,
          alt: imageAlt,
          title: imageAlt,
          description: `Professional ${this.newImage.serviceType} service - ${imageAlt}`,
          protectionInfo: `Advanced protection using ${this.newImage.serviceType} technology. High-quality service with long-lasting results.`,
          protectionType: this.newImage.serviceType!,
          features: [
            'Professional Service',
            'High Quality',
            'Long-lasting Protection',
            'Expert Application',
          ],
          category: this.newImage.category!,
          serviceType: this.newImage.serviceType!,
          serviceTypeAr: this.newImage.serviceTypeAr!,
          isActive: this.newImage.isActive!,
          uploadedAt: new Date().toISOString(),
        };

        this.galleryImages.push(newImage);
        this.saveGalleryImages();
        this.filterImages();

        // Trigger a custom event to notify the main gallery to refresh
        window.dispatchEvent(new CustomEvent('galleryUpdated'));

        processedCount++;
        if (processedCount === totalFiles) {
          this.isUploading = false;
          this.uploadProgress = 0;
          this.cancelForm();
          alert(`Successfully uploaded ${totalFiles} image(s)!`);
        }
      };

      reader.onerror = (error) => {
        alert(`Error reading file ${file.name}. Please try again.`);
      };

      reader.readAsDataURL(file);
    });
  }

  cancelForm(): void {
    this.showUploadForm = false;
    this.selectedFiles = null;
    this.uploadProgress = 0;
    this.isUploading = false;
    this.newImage = {
      alt: '',
      category: 'ceramic',
      serviceType: 'Nano Ceramic',
      serviceTypeAr: 'نانو سيراميك',
      isActive: true,
    };
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  clearAllAdminImages(): void {
    if (
      confirm(
        'Are you sure you want to remove all admin-added gallery images? This action cannot be undone.'
      )
    ) {
      localStorage.removeItem('galleryImages');
      this.loadGalleryImages();
      alert('All admin gallery images have been removed successfully.');
    }
  }

  private removeSpecificImagesOnLoad(): void {
    // Automatically remove ceramic-1.jpg and ceramic-2.jpg on component load
    const savedImages = localStorage.getItem('galleryImages');
    if (savedImages) {
      const parsedImages = JSON.parse(savedImages);
      const filteredImages = parsedImages.filter(
        (img: any) =>
          !img.src.includes('ceramic-1.jpg') &&
          !img.src.includes('ceramic-2.jpg')
      );

      // Only update if images were actually removed
      if (filteredImages.length !== parsedImages.length) {
        localStorage.setItem('galleryImages', JSON.stringify(filteredImages));
        this.loadGalleryImages();
        console.log(
          'ceramic-1.jpg and ceramic-2.jpg automatically removed from gallery'
        );
      }
    }
  }
}
