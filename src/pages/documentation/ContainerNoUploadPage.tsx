import { DocumentationUploadPage } from '@/features/documentation/components/DocumentationUploadPage';

export default function ContainerNoUploadPage() {
  return (
    <DocumentationUploadPage
      title="Container No. Upload"
      uploadType="container-numbers"
      description="Upload container numbers from the standard Excel template."
    />
  );
}
