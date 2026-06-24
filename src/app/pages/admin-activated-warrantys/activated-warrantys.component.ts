import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SerialService } from '../../shared/services/serials.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { TableUtil } from '../../shared/utils/tableUtil';

@Component({
  selector: 'app-activated-warrantys',
  templateUrl: './activated-warrantys.component.html',
  styleUrls: ['./activated-warrantys.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule
  ],
})
export class ActivatedWarrantysComponent implements OnInit, AfterViewInit {
  activeTab: 'film' | 'nano' = 'film';

  filmColumns: string[] = ['name', 'phoneNumber', 'serialNumber', 'model', 'image', 'action'];
  nanoColumns: string[] = [
    'name', 'phoneNumber', 'serialNumber', 'address', 'birthdate',
    'createdAt', 'brand', 'model', 'color', 'otp', 'image', 'action'
  ];

  displayedColumns: string[] = this.filmColumns;
  dataSource = new MatTableDataSource<any>([]);

  activatedWarrantys: any[] = [];
  nanoWarrantys: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private SerialService: SerialService) { }

  ngOnInit(): void {
    this.loadFilmWarrantys();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadFilmWarrantys() {
    this.SerialService.getActivatedWarrantys().subscribe({
      next: (res) => {
        // Map to ensure imagePath exists
        this.activatedWarrantys = (res.warrantys || []).map((item: any) => ({
          ...item,
          imagePath: item.image || item.imagePath
        }));
        if (this.activeTab === 'film') this.updateTableData(this.activatedWarrantys);
      }
    });
  }

  loadNanoWarrantys() {
    this.SerialService.getNanoWarranties().subscribe({
      next: (res) => {
        const data = res.data || res || [];
        // Map Nano data
        this.nanoWarrantys = data.map((item: any) => ({
          ...item,
          serialNumber: item.internalSerial || item.serialNumber || item.productCode,
          imagePath: item.image || item.imagePath
        }));
        if (this.activeTab === 'nano') this.updateTableData(this.nanoWarrantys);
      }
    });
  }

  switchTab(tab: 'film' | 'nano') {
    this.activeTab = tab;
    // Update columns or filter if needed
    if (tab === 'film') {
      this.displayedColumns = this.filmColumns;
      if (this.activatedWarrantys.length === 0) this.loadFilmWarrantys();
      else this.updateTableData(this.activatedWarrantys);
    } else {
      this.displayedColumns = this.nanoColumns;
      if (this.nanoWarrantys.length === 0) this.loadNanoWarrantys();
      else this.updateTableData(this.nanoWarrantys);
    }
  }

  updateTableData(data: any[]) {
    this.dataSource.data = data;
    // Re-assign paginator/sort to ensure they work with new data
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
  }

  getImgPath(path: string | undefined): string {
    if (!path) return 'assets/no-img.png'; // Make sure you have this placeholder or handle logic
    if (path.startsWith('http')) return path; // Already full URL
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `https://royal-shield-world.up.railway.app/${cleanPath}`;
  }

  deleteActivation(serial: any) {
    if (this.activeTab === 'film') {
      // Assuming serial is the unique ID for film
      this.SerialService.deleteActivation(serial.serialNumber || serial).subscribe({
        next: () => this.loadFilmWarrantys()
      });
    } else {
      // Nano
      this.SerialService.deleteNanoWarranty(serial._id).subscribe({
        next: () => this.loadNanoWarrantys()
      });
    }
  }

  exportData(): void {
    TableUtil.exportTableToExcel(
      'activatedWarrantysTable',
      this.activeTab === 'film' ? 'ProtectionFilmWarranties' : 'NanoWarranties'
    );
  }

  openImgTap(url: string) {
    window.open(url, '_blank');
  }
}
