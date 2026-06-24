import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResellersService } from '../../shared/services/resellers.service';
import { AdminBranchesService } from '../../shared/services/admin-branches.service';
import { ToastrService } from 'ngx-toastr';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-admin-branches',
    templateUrl: './admin-branches.component.html',
    styleUrls: ['./admin-branches.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        MatChipsModule,
        MatToolbarModule,
        MatTooltipModule
    ],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-10px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class AdminBranchesComponent implements OnInit {
    allBranches: any[] = [];
    filteredBranches: any[] = [];
    searchTerm: string = '';
    showForm: boolean = false;
    isEditing: boolean = false;
    currentBranch: any = { branchName: '', branchCode: '', city: '', country: 'Egypt', isActive: true, agentId: '' };
    resellersList: any[] = [];
    displayedColumns: string[] = ['status', 'branchCode', 'branchName', 'city', 'agentId', 'country', 'actions'];

    constructor(
        private resellersService: ResellersService,
        private adminBranchesService: AdminBranchesService,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.loadBranches();
        this.resellersList = this.resellersService.getResellers();
    }

    loadBranches() {
        this.adminBranchesService.getBranches().subscribe({
            next: (res: any) => {
                console.log('Branches API Response:', res);
                if (Array.isArray(res)) {
                    this.allBranches = res;
                } else if (res.data && Array.isArray(res.data)) {
                    this.allBranches = res.data;
                } else if (res.branches && Array.isArray(res.branches)) {
                    this.allBranches = res.branches;
                } else {
                    this.allBranches = [];
                    console.warn('Unknown response structure', res);
                }
                this.filterBranches();
            },
            error: (err) => {
                this.toastr.error('Failed to load branches');
                console.error(err);
            }
        });
    }

    filterBranches() {
        if (!this.searchTerm) {
            this.filteredBranches = this.allBranches;
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredBranches = this.allBranches.filter(b =>
                (b.branchName && b.branchName.toLowerCase().includes(term)) ||
                (b.branchCode && b.branchCode.toLowerCase().includes(term)) ||
                (b.city && b.city.toLowerCase().includes(term)) ||
                (b.agentId && b.agentId.toLowerCase().includes(term))
            );
        }
    }

    openAddForm() {
        this.isEditing = false;
        this.currentBranch = { branchName: '', branchCode: '', city: '', country: 'Egypt', isActive: true, agentId: '' };
        this.showForm = true;
    }

    editBranch(branch: any) {
        this.isEditing = true;
        this.currentBranch = { ...branch };
        this.showForm = true;
    }

    cancelForm() {
        this.showForm = false;
    }

    saveBranch() {
        if (!this.currentBranch.branchName || !this.currentBranch.branchCode) {
            this.toastr.warning('Please fill all required fields', 'Validation');
            return;
        }

        const payload = {
            branchName: this.currentBranch.branchName,
            branchCode: this.currentBranch.branchCode,
            city: this.currentBranch.city,
            country: this.currentBranch.country || 'Egypt',
            agentId: this.currentBranch.agentId || 'DEFAULT-AGENT',
            isActive: this.currentBranch.isActive
        };

        if (this.isEditing) {
            this.adminBranchesService.updateBranch(this.currentBranch._id || this.currentBranch.id, payload).subscribe({
                next: () => {
                    this.toastr.success('Branch Updated Successfully', 'Success');
                    this.showForm = false;
                    this.loadBranches();
                },
                error: (err) => this.toastr.error(err.error?.message || 'Update failed')
            });
        } else {
            this.adminBranchesService.createBranch(payload).subscribe({
                next: () => {
                    this.toastr.success('Branch Added Successfully', 'Success');
                    this.showForm = false;
                    this.loadBranches();
                },
                error: (err) => this.toastr.error(err.error?.message || 'Creation failed')
            });
        }
    }

    toggleActive(branch: any) {
        const newStatus = !branch.isActive;
        branch.isActive = newStatus; // Optimistic
        this.adminBranchesService.toggleBranchStatus(branch._id || branch.id, newStatus).subscribe({
            next: () => this.toastr.success(`Branch ${newStatus ? 'Enabled' : 'Disabled'}`),
            error: () => {
                branch.isActive = !newStatus; // Revert
                this.toastr.error('Failed to update status');
            }
        });
    }
}
