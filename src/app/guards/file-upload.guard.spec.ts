import { TestBed, async, inject } from '@angular/core/testing';

import { FileUploadGuard } from './file-upload.guard';

describe('FileUploadGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileUploadGuard]
    });
  });

  it('should ...', inject([FileUploadGuard], (guard: FileUploadGuard) => {
    expect(guard).toBeTruthy();
  }));
});
