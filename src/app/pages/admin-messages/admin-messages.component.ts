import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminMessagesService } from '../../shared/services/admin-messages.service';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-messages.component.html',
  styleUrls: ['./admin-messages.component.scss'],
})
export class AdminMessagesComponent implements OnInit {
  // Data arrays
  contactMessages: any[] = [];
  joinMessages: any[] = [];

  // Loading states
  isLoadingContact = true;
  isLoadingJoin = true;

  // Error states
  contactError = '';
  joinError = '';

  // API status
  apiStatus = {
    contact: 'loading', // 'loading', 'success', 'error'
    join: 'loading',
  };

  // Selection tracking
  selectedContactMessages = new Set<number>();
  selectedJoinMessages = new Set<number>();

  // Deleted messages tracking (local storage)
  deletedContactMessages = new Set<string>();
  deletedJoinMessages = new Set<string>();

  constructor(private adminMessagesService: AdminMessagesService) {}

  private loadDataFromLocalStorage(): void {
    // Load contact messages from localStorage
    const savedContactMessages = localStorage.getItem('contactMessages');
    if (savedContactMessages) {
      this.contactMessages = JSON.parse(savedContactMessages);
    }

    // Load join messages from localStorage
    const savedJoinMessages = localStorage.getItem('joinMessages');
    if (savedJoinMessages) {
      this.joinMessages = JSON.parse(savedJoinMessages);
    }

    // Load deleted messages tracking
    const savedDeletedContact = localStorage.getItem('deletedContactMessages');
    if (savedDeletedContact) {
      this.deletedContactMessages = new Set(JSON.parse(savedDeletedContact));
    }

    const savedDeletedJoin = localStorage.getItem('deletedJoinMessages');
    if (savedDeletedJoin) {
      this.deletedJoinMessages = new Set(JSON.parse(savedDeletedJoin));
    }
  }

  private saveDataToLocalStorage(): void {
    // Save contact messages to localStorage
    localStorage.setItem(
      'contactMessages',
      JSON.stringify(this.contactMessages)
    );

    // Save join messages to localStorage
    localStorage.setItem('joinMessages', JSON.stringify(this.joinMessages));

    // Save deleted messages tracking
    localStorage.setItem(
      'deletedContactMessages',
      JSON.stringify(Array.from(this.deletedContactMessages))
    );
    localStorage.setItem(
      'deletedJoinMessages',
      JSON.stringify(Array.from(this.deletedJoinMessages))
    );
  }

  ngOnInit(): void {
    // Load data from API only
    this.loadDataFromAPI();
    this.loadDataFromLocalStorage();
  }

  private loadDataFromAPI(): void {
    // Load contact messages
    this.isLoadingContact = true;
    this.contactError = '';
    this.adminMessagesService.getContactMessages().subscribe({
      next: (messages: any[]) => {

        if (messages && Array.isArray(messages) && messages.length > 0) {
          // Debug: Log first message structure
          console.log('🔍 First contact message structure:', messages[0]);
          console.log(
            '🔍 First contact message keys:',
            Object.keys(messages[0])
          );

          // Filter out deleted messages
          const filteredMessages = messages.filter((message) => {
            const messageId = this.getMessageId(message);
            return !this.deletedContactMessages.has(messageId);
          });

          console.log(
            `🔍 Original messages: ${messages.length}, Filtered: ${filteredMessages.length}`
          );

          this.contactMessages = filteredMessages;
          this.apiStatus.contact = 'success';
          console.log(
            '✅ Contact messages loaded successfully:',
            this.contactMessages
          );

          // Save to localStorage
          this.saveDataToLocalStorage();
        } else {
          this.contactMessages = [];
          this.apiStatus.contact = 'success';
          console.log('ℹ️ No contact messages found, setting empty array');
        }
        this.isLoadingContact = false;
      },
      error: (error) => {
        console.error('❌ Error loading contact messages:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
        });
        this.contactError = `فشل في تحميل رسائل الاتصال: ${
          error.status || 'خطأ في الاتصال'
        }`;
        this.apiStatus.contact = 'error';
        this.isLoadingContact = false;
      },
    });

