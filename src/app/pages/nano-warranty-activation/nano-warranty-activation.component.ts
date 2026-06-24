import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BranchOtpService } from '../../shared/services/branch-otp.service';
import { NanoWarrantyService } from '../../shared/services/nano-warranty.service';
import { UploadService } from '../../shared/services/upload.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-nano-warranty-activation',
    templateUrl: './nano-warranty-activation.component.html',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ]
})
export class NanoWarrantyActivationComponent {
    otpForm: FormGroup;
    verifyForm: FormGroup;
    activationForm: FormGroup;

    requestId: string = '';
    verifiedToken: string = '';
    branchName: string = '';

    isLoading = false;
    errorMessage = '';
    successMessage = '';
    activatedSerial = '';

    selectedFile: File | null = null;
    imagePreview: string | null = null;

    constructor(
        private fb: FormBuilder,
        private branchOtpService: BranchOtpService,
        private nanoWarrantyService: NanoWarrantyService,
        private uploadService: UploadService
    ) {
        this.otpForm = this.fb.group({
            branchCode: ['', Validators.required]
        });

        this.verifyForm = this.fb.group({
            otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
        });

        this.activationForm = this.fb.group({
            name: ['', Validators.required],
            phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9+]+$')]],
            email: ['', [Validators.email]],
            brand: [''],
            model: [''],
            color: [''],
            plateNumber: [''],
            productCode: [''], // Optional if needed
            image: [null, Validators.required]
        });
    }

    // Step 1: Request OTP
    requestOtp() {
        if (this.otpForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';

        const branchCode = this.otpForm.get('branchCode')?.value;

        this.branchOtpService.requestOtp(branchCode).subscribe({
            next: (res) => {
                this.isLoading = false;
                if (res.success) {
                    this.requestId = res.requestId;
                    this.branchName = res.branchName;
                    // Move to next step (handled by stepper in HTML usually, or manually)
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Error requesting OTP';
            }
        });
    }

    // Step 2: Verify OTP
    verifyOtp() {
        if (this.verifyForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';

        const otp = this.verifyForm.get('otp')?.value;

        this.branchOtpService.verifyOtp(this.requestId, otp).subscribe({
            next: (res) => {
                this.isLoading = false;
                if (res.success) {
                    this.verifiedToken = res.verifiedToken;
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Invalid OTP';
            }
        });
    }

    // Step 3: Activation
    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.activationForm.patchValue({ image: file });
            this.activationForm.get('image')?.updateValueAndValidity();

            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    submitActivation() {
        if (this.activationForm.invalid) return;

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        // 1. Upload Image First
        if (this.selectedFile) {
            this.uploadService.uploadImage(this.selectedFile).subscribe({
                next: (uploadRes: any) => {
                    if (uploadRes.path || uploadRes.imagePath) {
                        const imagePath = uploadRes.path || uploadRes.imagePath;
                        this.processActivation(imagePath);
                    } else {
                        // Fallback if backend returns something else or direct activation was intended
                        // But based on analysis, we need a path.
                        this.isLoading = false;
                        this.errorMessage = 'Image upload failed: No path returned.';
                    }
                },
                error: (err) => {
                    this.isLoading = false;
                    this.errorMessage = 'Failed to upload image. Please try again.';
                    console.warn('Upload error:', err);

                    // FALLBACK: Try direct activation in case /api/upload is missing but /activate handles it?
                    // Given the backend code reference, this is unlikely to work, but we can try if upload 404s.
                    // For now, fail hard to prompt backend fix.
                }
            });
        } else {
            // No image? Form validator should prevent this, but just in case
            this.errorMessage = 'Please select an image.';
            this.isLoading = false;
        }
    }

    private processActivation(imagePath: string) {
        // 2. Prepare Payload
        const payload = {
            ...this.activationForm.value,
            imagePath: imagePath, // Use the path from upload
            // Backend expects 'productCode' which is the branch code? 
            // In model: productCode: { type: String, required: true } // The Branch Code used
            productCode: this.otpForm.get('branchCode')?.value,
            otp: this.verifyForm.get('otp')?.value
        };

        // Remove raw image file from payload
        delete payload.image;

        // 3. Call Activate
        this.nanoWarrantyService.activateWarranty(payload, this.verifiedToken).subscribe({
            next: (res) => {
                this.isLoading = false;
                if (res.success) {
                    this.successMessage = 'Warranty Activated Successfully!';
                    this.activatedSerial = res.serial;
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Activation failed';
            }
        });
    }
}
