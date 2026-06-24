import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SerialService } from './../../shared/services/serials.service';
import { BranchesService } from './../../shared/services/branches.service';
import { Serial } from './../../shared/interfaces/serial';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { TableUtil } from '../../shared/utils/tableUtil';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-serials',
  templateUrl: './serials.component.html',
  styleUrls: ['./serials.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
})
export class SerialsComponent implements OnInit, AfterViewInit {
  // Columns to display in the table
  displayedColumns: string[] = [
    'productCode',
    'internalSerial',
    'numOfChecks',
    'branch',
    'activated',
    'action',
  ];
  // Data source for the table (mat-table)
  dataSource = new MatTableDataSource<Serial>([]);

  // Form for serials
  serialForm: FormGroup;
  paginatorNumbers: number[] = [10, 30];
  branches: any[] = [
    { branchCode: 'Mohandsen', branchName: 'Mohandsen' },
    { branchCode: 'Tanta', branchName: 'Tanta' },
    { branchCode: 'October', branchName: 'October' },
    { branchCode: 'Madinet Nasr', branchName: 'Madinet Nasr' },
    { branchCode: 'Alexandria', branchName: 'Alexandria' },
    { branchCode: 'Mansoura', branchName: 'Mansoura' },
    { branchCode: 'Zagazig', branchName: 'Zagazig' },
    { branchCode: 'Sohag', branchName: 'Sohag' }
  ];

  // Search and filter properties
  searchText: string = '';
  activationFilter: string = 'all'; // 'all', 'activated', 'not_activated'
  allSerials: Serial[] = []; // Store all serials for filtering

  // Pagination related properties
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private SerialService: SerialService,
    private branchesService: BranchesService,
    private FormBuilder: FormBuilder,
    private toastr: ToastrService
  ) {
    this.serialForm = this.FormBuilder.group({
      productCode: ['', [Validators.required]],
      internalSerial: ['', [Validators.required]],
      branch: ['', [Validators.required]],
    });
  }

  branchUpdateForm: FormGroup = this.FormBuilder.group({
    branch: ['', [Validators.required]],
  });

  ngOnInit(): void {
    /*
    // Fetch branches
    this.branchesService.getBranches().subscribe({
      next: (res) => {
        if (res.success) {
          this.branches = res.branches;
        }
      },
      error: (err) => console.error('Error fetching branches:', err)
    });
    */

    // Fetch serials on component load
    this.SerialService.getSerials().subscribe({
      next: (res) => {
        // Store all serials for filtering
        this.allSerials = res.serials;
        // Setting the fetched serials in the data source
        this.dataSource.data = res.serials;
        if (res.serials.length > 30) {
          this.paginatorNumbers = [10, 30, res.serials.length];
        }
      },
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Method to add a serial using the serialForm
  addSerial(): void {
    if (this.serialForm.valid) {
      this.SerialService.addSerial(this.serialForm.value).subscribe({
        next: (res) => {
          this.allSerials = res.serials; // Update all serials
          this.applyFilters(); // Apply current filters
          this.toastr.success('Serial added successfully');
          this.serialForm.reset(); // Clear the form
        },
        error: (err) => {
          this.toastr.warning('Serial Already exists in database');
        },
      });
    } else {
      this.serialForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }

  // Method to delete a serial
  deleteSerial(serialNum: string): void {
    this.SerialService.deleteSerial(serialNum).subscribe({
      next: (res) => {
        if (res.msg == 'success') {
          this.allSerials = res.serial; // Update all serials
          this.applyFilters(); // Apply current filters
        }
      },
    });
  }

  // Export data to Excel (method from TableUtil)
  exportData(): void {
    TableUtil.exportTableToExcel('serials', 'serials');
  }

  UpdateBranch(serial: string) {
    this.branchUpdateForm.value.serialNumber = serial;
    this.SerialService.updateBranch(this.branchUpdateForm.value).subscribe({
      next: (res) => {
        console.log('Branch successfully updated');
        this.allSerials = res.serials;
        this.applyFilters();
        this.branchUpdateForm.reset();
      },
    });
  }

  // Search and filter methods
  applySearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchText = filterValue.trim().toLowerCase();
    this.applyFilters();
  }

  onActivationFilterChange(value: string): void {
    this.activationFilter = value;
    this.applyFilters();
  }

  applyFilters(): void {
    let filteredData = [...this.allSerials];

    // Apply search filter
    if (this.searchText) {
      filteredData = filteredData.filter((serial) => {
        const productCode = serial.productCode?.toLowerCase() || serial.serialNumber?.toLowerCase() || '';
        const internalSerial = serial.internalSerial?.toLowerCase() || '';
        const branch = serial.branch?.toLowerCase() || '';
        const numOfChecks = serial.numOfChecks?.toString() || '';

        return (
          productCode.includes(this.searchText) ||
          internalSerial.includes(this.searchText) ||
          branch.includes(this.searchText) ||
          numOfChecks.includes(this.searchText)
        );
      });
    }

    // Apply activation filter
    if (this.activationFilter === 'activated') {
      filteredData = filteredData.filter((serial) => serial.activated === true);
    } else if (this.activationFilter === 'not_activated') {
      filteredData = filteredData.filter((serial) => serial.activated === false);
    }

    // Update data source
    this.dataSource.data = filteredData;

    // Reset paginator to first page
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.searchText = '';
    this.activationFilter = 'all';
    this.dataSource.data = this.allSerials;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }
}