    // Load join messages
    this.isLoadingJoin = true;
    this.joinError = '';
    this.adminMessagesService.getJoinMessages().subscribe({
      next: (messages: any[]) => {
        if (messages && Array.isArray(messages) && messages.length > 0) {
          // Filter out deleted messages
          const filteredMessages = messages.filter((message) => {
            const messageId = this.getMessageId(message);
            return !this.deletedJoinMessages.has(messageId);
          });

          this.joinMessages = filteredMessages;
          this.apiStatus.join = 'success';
          console.log(
            '✅ Join messages loaded successfully:',
            this.joinMessages
          );

          // Save to localStorage
          this.saveDataToLocalStorage();
        } else {
          this.joinMessages = [];
          this.apiStatus.join = 'success';
          console.log('ℹ️ No join messages found, setting empty array');
        }
        this.isLoadingJoin = false;
      },
      error: (error) => {
        console.error('❌ Error loading join messages:', error);
        console.error('❌ Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
        });
        this.joinError = `فشل في تحميل رسائل الانضمام: ${
          error.status || 'خطأ في الاتصال'
        }`;
        this.apiStatus.join = 'error';
        this.isLoadingJoin = false;
      },
    });
  }

  exportCSV(type: 'contact' | 'join'): void {
    const messages =
      type === 'contact' ? this.contactMessages : this.joinMessages;

    if (messages.length === 0) {
      alert('لا توجد رسائل للتصدير');
      return;
    }

    let csvContent = '';

    if (type === 'contact') {
      // Contact messages CSV with Arabic headers including UTM parameters
      csvContent =
        'الاسم,رقم الهاتف,نوع السيارة,موديل السيارة,ملاحظات إضافية,مصدر الحملة,وسيلة الحملة,اسم الحملة,التاريخ\n';
      messages.forEach((message) => {
        // Clean and format data for CSV
        const fullName = this.cleanCSVField(message.fullName || 'غير محدد');
        const phoneNumber = this.cleanCSVField(
          message.phoneNumber || 'غير محدد'
        );
        const carType = this.cleanCSVField(message.carType || 'غير محدد');
        const carModel = this.cleanCSVField(message.carModel || 'غير محدد');
        const notes = this.cleanCSVField(message.additionalNotes || 'لا توجد ملاحظات');
        const utmSource = this.cleanCSVField(message.utm_source || 'غير محدد');
        const utmMedium = this.cleanCSVField(message.utm_medium || 'غير محدد');
        const utmCampaign = this.cleanCSVField(message.utm_campaign || 'غير محدد');
        const createdAt = this.formatDate(message.createdAt);

        csvContent += `"${fullName}","${phoneNumber}","${carType}","${carModel}","${notes}","${utmSource}","${utmMedium}","${utmCampaign}","${createdAt}"\n`;
      });
    } else {
      // Join messages CSV with Arabic headers
      csvContent =
        'الاسم,رقم الهاتف,البريد الإلكتروني,المنصب المطلوب,الخبرة السابقة,الرسالة,التاريخ\n';
      messages.forEach((message) => {
        // Clean and format data for CSV
        const fullName = this.cleanCSVField(message.fullName || 'غير محدد');
        const phoneNumber = this.cleanCSVField(
          message.phoneNumber || 'غير محدد'
        );
        const email = this.cleanCSVField(message.email || 'غير محدد');
        const position = this.cleanCSVField(message.jobPosition || 'غير محدد');
        const experience = this.cleanCSVField(message.experience || 'غير محدد');
        const messageText = this.cleanCSVField(
          message.additionalMessage || 'لا توجد رسالة'
        );
        const createdAt = this.formatDate(message.createdAt);

        csvContent += `"${fullName}","${phoneNumber}","${email}","${position}","${experience}","${messageText}","${createdAt}"\n`;
      });
    }

    // Add BOM (Byte Order Mark) for proper Arabic support in Excel
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Create blob with proper encoding
    const blob = new Blob([csvWithBOM], {
      type: 'text/csv;charset=utf-8;',
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${
        type === 'contact' ? 'رسائل_الاتصال' : 'رسائل_الانضمام'
      }_${this.getCurrentDate()}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    console.log(`✅ CSV exported successfully: ${type} messages`);
  }

  /**
   * Clean CSV field to prevent issues with quotes and commas
   */
  private cleanCSVField(field: string): string {
    if (!field) return '';

    // Remove quotes and escape them properly
    let cleaned = field.toString().replace(/"/g, '""');

    // Remove newlines and tabs
    cleaned = cleaned.replace(/[\r\n\t]/g, ' ');

    // Trim whitespace
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Format date for CSV export
   */
  private formatDate(dateString: string | Date): string {
    if (!dateString) return 'غير محدد';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'غير محدد';

      // Format as Gregorian (Christian) date in Arabic
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        calendar: 'gregory', // Use Gregorian calendar
      });
    } catch (error) {
      return 'غير محدد';
    }
  }

  /**
   * Get current date for filename
   */
  private getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}_${hour}-${minute}`;
  }

  // Refresh data manually
  refreshData(): void {
    console.log('🔄 Manually refreshing data...');
    this.loadDataFromAPI();
    this.loadDataFromLocalStorage();
  }

  // Helper methods to check data source
  isDataFromAPI(type: 'contact' | 'join'): boolean {
    return this.apiStatus[type] === 'success';
  }

  getDataSourceText(type: 'contact' | 'join'): string {
    const status = this.apiStatus[type];
    switch (status) {
      case 'success':
        return '✅ بيانات من API';
      case 'error':
        return '❌ خطأ في التحميل';
      case 'loading':
        return '⏳ جاري التحميل...';
      default:
        return '⏳ جاري التحميل...';
    }
  }

  /**
   * Get unique identifier for a message
   * @param message The message object
   * @returns A unique string identifier
   */
  private getMessageId(message: any): string {
    if (message && message.id) {
      return message.id;
    } else if (message && message._id) {
      return message._id;
    } else if (message && message.messageId) {
      return message.messageId;
    } else if (message && message.timestamp) {
      return message.timestamp.toString();
    } else if (message && message.createdAt) {
      return message.createdAt.toString();
    } else if (message && message.phoneNumber && message.fullName) {
      // Fallback: use combination of phone and name as ID
      return `${message.phoneNumber}-${message.fullName}`;
    } else {
      // Last resort: use JSON string as ID
      return JSON.stringify(message);
    }
  }

  // Selection management methods
  toggleMessageSelection(type: 'contact' | 'join', index: number): void {
    const selectedSet =
      type === 'contact'
        ? this.selectedContactMessages
        : this.selectedJoinMessages;

    if (selectedSet.has(index)) {
      selectedSet.delete(index);
    } else {
      selectedSet.add(index);
    }
  }

  isMessageSelected(type: 'contact' | 'join', index: number): boolean {
    const selectedSet =
      type === 'contact'
        ? this.selectedContactMessages
        : this.selectedJoinMessages;
    return selectedSet.has(index);
  }

  toggleSelectAll(type: 'contact' | 'join'): void {
    const selectedSet =
      type === 'contact'
        ? this.selectedContactMessages
        : this.selectedJoinMessages;
    const messages =
      type === 'contact' ? this.contactMessages : this.joinMessages;

    if (this.isAllSelected(type)) {
      selectedSet.clear();
    } else {
      for (let i = 0; i < messages.length; i++) {
        selectedSet.add(i);
      }
    }
  }

  isAllSelected(type: 'contact' | 'join'): boolean {
    const selectedSet =
      type === 'contact'
        ? this.selectedContactMessages
        : this.selectedJoinMessages;
    const messages =
      type === 'contact' ? this.contactMessages : this.joinMessages;

    return messages.length > 0 && selectedSet.size === messages.length;
  }

  isPartiallySelected(type: 'contact' | 'join'): boolean {
    const selectedSet =
      type === 'contact'
        ? this.selectedContactMessages
        : this.selectedJoinMessages;
    const messages =
      type === 'contact' ? this.contactMessages : this.joinMessages;

    return selectedSet.size > 0 && selectedSet.size < messages.length;
  }

  getSelectedCount(type: 'contact' | 'join'): number {
    const selectedSet =
      type === 'contact'
        ? this.selectedContactMessages
        : this.selectedJoinMessages;
    return selectedSet.size;
  }

  deleteSelectedMessages(type: 'contact' | 'join'): void {
    const selectedSet =
      type === 'contact'
        ? this.selectedContactMessages
        : this.selectedJoinMessages;
    const messages =
      type === 'contact' ? this.contactMessages : this.joinMessages;
    const deletedSet =
      type === 'contact'
        ? this.deletedContactMessages
        : this.deletedJoinMessages;

    if (selectedSet.size === 0) {
      alert('لم يتم تحديد أي رسائل للحذف');
      return;
    }

    // Log message structure for debugging
    console.log(`🔍 Debug: ${type} messages structure:`, messages);
    console.log(`🔍 Debug: Selected indices:`, Array.from(selectedSet));

    if (messages.length > 0) {
      console.log(`🔍 Debug: First message structure:`, messages[0]);
      console.log(`🔍 Debug: Message keys:`, Object.keys(messages[0]));
    }

    const confirmMessage = `هل أنت متأكد من حذف ${selectedSet.size} رسالة محددة؟\n\nهذا الإجراء لا يمكن التراجع عنه.`;

    if (confirm(confirmMessage)) {
      // Get selected message IDs or use indices as fallback
      const selectedIds: string[] = [];
      const selectedIndices = Array.from(selectedSet).sort((a, b) => b - a); // Sort in descending order

      selectedIndices.forEach((index) => {
        const message = messages[index];
        console.log(`🔍 Debug: Processing message at index ${index}:`, message);

        // Get unique identifier for the message
        const messageId = this.getMessageId(message);
        selectedIds.push(messageId);
        console.log(`✅ Using message ID: ${messageId}`);

        // Add to deleted set for local filtering
        deletedSet.add(messageId);
      });

      // Try to delete from backend first
      this.adminMessagesService.deleteMessages(type, selectedIds).subscribe({
        next: (response) => {
          console.log(
            `✅ Successfully deleted ${selectedIds.length} ${type} messages:`,
            response
          );

          // Remove deleted messages from local arrays
          selectedIndices.forEach((index) => {
            if (type === 'contact') {
              this.contactMessages.splice(index, 1);
            } else {
              this.joinMessages.splice(index, 1);
            }
          });

          // Clear selection
          selectedSet.clear();

          // Save to localStorage
          this.saveDataToLocalStorage();

          alert(`✅ تم حذف ${selectedIds.length} رسالة بنجاح من الباك إند`);
        },
        error: (error) => {
          console.error(
            `❌ Error deleting ${type} messages from backend:`,
            error
          );
          console.log(`⚠️ Falling back to local deletion`);

          // Remove deleted messages from local arrays
          selectedIndices.forEach((index) => {
            if (type === 'contact') {
              this.contactMessages.splice(index, 1);
            } else {
              this.joinMessages.splice(index, 1);
            }
          });

          // Clear selection
          selectedSet.clear();

          // Save to localStorage
          this.saveDataToLocalStorage();

          alert(
            `⚠️ تم حذف ${selectedIds.length} رسالة من الواجهة فقط (فشل الاتصال بالباك إند)`
          );
        },
      });
    }
  }

  /**
   * Reset deleted messages tracking (for testing purposes)
   */
  resetDeletedMessages(type: 'contact' | 'join'): void {
    if (type === 'contact') {
      this.deletedContactMessages.clear();
    } else {
      this.deletedJoinMessages.clear();
    }
    console.log(`🔄 Reset deleted ${type} messages tracking`);

    // Save to localStorage
    this.saveDataToLocalStorage();

    // Reload data to show previously deleted messages
    this.refreshData();
  }

  /**
   * Get count of deleted messages
   */
  getDeletedCount(type: 'contact' | 'join'): number {
    const deletedSet =
      type === 'contact'
        ? this.deletedContactMessages
        : this.deletedJoinMessages;
    return deletedSet.size;
  }

  /**
   * Check if message has CV file
   */
  hasCV(message: any): boolean {
    return !!(
      message.cvFileName ||
      message.cvPath ||
      message.cvFile ||
      message.cv ||
      message.cvUrl
    );
  }

  /**
   * Decode corrupted Arabic text
   */
  private decodeArabicText(text: string): string {
    if (!text) return text;

    try {
      // Try to decode from Latin-1 to UTF-8
      const decoded = decodeURIComponent(escape(text));
      return decoded;
    } catch (error) {
      // If decoding fails, return original text
      console.warn('Failed to decode Arabic text:', text);
      return text;
    }
  }

  /**
   * Get decoded text for display (supports Arabic)
   */
  getDecodedText(text: string, fallback: string = 'غير محدد'): string {
    if (!text) return fallback;
    return this.decodeArabicText(text);
  }

  /**
   * Get CV file name for display
   */
  getCVFileName(message: any): string {
    let fileName = '';

    // Check for cvFileName from database
    if (message.cvFileName) {
      fileName = message.cvFileName;
    }
    // Check for cvPath from database
    else if (message.cvPath) {
      fileName = message.cvPath.split('/').pop() || 'CV.pdf';
    }
    // Legacy support for old format
    else if (message.cvFile && message.cvFile.name) {
      fileName = message.cvFile.name;
    } else if (message.cv && message.cv.name) {
      fileName = message.cv.name;
    } else if (message.cvUrl) {
      // Extract filename from URL
      const url = new URL(message.cvUrl);
      const pathname = url.pathname;
      fileName = pathname.split('/').pop() || 'CV.pdf';
    } else {
      fileName = 'CV.pdf';
    }

    // Decode Arabic text if corrupted
    return this.decodeArabicText(fileName);
  }

  /**
   * Download CV file for a join message
   */
  downloadCV(message: any): void {
    console.log('📥 Downloading CV for message:', message);

    // Check for cvPath from database first
    if (message.cvPath) {
      // Construct full URL for download
      const baseUrl = 'https://royal-nano-backend.vercel.app';
      const fullUrl = baseUrl + message.cvPath;
      this.downloadFromURL(fullUrl, this.getCVFileName(message));
    }
    // Legacy support for old format
    else if (message.cvFile && message.cvFile instanceof File) {
      // Download local file
      this.downloadLocalFile(message.cvFile);
    } else if (message.cv && message.cv instanceof File) {
      // Download from cv field
      this.downloadLocalFile(message.cv);
    } else if (message.cvUrl) {
      // Download from URL
      this.downloadFromURL(message.cvUrl, this.getCVFileName(message));
    } else {
      console.error('❌ No CV file or URL found');
      alert('لا يمكن العثور على ملف CV للتحميل');
    }
  }

  /**
   * Download local file
   */
  private downloadLocalFile(file: File): void {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ Local CV file downloaded:', file.name);
  }

  /**
   * Download file from URL
   */
  private downloadFromURL(url: string, filename: string): void {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
