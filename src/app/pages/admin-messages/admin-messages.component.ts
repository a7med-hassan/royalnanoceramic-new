import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminMessagesService } from '../../shared/services/admin-messages.service';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule],
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

  constructor(private adminMessagesService: AdminMessagesService) {}

  ngOnInit(): void {
    // Load data from API only
    this.loadDataFromAPI();
  }

  private loadDataFromAPI(): void {
    console.log('🔄 Loading data from API...');

    // Load contact messages
    this.isLoadingContact = true;
    this.contactError = '';
    this.adminMessagesService.getContactMessages().subscribe({
      next: (messages: any[]) => {
        console.log('📥 Contact messages from API:', messages);
        console.log('📊 Messages type:', typeof messages);
        console.log(
          '📊 Messages length:',
          messages ? messages.length : 'undefined'
        );
        console.log('📊 Is array:', Array.isArray(messages));

        if (messages && Array.isArray(messages) && messages.length > 0) {
          this.contactMessages = messages;
          this.apiStatus.contact = 'success';
          console.log(
            '✅ Contact messages loaded successfully:',
            this.contactMessages
          );
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
        console.log('📥 Join messages from API:', messages);
        console.log('📊 Messages type:', typeof messages);
        console.log(
          '📊 Messages length:',
          messages ? messages.length : 'undefined'
        );
        console.log('📊 Is array:', Array.isArray(messages));

        if (messages && Array.isArray(messages) && messages.length > 0) {
          this.joinMessages = messages;
          this.apiStatus.join = 'success';
          console.log(
            '✅ Join messages loaded successfully:',
            this.joinMessages
          );
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
      // Contact messages CSV
      csvContent =
        'الاسم,رقم الهاتف,نوع السيارة,موديل السيارة,ملاحظات إضافية,التاريخ\n';
      messages.forEach((message) => {
        csvContent += `"${message.fullName || ''}","${
          message.phoneNumber || ''
        }","${message.carType || ''}","${message.carModel || ''}","${
          message.notes || ''
        }","${message.createdAt || ''}"\n`;
      });
    } else {
      // Join messages CSV
      csvContent =
        'الاسم,رقم الهاتف,البريد الإلكتروني,المنصب المطلوب,الخبرة السابقة,الرسالة,التاريخ\n';
      messages.forEach((message) => {
        csvContent += `"${message.fullName || ''}","${
          message.phoneNumber || ''
        }","${message.email || ''}","${message.position || ''}","${
          message.experience || ''
        }","${message.message || ''}","${message.createdAt || ''}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${type === 'contact' ? 'contact' : 'join'}_messages.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Add test API button
  testAPI(): void {
    console.log('🧪 Testing API connection...');

    // Test health check
    this.adminMessagesService.healthCheck().subscribe({
      next: (response) => {
        console.log('✅ Health check successful:', response);
        alert(
          '✅ API يعمل بشكل صحيح!\n\nالبيانات: ' +
            JSON.stringify(response, null, 2)
        );
      },
      error: (error) => {
        console.error('❌ Health check failed:', error);
        alert(
          `❌ API لا يعمل!\n\nالخطأ: ${error.message}\n\nالحالة: ${error.status}`
        );
      },
    });
  }

  // Test direct connection to backend
  testDirectConnection(): void {
    console.log('🧪 Testing direct connection to backend...');

    const backendUrl = 'https://royal-nano-backend.vercel.app';
    const healthUrl = `${backendUrl}/api/health`;

    console.log('🔗 Testing URL:', healthUrl);

    // Test with fetch API
    fetch(healthUrl)
      .then((response) => {
        console.log('📡 Fetch response:', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });

        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      })
      .then((data) => {
        console.log('✅ Direct connection successful:', data);
        alert(
          '✅ الاتصال المباشر يعمل!\n\nالبيانات: ' +
            JSON.stringify(data, null, 2)
        );
      })
      .catch((error) => {
        console.error('❌ Direct connection failed:', error);
        alert(
          `❌ الاتصال المباشر فشل!\n\nالخطأ: ${error.message}\n\n` +
            `جرب فتح هذا الرابط في المتصفح:\n${healthUrl}`
        );
      });
  }

  // Test HttpClient specifically
  testHttpClient(): void {
    console.log('🧪 Testing HttpClient connection...');

    // Test through AdminMessagesService
    this.adminMessagesService.testConnection().subscribe({
      next: (response) => {
        console.log('✅ HttpClient test successful:', response);
        alert(
          '✅ HttpClient يعمل بشكل صحيح!\n\nالاستجابة: ' +
            JSON.stringify(response, null, 2)
        );
      },
      error: (error) => {
        console.error('❌ HttpClient test failed:', error);
        alert(
          `❌ HttpClient لا يعمل!\n\nالخطأ: ${error.message}\n\n` +
            `الحالة: ${error.status || 'غير محدد'}`
        );
      },
    });
  }

  // Test form submission
  testFormSubmission(): void {
    console.log('🧪 Testing form submission...');

    // Test contact form
    const testContactData = {
      fullName: 'اختبار API',
      phoneNumber: '0123456789',
      carType: 'سيدان',
      carModel: '2024',
      notes: 'هذا اختبار للتحقق من عمل API',
    };

    console.log('📤 Testing contact form with data:', testContactData);

    this.adminMessagesService.submitContactForm(testContactData).subscribe({
      next: (response) => {
        console.log('✅ Contact form test successful:', response);
        alert(
          '✅ نموذج الاتصال يعمل!\n\nالاستجابة: ' +
            JSON.stringify(response, null, 2)
        );

        // Refresh data after successful submission
        setTimeout(() => {
          this.refreshData();
        }, 1000);
      },
      error: (error) => {
        console.error('❌ Contact form test failed:', error);
        alert(
          `❌ نموذج الاتصال لا يعمل!\n\nالخطأ: ${error.message}\n\nالحالة: ${error.status}`
        );
      },
    });
  }

  // Test join form submission
  testJoinFormSubmission(): void {
    console.log('🧪 Testing join form submission...');

    // Test join form
    const testJoinData = {
      fullName: 'اختبار API',
      phoneNumber: '0123456789',
      email: 'test@api.com',
      position: 'مطور',
      experience: '5 سنوات',
      message: 'هذا اختبار للتحقق من عمل API',
    };

    console.log('📤 Testing join form with data:', testJoinData);

    this.adminMessagesService.submitJoinForm(testJoinData).subscribe({
      next: (response) => {
        console.log('✅ Join form test successful:', response);
        alert(
          '✅ نموذج الانضمام يعمل!\n\nالاستجابة: ' +
            JSON.stringify(response, null, 2)
        );

        // Refresh data after successful submission
        setTimeout(() => {
          this.refreshData();
        }, 1000);
      },
      error: (error) => {
        console.error('❌ Join form test failed:', error);
        alert(
          `❌ نموذج الانضمام لا يعمل!\n\nالخطأ: ${error.message}\n\nالحالة: ${error.status}`
        );
      },
    });
  }

  // Refresh data manually
  refreshData(): void {
    console.log('🔄 Manually refreshing data...');
    this.loadDataFromAPI();
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
}
